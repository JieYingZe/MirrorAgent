import type { SfxKey, SfxTrack } from '../../types/audio'
import { DEFAULT_MASTER_VOLUME, MAX_CONCURRENT_SFX, SFX_KEYS, getSfxTrack } from '../../data/audioTracks'

/**
 * SFX 播放器（A03）。
 *
 * 与 `bgmPlayer` 是同一套音频状态下的两个执行器，不是第二套音频系统：
 * 静音、主音量、解锁三个输入都来自同一份用户偏好，由 App 一处声明后分别下发，
 * 因此不存在「BGM 静了但 SFX 还在响」的通道。两者唯一共享的只有这三个标量。
 *
 * 与 BGM 的差别决定了这里的结构完全不同：
 * - BGM 是一个长期循环的实例，关心的是「换不换曲、怎么淡」；
 * - SFX 是大量短促的一次性触发，关心的是「别叠成噪声、别无限建实例」。
 *
 * 四条硬性约束：
 * 1. 每个音效有固定大小的实例池，池子在第一次需要时建好就不再增长，
 *    触发只是「找一个空闲实例，或者把最旧的那个停下重播」，
 *    绝不每次 `play()` 都 `new Audio()`；
 * 2. 静音、未解锁、页面隐藏这三种情况下 `play()` 是空操作，
 *    并且不排队、不补播 —— 恢复之后不会突然涌出一串迟到的音效；
 * 3. 任何失败都只影响声音：文件 404、解码失败、`play()` 被拒绝都静默跳过，
 *    不抛错、不重试到阻塞，业务回调该跑照跑；
 * 4. 所有 timer 都挂在实例上，`stopAll` / `dispose` 一次清干净，
 *    Strict Mode 下卸载重建不会遗留实例或悬挂回调。
 */

/** 外部声明的期望状态。与 BgmRequest 的三个字段同源，只是少了曲目。 */
export type SfxRequest = {
  /** 全局静音。静音时立即停止全部正在播放的音效，之后的触发一律丢弃。 */
  muted: boolean
  /** 主音量 0–1，与 BGM 共用同一个值。 */
  masterVolume: number
  /** 是否已经过首次用户手势解锁。未解锁时不发声。 */
  unlocked: boolean
}

export type SfxPlayerHandle = {
  /** 声明最新的期望状态；幂等。 */
  sync: (request: SfxRequest) => void
  /** 在用户手势里解锁，使同一个调用栈里紧接着的 `play()` 能发声。 */
  unlock: () => void
  /**
   * 立即应用新的静音状态。
   *
   * 不是第二份静音状态：偏好仍然是唯一来源，这里只是把同一个值提前一步送到
   * 播放器，好让「点击恢复声音」能在同一个调用栈里给出一次确认音，
   * 以及让「点击静音」在这一刻就把正在响的音效压住，而不是等下一次 effect。
   */
  setMuted: (muted: boolean) => void
  /** 触发一次音效。永远不抛错。 */
  play: (key: SfxKey) => void
  /** 停止全部正在播放的音效，不释放实例（恢复声音后可以立刻再用）。 */
  stopAll: () => void
  /** 停掉全部声音、清掉全部 timer 与监听。之后所有调用都是空操作。 */
  dispose: () => void
}

type PoolEntry = {
  audio: HTMLAudioElement
  /** 本次播放的自增序号，用来在全局并发超限时找出最旧的一个。 */
  startedAt: number
  stopTimer: ReturnType<typeof setTimeout> | null
}

const INITIAL_REQUEST: SfxRequest = {
  muted: false,
  masterVolume: DEFAULT_MASTER_VOLUME,
  unlocked: false,
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0

  return Math.min(1, Math.max(0, value))
}

let warned = false

/** 音效失败只提示一次：反复 warn 会把控制台刷满，而它并不影响游玩。 */
function warnOnce(detail: string) {
  if (warned) return
  warned = true
  console.warn(`[audio] 音效不可用，本次会话静默跳过：${detail}`)
}

export function createSfxPlayer(): SfxPlayerHandle {
  let request: SfxRequest = { ...INITIAL_REQUEST }
  let hidden = typeof document !== 'undefined' && document.hidden === true
  let disposed = false

  /** 每个音效一个固定大小的实例池；建好之后不再增长。 */
  const pools = new Map<SfxKey, PoolEntry[]>()
  /** 上一次真正开始播放的时刻，用于每个音效各自的最小间隔。 */
  const lastPlayedAt = new Map<SfxKey, number>()
  /** 起始偏移的轮转下标（只有打字声用得上）。 */
  const offsetCursor = new Map<SfxKey, number>()
  /** 加载失败的音效不再重试，也不再刷控制台。 */
  const failed = new Set<SfxKey>()

  /** 全局自增序号，用来比较「谁先开始播的」。 */
  let sequence = 0

  function volumeFor(track: SfxTrack): number {
    return clampVolume(clampVolume(request.masterVolume) * track.gain)
  }

  function isPlaying(entry: PoolEntry): boolean {
    return entry.audio.paused !== true
  }

  function clearStopTimer(entry: PoolEntry) {
    if (entry.stopTimer === null) return

    clearTimeout(entry.stopTimer)
    entry.stopTimer = null
  }

  function stopEntry(entry: PoolEntry) {
    clearStopTimer(entry)

    try {
      entry.audio.pause()
    } catch {
      // 停不下来也没有补救手段，音量本来就很低。
    }
  }

  /**
   * 建好一个音效的实例池。
   *
   * 只在「确定要出声」之后才建（静音时一个实例都不创建），但建的时机比第一次
   * 触发更早：`sync` 里一确认不是静音就预热，让文件在启动遮罩期间就下载完，
   * 否则第一次点击往往赶不上加载。预加载本身不需要用户手势，也不会发出声音。
   */
  function ensurePool(key: SfxKey): PoolEntry[] | null {
    if (typeof Audio === 'undefined') return null

    const existing = pools.get(key)

    if (existing) return existing

    const track = getSfxTrack(key)
    const entries: PoolEntry[] = []

    for (let index = 0; index < track.maxConcurrent; index += 1) {
      const audio = new Audio(track.src)

      audio.preload = 'auto'
      audio.loop = false
      audio.volume = volumeFor(track)
      audio.onerror = () => {
        if (disposed) return

        failed.add(key)
        warnOnce(`无法加载 ${track.src}`)
      }

      entries.push({ audio, startedAt: 0, stopTimer: null })
    }

    pools.set(key, entries)
    return entries
  }

  function warmUp() {
    for (const key of SFX_KEYS) ensurePool(key)
  }

  function countPlaying(): number {
    let total = 0

    for (const entries of pools.values()) {
      for (const entry of entries) {
        if (isPlaying(entry)) total += 1
      }
    }

    return total
  }

  /**
   * 全局并发超限时腾一个位置。
   *
   * 优先停掉最旧的那个非独占音效（打字声、点击声这类可以牺牲），
   * 腾不出来时只放行独占音效（警告与结局揭示都是一次性的仪式音，
   * 不该被一串点击声挤掉），普通音效则直接丢弃这一次触发。
   */
  function makeRoom(track: SfxTrack): boolean {
    if (countPlaying() < MAX_CONCURRENT_SFX) return true

    let victim: PoolEntry | null = null

    for (const [key, entries] of pools) {
      if (getSfxTrack(key).exclusive) continue

      for (const entry of entries) {
        if (!isPlaying(entry)) continue
        if (victim === null || entry.startedAt < victim.startedAt) victim = entry
      }
    }

    if (victim) {
      stopEntry(victim)
      return true
    }

    return track.exclusive
  }

  /** 空闲实例优先；全都在播时复用最旧的那个（停下重播，不叠加）。 */
  function pickEntry(entries: PoolEntry[]): PoolEntry | null {
    let oldest: PoolEntry | null = null

    for (const entry of entries) {
      if (!isPlaying(entry)) return entry
      if (oldest === null || entry.startedAt < oldest.startedAt) oldest = entry
    }

    return oldest
  }

  /** 按顺序轮转起始偏移；没有配置偏移时固定从头播放。 */
  function nextOffset(track: SfxTrack): number {
    if (track.startOffsets.length === 0) return 0

    const cursor = offsetCursor.get(track.key) ?? 0

    offsetCursor.set(track.key, cursor + 1)
    return track.startOffsets[cursor % track.startOffsets.length]
  }

  /**
   * 把播放位置设到 offset，带一层防御性夹取（A03 小修复）。
   *
   * 没有偏移（offset <= 0）时无条件把 currentTime 归零：实例是复用的，
   * 上一次播放可能停在中途，不重置就会变成「无偏移轨道却不是从头播」。
   * 归零在 metadata 加载之前同样安全 —— 赋值 0 不会抛错，也不会因为
   * 目标值未知而被忽略。
   *
   * 有偏移时，如果这个实例已经知道自己的 duration，就把偏移夹到
   * duration 以内，防止配置的偏移意外大于（或等于）文件时长而把整段播放
   * seek 到静音尾巴甚至文件末尾——choice-select 曾经出现过这类问题
   * （偏移是对着旧文件量的，文件被替换后没有同步更新，结果整段声音
   * 都被跳过）。duration 还没加载出来（NaN）时保留原始偏移：
   * 赋值本身不会抛错，浏览器会把它当作「默认起播位置」处理，
   * 等 metadata 就绪后生效，不会导致这次播放被跳过或提前失败。
   */
  function seekTo(entry: PoolEntry, offset: number) {
    if (offset <= 0) {
      try {
        entry.audio.currentTime = 0
      } catch {
        // 归零失败时保留原位置；下一次播放会再尝试一次。
      }
      return
    }

    const duration = entry.audio.duration
    const safeOffset = Number.isFinite(duration) && duration > 0 ? Math.min(offset, duration) : offset

    try {
      entry.audio.currentTime = safeOffset
    } catch {
      // seek 失败时保留当前播放位置，不阻止随后的 play()。
    }
  }

  /**
   * 「这一次没响」是不是正常现象。
   *
   * 短音效被下一次触发、静音、页面隐藏或截断 timer 打断时，浏览器会用
   * `AbortError` 拒绝上一次的 `play()`。这是设计里预期会发生的事
   * （复用实例本来就是「停下重播」），不该当成故障刷到控制台。
   */
  function isInterrupted(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError'
  }

  /**
   * 开始播放。
   *
   * `play()` 既可能同步抛错，也可能返回被拒绝的 Promise，两种都当作
   * 「这一次没响」处理：不抛错、不重试、不禁用这个音效。
   * 真正的加载失败由 `onerror` 标记，那才是永久性的。
   */
  function startPlayback(entry: PoolEntry) {
    try {
      const result = entry.audio.play()

      if (result && typeof result.catch === 'function') {
        result.catch((error: unknown) => {
          if (disposed || isInterrupted(error)) return

          warnOnce(error instanceof Error ? error.message : String(error))
        })
      }
    } catch (error) {
      if (!isInterrupted(error)) {
        warnOnce(error instanceof Error ? error.message : String(error))
      }

      stopEntry(entry)
    }
  }

  function start(entry: PoolEntry, track: SfxTrack) {
    stopEntry(entry)

    entry.audio.volume = volumeFor(track)

    seekTo(entry, nextOffset(track))

    sequence += 1
    entry.startedAt = sequence

    startPlayback(entry)

    entry.stopTimer = setTimeout(() => {
      entry.stopTimer = null
      stopEntry(entry)
    }, track.maxDurationMs)
  }

  function stopAll() {
    for (const entries of pools.values()) {
      for (const entry of entries) stopEntry(entry)
    }
  }

  function apply() {
    if (disposed) return

    // 静音、未解锁或页面隐藏：立刻压住正在响的音效，之后的触发也会被 play() 丢掉。
    if (request.muted || hidden) {
      stopAll()
      return
    }

    // 走到这里就说明当前状态是「要出声的」，可以预热实例池；静音时一个实例都不创建。
    warmUp()
  }

  function handleVisibilityChange() {
    hidden = document.hidden === true
    apply()
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    sync(next: SfxRequest) {
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

    setMuted(muted: boolean) {
      if (disposed || request.muted === muted) return

      request = { ...request, muted }
      apply()
    },

    play(key: SfxKey) {
      if (disposed) return
      if (!request.unlocked || request.muted || hidden) return
      if (failed.has(key)) return

      const track = getSfxTrack(key)
      const now = Date.now()
      const last = lastPlayedAt.get(key)

      // 快速重复的物理事件在这里就被吃掉，不会走到实例分配。
      if (last !== undefined && now - last < track.minIntervalMs) return

      const entries = ensurePool(key)

      if (!entries || entries.length === 0) return

      // 独占音效：正在播时忽略新的触发，既不重叠也不重启。
      if (track.exclusive && entries.some(isPlaying)) return

      const entry = pickEntry(entries)

      if (!entry) return
      if (!isPlaying(entry) && !makeRoom(track)) return

      lastPlayedAt.set(key, now)
      start(entry, track)
    },

    stopAll,

    dispose() {
      if (disposed) return

      disposed = true
      stopAll()

      for (const entries of pools.values()) {
        for (const entry of entries) {
          entry.audio.onerror = null

          try {
            entry.audio.removeAttribute('src')
            entry.audio.load()
          } catch {
            // 释放失败没有补救手段，也不影响任何功能。
          }
        }
      }

      pools.clear()
      lastPlayedAt.clear()
      offsetCursor.clear()

      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    },
  }
}
