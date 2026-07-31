import type { BgmTrackKey } from '../../types/audio'
import {
  BGM_FADE_MS,
  BGM_FADE_STEP_MS,
  DEFAULT_MASTER_VOLUME,
  getBgmTrack,
} from '../../data/audioTracks'

/**
 * BGM 播放器（A01 / A02）。
 *
 * 全局唯一的音频状态所有者。页面组件不碰 Audio，只声明「当前场景是哪一首」，
 * 由这里决定要不要新建实例、要不要淡入淡出、要不要停。
 *
 * 三条硬性约束：
 * 1. 同一时刻最多两个 Audio 实例：正在播的一首 + 正在淡出的一首。
 *    连续换曲时，还没淡完的旧实例会被直接停掉，不排队堆积。
 * 2. 曲目键没变就什么都不做：不 new Audio、不改 src、不 load、不重置 currentTime，
 *    因此同章内换节点、分支汇流、第五章后半进结局页都是连续播放。
 * 3. 任何失败都只影响声音。play() 被拒绝、文件 404、解码失败都静默降级为无声，
 *    不抛错、不重试到阻塞、不显示任何界面提示。
 *
 * 状态全部由外部声明式传入（`sync`），播放器自己只额外持有一个「页面是否隐藏」，
 * 因为那是它自己订阅的浏览器事件。这样 React Strict Mode 下卸载重建后，
 * 新实例会被重新 sync 成完全一样的状态，不需要在实例之间传递任何东西。
 */

/** 外部声明的期望状态。播放器不保存任何由它推导出来的额外状态。 */
export type BgmRequest = {
  /** 当前场景应播放的曲目；null 表示这个画面就该安静。 */
  track: BgmTrackKey | null
  /** 全局静音。静音时立即停止，不淡出。 */
  muted: boolean
  /** 主音量 0–1。 */
  masterVolume: number
  /** 是否已经过首次用户手势解锁。未解锁时一个实例都不创建。 */
  unlocked: boolean
}

export type BgmPlayerHandle = {
  /** 声明最新的期望状态；幂等，重复调用不会重启当前曲目。 */
  sync: (request: BgmRequest) => void
  /** 在用户手势里解锁并立即开始播放当前场景的曲目。 */
  unlock: () => void
  /** 停掉全部声音、清掉全部 timer 与监听。之后所有调用都是空操作。 */
  dispose: () => void
}

type FadeIn = { audio: HTMLAudioElement; target: number; step: number }
type FadeOut = { audio: HTMLAudioElement; step: number }

const INITIAL_REQUEST: BgmRequest = {
  track: null,
  muted: false,
  masterVolume: DEFAULT_MASTER_VOLUME,
  unlocked: false,
}

/** 每一步的音量变化比例；至少留一点，避免起始音量极小时永远淡不完。 */
const FADE_RATIO = BGM_FADE_STEP_MS / BGM_FADE_MS
const MIN_FADE_STEP = 0.01

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0

  return Math.min(1, Math.max(0, value))
}

let warned = false

/** 音频失败只提示一次：反复 warn 会把控制台刷满，而它并不影响游玩。 */
function warnOnce(detail: string) {
  if (warned) return
  warned = true
  console.warn(`[audio] 背景音乐不可用，本次会话静默降级为无声：${detail}`)
}

export function createBgmPlayer(): BgmPlayerHandle {
  let request: BgmRequest = { ...INITIAL_REQUEST }
  let hidden = typeof document !== 'undefined' && document.hidden === true

  /** 正在播放（或正在尝试播放）的实例。 */
  let currentAudio: HTMLAudioElement | null = null
  let currentKey: BgmTrackKey | null = null

  let fadeIn: FadeIn | null = null
  let fadeOut: FadeOut | null = null
  let fadeTimer: ReturnType<typeof setInterval> | null = null

  let disposed = false

  function trackVolume(key: BgmTrackKey): number {
    return clampVolume(clampVolume(request.masterVolume) * getBgmTrack(key).gain)
  }

  /**
   * 彻底释放一个实例。
   *
   * 除了 pause，还要断开 src 并 load 一次，否则已经开始的网络请求与解码
   * 会继续占着资源；顺手清掉 onerror，不留悬挂的回调。
   */
  function release(audio: HTMLAudioElement) {
    audio.onerror = null

    try {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    } catch {
      // 释放失败没有补救手段，也不影响任何功能。
    }
  }

  function releaseCurrent() {
    if (fadeIn && currentAudio && fadeIn.audio === currentAudio) fadeIn = null
    if (currentAudio) release(currentAudio)

    currentAudio = null
    currentKey = null
  }

  function releaseFadeOut() {
    if (!fadeOut) return

    release(fadeOut.audio)
    fadeOut = null
  }

  function clearFadeTimer() {
    if (fadeTimer === null) return

    clearInterval(fadeTimer)
    fadeTimer = null
  }

  function ensureFadeTimer() {
    if (fadeTimer !== null || disposed) return

    fadeTimer = setInterval(stepFade, BGM_FADE_STEP_MS)
  }

  function stepFade() {
    if (fadeIn) {
      const next = Math.min(fadeIn.target, fadeIn.audio.volume + fadeIn.step)

      fadeIn.audio.volume = clampVolume(next)

      if (next >= fadeIn.target) fadeIn = null
    }

    if (fadeOut) {
      const next = fadeOut.audio.volume - fadeOut.step

      if (next <= 0) {
        releaseFadeOut()
      } else {
        fadeOut.audio.volume = clampVolume(next)
      }
    }

    if (!fadeIn && !fadeOut) clearFadeTimer()
  }

  /**
   * 开始播放。
   *
   * play() 既可能同步抛错，也可能返回一个被拒绝的 Promise（自动播放策略、
   * 加载失败都走这条路）。两种都当作「这一首放不了」处理。
   *
   * 回调里先确认这个实例仍然是当前实例：期间可能已经换曲、静音或卸载，
   * 迟到的失败回调绝不能把新状态改回去。
   */
  function startPlayback(audio: HTMLAudioElement) {
    try {
      const result = audio.play()

      if (result && typeof result.catch === 'function') {
        result.catch((error: unknown) => {
          if (disposed || currentAudio !== audio) return

          warnOnce(error instanceof Error ? error.message : String(error))
          releaseCurrent()
        })
      }
    } catch (error) {
      if (currentAudio !== audio) return

      warnOnce(error instanceof Error ? error.message : String(error))
      releaseCurrent()
    }
  }

  function startFadeOut() {
    if (!currentAudio) return

    const audio = currentAudio

    if (fadeIn && fadeIn.audio === audio) fadeIn = null
    currentAudio = null
    currentKey = null

    // 已经无声或根本没播起来的实例没必要淡出，直接扔掉。
    if (audio.paused || audio.volume <= 0) {
      release(audio)
      return
    }

    // 上一首还没淡完就又换曲：直接停掉它，保证同时最多两个实例。
    releaseFadeOut()

    fadeOut = { audio, step: Math.max(audio.volume * FADE_RATIO, MIN_FADE_STEP) }
    ensureFadeTimer()
  }

  function startTrack(key: BgmTrackKey) {
    const track = getBgmTrack(key)
    const audio = new Audio(track.src)

    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audio.onerror = () => {
      if (disposed || currentAudio !== audio) return

      warnOnce(`无法加载 ${track.src}`)
      releaseCurrent()
    }

    currentAudio = audio
    currentKey = key

    const target = trackVolume(key)

    fadeIn = { audio, target, step: Math.max(target * FADE_RATIO, MIN_FADE_STEP) }
    ensureFadeTimer()

    startPlayback(audio)
  }

  /**
   * 唯一的状态收敛点。
   *
   * 每次 sync、unlock、visibilitychange 之后都跑一遍，结果只取决于当前状态，
   * 与「是怎么走到这一步的」无关，因此快速连续的输入不会互相污染。
   */
  function apply() {
    if (disposed) return

    const wanted = request.unlocked && !request.muted ? request.track : null

    // 静音、未解锁或这个画面本来就该安静：立即停止，不留淡出尾巴。
    if (wanted === null) {
      fadeIn = null
      clearFadeTimer()
      releaseFadeOut()
      releaseCurrent()
      return
    }

    /*
      页面隐藏：只暂停，不新建、不换曲、不销毁。

      恢复可见时会再跑一次 apply()，那时按最新的静音状态与场景对齐，
      因此「隐藏期间换了曲目」这种情况也只会在恢复后发生一次正常切换。
    */
    if (hidden) {
      if (currentAudio && !currentAudio.paused) {
        try {
          currentAudio.pause()
        } catch {
          // 暂停失败就让它继续放，不值得为此做任何补救。
        }
      }
      return
    }

    // 同一首：绝不重建、不重载、不重置进度，只补上音量并确保在播。
    if (currentAudio && currentKey === wanted) {
      const target = trackVolume(wanted)

      if (fadeIn && fadeIn.audio === currentAudio) {
        fadeIn.target = target
      } else {
        currentAudio.volume = clampVolume(target)
      }

      if (currentAudio.paused) startPlayback(currentAudio)
      return
    }

    startFadeOut()
    startTrack(wanted)
  }

  function handleVisibilityChange() {
    hidden = document.hidden === true
    apply()
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    sync(next: BgmRequest) {
      if (disposed) return

      // 解锁是单向的：一旦发生过用户手势，后续 sync 不该把它撤回。
      request = { ...next, unlocked: next.unlocked || request.unlocked }
      apply()
    },

    unlock() {
      if (disposed || request.unlocked) return

      request = { ...request, unlocked: true }
      apply()
    },

    dispose() {
      if (disposed) return

      disposed = true
      fadeIn = null
      clearFadeTimer()
      releaseFadeOut()
      releaseCurrent()

      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    },
  }
}
