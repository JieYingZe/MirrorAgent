import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBgmPlayer } from '../src/utils/audio/bgmPlayer'
import type { BgmPlayerHandle, BgmRequest } from '../src/utils/audio/bgmPlayer'
import { BGM_FADE_MS, BGM_TRACK_KEYS, DEFAULT_MASTER_VOLUME, getBgmTrack } from '../src/data/audioTracks'

/**
 * BGM 播放器的音量应用（A01 / A02）。
 *
 * 关键约束：同一首曲目对应的 sync 不重新创建实例，只更新目标音量；
 * 静音恢复后使用的是当前（可能已调整过的）轨道增益，不是残留的旧常量；
 * 无论 masterVolume 落在什么范围，最终写到 HTMLAudioElement.volume 上的值
 * 永远落在合法的 [0, 1] 区间。
 *
 * 播放器本身在这一轮没有改动：gain 由 data/audioTracks.ts 集中维护，
 * trackVolume() 每次都现读 getBgmTrack(key).gain，因此调整音量只需要改配置。
 * 这里的测试就是用来证明这一点确实成立，而不是靠读代码猜。
 *
 * 默认测试环境是 node，没有真实的 <audio>，因此用一个最小 Audio 替身：
 * 只实现播放器实际用到的那几个成员（play / pause / volume / onerror / ...），
 * play() 立即成功，不模拟网络或解码延迟。
 */

class MockAudio {
  static instances: MockAudio[] = []

  src: string
  loop = false
  preload = ''
  onerror: (() => void) | null = null
  paused = true
  private volumeValue = 1

  constructor(src?: string) {
    this.src = src ?? ''
    MockAudio.instances.push(this)
  }

  get currentSrc() {
    return this.src
  }

  get volume() {
    return this.volumeValue
  }

  set volume(next: number) {
    this.volumeValue = next
  }

  play(): Promise<void> {
    this.paused = false
    return Promise.resolve()
  }

  pause() {
    this.paused = true
  }

  removeAttribute() {
    // 替身不需要真的清 src。
  }

  load() {
    // 替身不需要真的重新加载。
  }
}

function installMockAudio() {
  MockAudio.instances = []
  vi.stubGlobal('Audio', MockAudio as unknown as typeof Audio)
}

/** 把淡变的 setInterval 推到底：BGM_FADE_MS 的两倍足够任何目标音量收敛。 */
function settleFade() {
  vi.advanceTimersByTime(BGM_FADE_MS * 2)
}

function request(overrides: Partial<BgmRequest> = {}): BgmRequest {
  return {
    track: null,
    muted: false,
    masterVolume: DEFAULT_MASTER_VOLUME,
    unlocked: true,
    ...overrides,
  }
}

let player: BgmPlayerHandle | null = null

beforeEach(() => {
  vi.useFakeTimers()
  installMockAudio()
})

afterEach(() => {
  player?.dispose()
  player = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('同一首曲目：只更新目标音量，不重新创建实例', () => {
  it('曲目键不变时重复 sync 不会新建 Audio', () => {
    player = createBgmPlayer()

    player.sync(request({ track: 'main_theme' }))
    expect(MockAudio.instances.length).toBe(1)

    player.sync(request({ track: 'main_theme' }))
    player.sync(request({ track: 'main_theme' }))
    expect(MockAudio.instances.length).toBe(1)

    settleFade()
    expect(MockAudio.instances[0].volume).toBeCloseTo(
      DEFAULT_MASTER_VOLUME * getBgmTrack('main_theme').gain,
      2,
    )
  })

  it('主音量变化但曲目相同时：同一实例的音量跟着更新，不新建实例', () => {
    player = createBgmPlayer()

    player.sync(request({ track: 'game_ambient', masterVolume: DEFAULT_MASTER_VOLUME }))
    settleFade()
    expect(MockAudio.instances.length).toBe(1)

    const instance = MockAudio.instances[0]

    player.sync(request({ track: 'game_ambient', masterVolume: 0.2 }))
    settleFade()

    expect(MockAudio.instances.length).toBe(1)
    expect(MockAudio.instances[0]).toBe(instance)
    expect(instance.volume).toBeCloseTo(0.2 * getBgmTrack('game_ambient').gain, 2)
  })
})

describe('静音恢复使用最新的轨道增益', () => {
  it('静音立即停止，恢复声音后的新实例按当前 gain 淡入', () => {
    player = createBgmPlayer()

    player.sync(request({ track: 'ending' }))
    settleFade()
    expect(MockAudio.instances.every((a) => a.paused)).toBe(false)

    player.sync(request({ track: 'ending', muted: true }))
    expect(MockAudio.instances.every((a) => a.paused)).toBe(true)

    player.sync(request({ track: 'ending', muted: false }))
    settleFade()

    const latest = MockAudio.instances[MockAudio.instances.length - 1]

    expect(latest.paused).toBe(false)
    expect(latest.volume).toBeCloseTo(DEFAULT_MASTER_VOLUME * getBgmTrack('ending').gain, 2)
  })
})

describe('最终播放音量始终合法', () => {
  const masterVolumeSamples = [0, 0.2, 0.5, 1, 2, -1, Number.NaN]

  for (const key of BGM_TRACK_KEYS) {
    for (const masterVolume of masterVolumeSamples) {
      it(`${key} @ masterVolume=${masterVolume} 落在 [0, 1]`, () => {
        player = createBgmPlayer()

        player.sync(request({ track: key, masterVolume }))
        settleFade()

        const audio = MockAudio.instances[MockAudio.instances.length - 1]

        expect(audio.volume).toBeGreaterThanOrEqual(0)
        expect(audio.volume).toBeLessThanOrEqual(1)
        expect(Number.isFinite(audio.volume)).toBe(true)
      })
    }
  }
})
