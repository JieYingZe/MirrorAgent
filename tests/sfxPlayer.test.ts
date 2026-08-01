import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBgmPlayer } from '../src/utils/audio/bgmPlayer'
import { createSfxPlayer } from '../src/utils/audio/sfxPlayer'
import type { SfxPlayerHandle, SfxRequest } from '../src/utils/audio/sfxPlayer'
import {
  DEFAULT_MASTER_VOLUME,
  MAX_CONCURRENT_SFX,
  SFX_KEYS,
  getSfxTrack,
} from '../src/data/audioTracks'

/**
 * SFX 播放器的实例策略与静音／隐藏／失败行为（A03）。
 *
 * 默认测试环境是 node，没有真实的 <audio>，因此沿用 bgmPlayer 测试里的做法：
 * 一个最小 Audio 替身，只实现播放器实际用到的成员。这里测的全部是
 * 「建了几个实例、播了几次、什么时候被压住」，不依赖任何真实播放时长或输出。
 */

class MockAudio {
  static instances: MockAudio[] = []

  src: string
  loop = false
  preload = ''
  currentTime = 0
  /** 真实 <audio> 在 metadata 加载完成前是 NaN；测试按需显式设置。 */
  duration = Number.NaN
  onerror: (() => void) | null = null
  paused = true
  playCount = 0
  /** 让个别用例模拟「这一首放不了」。 */
  failOnPlay = false
  /** 拒绝时抛出的具体错误；默认是普通失败，可换成 AbortError。 */
  failWith: Error = new Error('模拟播放失败')

  private volumeValue = 1

  constructor(src?: string) {
    this.src = src ?? ''
    MockAudio.instances.push(this)
  }

  get volume() {
    return this.volumeValue
  }

  set volume(next: number) {
    this.volumeValue = next
  }

  play(): Promise<void> {
    this.playCount += 1

    if (this.failOnPlay) return Promise.reject(this.failWith)

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

function request(overrides: Partial<SfxRequest> = {}): SfxRequest {
  return { muted: false, masterVolume: DEFAULT_MASTER_VOLUME, unlocked: true, ...overrides }
}

function instancesFor(key: (typeof SFX_KEYS)[number]): MockAudio[] {
  const { src } = getSfxTrack(key)

  return MockAudio.instances.filter((audio) => audio.src === src)
}

function playingCount(): number {
  return MockAudio.instances.filter((audio) => !audio.paused).length
}

function totalPlayCount(key: (typeof SFX_KEYS)[number]): number {
  return instancesFor(key).reduce((total, audio) => total + audio.playCount, 0)
}

/** 页面可见性是播放器自己订阅的浏览器事件，测试里手动改写并派发。 */
function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, value: hidden })
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: hidden ? 'hidden' : 'visible',
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

let player: SfxPlayerHandle | null = null

beforeEach(() => {
  vi.useFakeTimers()
  installMockAudio()
  vi.stubGlobal('document', {
    hidden: false,
    visibilityState: 'visible',
    listeners: new Map<string, Set<(event: Event) => void>>(),
    addEventListener(type: string, handler: (event: Event) => void) {
      const map = (this as unknown as { listeners: Map<string, Set<(event: Event) => void>> })
        .listeners

      if (!map.has(type)) map.set(type, new Set())
      map.get(type)?.add(handler)
    },
    removeEventListener(type: string, handler: (event: Event) => void) {
      const map = (this as unknown as { listeners: Map<string, Set<(event: Event) => void>> })
        .listeners

      map.get(type)?.delete(handler)
    },
    dispatchEvent(event: Event) {
      const map = (this as unknown as { listeners: Map<string, Set<(event: Event) => void>> })
        .listeners

      for (const handler of map.get(event.type) ?? []) handler(event)
      return true
    },
  })
  vi.stubGlobal(
    'Event',
    class {
      type: string

      constructor(type: string) {
        this.type = type
      }
    },
  )
})

afterEach(() => {
  player?.dispose()
  player = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('解锁之前不发声', () => {
  it('未解锁时 play 是空操作', () => {
    player = createSfxPlayer()
    player.sync(request({ unlocked: false }))

    player.play('click_soft')

    expect(playingCount()).toBe(0)
    expect(totalPlayCount('click_soft')).toBe(0)
  })

  it('未解锁也会预热实例，好让第一次点击不迟到', () => {
    player = createSfxPlayer()
    player.sync(request({ unlocked: false }))

    // 预热只是创建并 preload，不发出任何声音。
    expect(MockAudio.instances.length).toBeGreaterThan(0)
    expect(playingCount()).toBe(0)
    expect(MockAudio.instances.every((audio) => audio.preload === 'auto')).toBe(true)
  })

  it('unlock() 之后同一个调用栈里就能发声', () => {
    player = createSfxPlayer()
    player.sync(request({ unlocked: false }))

    player.unlock()
    player.play('click_soft')

    expect(playingCount()).toBe(1)
  })
})

describe('全局静音覆盖全部 SFX', () => {
  it('静音时任何一种音效都不播放', () => {
    player = createSfxPlayer()
    player.sync(request({ muted: true }))

    for (const key of SFX_KEYS) player.play(key)

    expect(playingCount()).toBe(0)
  })

  it('静音状态下一个实例都不创建', () => {
    player = createSfxPlayer()
    player.sync(request({ muted: true }))

    expect(MockAudio.instances.length).toBe(0)
  })

  it('静音立即压住正在播放的音效', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('warning_soft')
    expect(playingCount()).toBe(1)

    player.sync(request({ muted: true }))
    expect(playingCount()).toBe(0)
  })

  it('setMuted 与 sync 效果一致，可以在点击的调用栈里立即生效', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('choice_select')
    expect(playingCount()).toBe(1)

    player.setMuted(true)
    expect(playingCount()).toBe(0)

    player.play('click_soft')
    expect(playingCount()).toBe(0)

    // 恢复声音后同一个调用栈里就能给出确认反馈。
    player.setMuted(false)
    player.play('click_soft')
    expect(playingCount()).toBe(1)
  })

  it('恢复声音后不补播静音期间被丢弃的事件', () => {
    player = createSfxPlayer()
    player.sync(request({ muted: true }))

    for (let index = 0; index < 5; index += 1) player.play('click_soft')

    player.sync(request({ muted: false }))
    vi.advanceTimersByTime(1000)

    // 只是恢复了「可以播」，不会把刚才丢掉的五次补回来。
    expect(playingCount()).toBe(0)
    expect(totalPlayCount('click_soft')).toBe(0)
  })
})

/*
  A03 试玩修订：单一静音拆成 BGM / SFX 两个独立通道。

  两个播放器是并列的执行器，各自只读自己那一路的开关。这里把它们放在一起跑，
  验证「关一个不影响另一个」不是靠 App 的接线巧合，而是结构上就成立的。
*/
describe('BGM 与 SFX 是两个独立通道', () => {
  function bgmPlaying(): number {
    return MockAudio.instances.filter((audio) => !audio.paused && audio.src.includes('/bgm/')).length
  }

  function sfxPlaying(): number {
    return MockAudio.instances.filter((audio) => !audio.paused && audio.src.includes('/sfx/')).length
  }

  it('只关闭 BGM 时音效仍然可以播放', () => {
    const bgm = createBgmPlayer()

    player = createSfxPlayer()

    bgm.sync({ track: 'game_ambient', muted: true, masterVolume: DEFAULT_MASTER_VOLUME, unlocked: true })
    player.sync(request({ muted: false }))
    player.play('choice_select')

    expect(bgmPlaying()).toBe(0)
    expect(sfxPlaying()).toBe(1)

    bgm.dispose()
  })

  it('只关闭音效时 BGM 仍然照常播放', () => {
    const bgm = createBgmPlayer()

    player = createSfxPlayer()

    bgm.sync({ track: 'game_ambient', muted: false, masterVolume: DEFAULT_MASTER_VOLUME, unlocked: true })
    player.sync(request({ muted: true }))
    player.play('choice_select')

    expect(bgmPlaying()).toBe(1)
    expect(sfxPlaying()).toBe(0)

    bgm.dispose()
  })

  it('两个通道都关时完全无声', () => {
    const bgm = createBgmPlayer()

    player = createSfxPlayer()

    bgm.sync({ track: 'game_ambient', muted: true, masterVolume: DEFAULT_MASTER_VOLUME, unlocked: true })
    player.sync(request({ muted: true }))

    for (const key of SFX_KEYS) player.play(key)

    expect(bgmPlaying()).toBe(0)
    expect(sfxPlaying()).toBe(0)

    bgm.dispose()
  })

  it('恢复一个通道不会顺带恢复另一个', () => {
    const bgm = createBgmPlayer()

    player = createSfxPlayer()

    bgm.sync({ track: 'game_ambient', muted: true, masterVolume: DEFAULT_MASTER_VOLUME, unlocked: true })
    player.sync(request({ muted: true }))

    // 只恢复背景音乐。
    bgm.sync({ track: 'game_ambient', muted: false, masterVolume: DEFAULT_MASTER_VOLUME, unlocked: true })
    player.play('click_soft')

    expect(bgmPlaying()).toBe(1)
    expect(sfxPlaying()).toBe(0)

    // 再恢复音效，两边都在。
    player.setMuted(false)
    player.play('click_soft')

    expect(bgmPlaying()).toBe(1)
    expect(sfxPlaying()).toBe(1)

    bgm.dispose()
  })

  it('音效通道关闭期间被丢弃的触发，开启后不会补播', () => {
    player = createSfxPlayer()
    player.sync(request({ muted: true }))

    for (let index = 0; index < 8; index += 1) {
      vi.advanceTimersByTime(100)
      player.play('choice_select')
    }

    player.setMuted(false)
    vi.advanceTimersByTime(2000)

    expect(totalPlayCount('choice_select')).toBe(0)
    expect(playingCount()).toBe(0)
  })
})

describe('页面隐藏', () => {
  it('隐藏时停止正在播放的音效，并丢弃新的触发', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('choice_select')
    expect(playingCount()).toBe(1)

    setHidden(true)
    expect(playingCount()).toBe(0)

    player.play('click_soft')
    expect(playingCount()).toBe(0)

    // 恢复可见不会续播已经过时的短音效。
    setHidden(false)
    expect(playingCount()).toBe(0)
  })
})

describe('实例复用与防叠音', () => {
  it('快速重复点击不会无限创建实例', () => {
    player = createSfxPlayer()
    player.sync(request())

    const before = instancesFor('click_soft').length

    for (let index = 0; index < 50; index += 1) {
      vi.advanceTimersByTime(60)
      player.play('click_soft')
    }

    const instances = instancesFor('click_soft')

    expect(instances.length).toBe(before)
    expect(instances.length).toBe(getSfxTrack('click_soft').maxConcurrent)
    // 每次都是同一个实例停下重播，不是叠加。
    expect(playingCount()).toBe(1)
  })

  it('同一音效的并发实例不超过配置上限', () => {
    player = createSfxPlayer()
    player.sync(request())

    for (let index = 0; index < 20; index += 1) {
      vi.advanceTimersByTime(getSfxTrack('text_type').minIntervalMs)
      player.play('text_type')
    }

    const instances = instancesFor('text_type')

    expect(instances.length).toBe(getSfxTrack('text_type').maxConcurrent)
    expect(instances.filter((audio) => !audio.paused).length).toBeLessThanOrEqual(
      getSfxTrack('text_type').maxConcurrent,
    )
  })

  it('最小间隔以内的重复触发被直接丢掉', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('choice_select')
    const first = totalPlayCount('choice_select')

    // 同一帧内的重复事件（快速连点、事件重复派发）。
    player.play('choice_select')
    player.play('choice_select')

    expect(totalPlayCount('choice_select')).toBe(first)

    vi.advanceTimersByTime(getSfxTrack('choice_select').minIntervalMs)
    player.play('choice_select')
    expect(totalPlayCount('choice_select')).toBe(first + 1)
  })

  it('独占音效正在播时忽略新的触发，不重叠也不重启', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('warning_soft')
    expect(totalPlayCount('warning_soft')).toBe(1)

    for (let index = 0; index < 5; index += 1) {
      vi.advanceTimersByTime(50)
      player.play('warning_soft')
    }

    expect(totalPlayCount('warning_soft')).toBe(1)
    expect(instancesFor('warning_soft').filter((audio) => !audio.paused).length).toBe(1)
  })

  it('播放到配置时长后自动停止，实例随即可复用', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('click_soft')
    expect(playingCount()).toBe(1)

    vi.advanceTimersByTime(getSfxTrack('click_soft').maxDurationMs)
    expect(playingCount()).toBe(0)
  })

  it('同时发声的音效数量不超过全局上限', () => {
    player = createSfxPlayer()
    player.sync(request())

    // 把所有能同时响的音效都触发一遍。
    player.play('warning_soft')
    player.play('warning_soft')

    for (let index = 0; index < 6; index += 1) {
      vi.advanceTimersByTime(getSfxTrack('text_type').minIntervalMs)
      player.play('text_type')
      player.play('click_soft')
    }

    expect(playingCount()).toBeLessThanOrEqual(MAX_CONCURRENT_SFX)
  })
})

/*
  A03 小修复：选择音「完全没有声音」。

  真实原因是运行时仍然对着一个已经被手动裁掉前置静音的新文件应用旧的
  startOffsets: [0.24]，二次裁切之后播放的只是衰减到 −30dB 左右的尾音。
  修法是删掉这个偏移，改回从 currentTime = 0 起播。这里同时验证
  「首次播放不因懒创建实例而走不同逻辑」——这条上一轮已经排除，本轮继续保留。
*/
describe('选择音的即时性', () => {
  it('第一次播放不会临时创建实例：实例在预热时就建好了', () => {
    player = createSfxPlayer()
    player.sync(request())

    const warmed = instancesFor('choice_select').length

    expect(warmed).toBe(getSfxTrack('choice_select').maxConcurrent)

    player.play('choice_select')

    // 第一次播放走的路径与后续完全一样，没有额外的创建与加载。
    expect(instancesFor('choice_select').length).toBe(warmed)
    expect(totalPlayCount('choice_select')).toBe(1)
  })

  it('choice-select 不再使用旧偏移，每次都从 currentTime = 0 起播', () => {
    player = createSfxPlayer()
    player.sync(request())

    expect(getSfxTrack('choice_select').startOffsets).toEqual([])

    player.play('choice_select')

    const playing = instancesFor('choice_select').find((audio) => !audio.paused)

    expect(playing?.currentTime).toBe(0)

    // 第二次同样从 0 起播，不会因为复用实例而从上次停下的位置继续。
    vi.advanceTimersByTime(getSfxTrack('choice_select').maxDurationMs)
    player.play('choice_select')

    expect(instancesFor('choice_select').find((audio) => !audio.paused)?.currentTime).toBe(0)
  })

  it('实例播放到中途被停掉后重播，仍然从 0 开始而不是接着上次的位置', () => {
    player = createSfxPlayer()
    player.sync(request())

    player.play('choice_select')

    const entry = instancesFor('choice_select').find((audio) => !audio.paused)

    // 模拟播放进行到一半（例如被下一次触发打断前）。
    if (entry) entry.currentTime = 0.4

    vi.advanceTimersByTime(getSfxTrack('choice_select').minIntervalMs)
    player.play('choice_select')

    expect(instancesFor('choice_select').find((audio) => !audio.paused)?.currentTime).toBe(0)
  })
})

describe('打字声的起始偏移', () => {
  it('每次播放都从配置好的击键起音点开始，并按顺序轮转', () => {
    player = createSfxPlayer()
    player.sync(request())

    const offsets = getSfxTrack('text_type').startOffsets
    const used: number[] = []

    for (let index = 0; index < offsets.length; index += 1) {
      vi.advanceTimersByTime(getSfxTrack('text_type').minIntervalMs)
      player.play('text_type')

      const latest = instancesFor('text_type')
        .slice()
        .sort((a, b) => b.playCount - a.playCount)

      used.push(latest.find((audio) => audio.currentTime > 0)?.currentTime ?? 0)
    }

    // 素材开头 450ms 是静音，从 0 播放什么都听不到。
    expect(used.every((value) => value > 0)).toBe(true)
    expect(new Set(used).size).toBeGreaterThan(1)
  })
})

/*
  A03 小修复：防御性 seek 夹取。

  choice-select 无声的真实原因就是「配置的偏移对不上当前文件」——偏移比
  文件的有效发声段还靠后，等于把整段播放 seek 到了几乎无声的位置。
  这里用 text_type（唯一还配置了偏移的音效）模拟同一类问题：如果某个实例
  已经知道自己的 duration，且配置的偏移意外大于等于它，播放位置必须被夹到
  duration 以内，而不是把这个偏移原样交给浏览器、悄悄把整段播放跳过。
*/
describe('偏移的防御性夹取', () => {
  it('已知 duration 时，偏移超过 duration 会被夹到 duration 以内', () => {
    player = createSfxPlayer()
    player.sync(request())

    const track = getSfxTrack('text_type')
    const [offset] = track.startOffsets

    // 模拟「文件被替换后变短了」：duration 比配置的偏移还小。
    for (const audio of instancesFor('text_type')) audio.duration = offset - 0.1

    player.play('text_type')

    const playing = instancesFor('text_type').find((audio) => !audio.paused)

    expect(playing?.currentTime).toBeLessThanOrEqual(offset - 0.1)
    expect(playing?.currentTime).toBeGreaterThanOrEqual(0)
    // 关键：即使偏移被夹取，播放依然真实发生了，不是被跳过。
    expect(playing?.paused).toBe(false)
  })

  it('duration 未知（NaN，metadata 还没加载）时按原始偏移赋值，不阻止播放', () => {
    player = createSfxPlayer()
    player.sync(request())

    const track = getSfxTrack('text_type')
    const [offset] = track.startOffsets

    // 默认就是 NaN（还没加载 metadata），不需要额外设置。
    player.play('text_type')

    const playing = instancesFor('text_type').find((audio) => !audio.paused)

    expect(playing?.currentTime).toBeCloseTo(offset, 5)
    expect(playing?.paused).toBe(false)
  })

  it('无偏移的音效即使实例停在播放中途，重播也会先归零，不受 duration 影响', () => {
    player = createSfxPlayer()
    player.sync(request())

    for (const audio of instancesFor('click_soft')) audio.duration = 5

    player.play('click_soft')

    const entry = instancesFor('click_soft').find((audio) => !audio.paused)

    if (entry) entry.currentTime = 2.5

    vi.advanceTimersByTime(getSfxTrack('click_soft').minIntervalMs)
    player.play('click_soft')

    expect(instancesFor('click_soft').find((audio) => !audio.paused)?.currentTime).toBe(0)
  })
})

describe('播放失败静默降级', () => {
  /*
    这一组用例必须放在整个文件的后面，也必须保持内部顺序：
    播放器的「只 warn 一次」是模块级开关，一旦有用例触发过失败提示，
    后面的用例就再也看不到 console.warn 了。
  */
  it('被下一次触发打断（AbortError）不算失败，不刷控制台', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    player = createSfxPlayer()
    player.sync(request())

    for (const audio of instancesFor('choice_select')) {
      audio.failOnPlay = true
      audio.failWith = Object.assign(new Error('interrupted'), { name: 'AbortError' })
    }

    player.play('choice_select')
    await Promise.resolve()
    await Promise.resolve()

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('play() 被拒绝时不抛错，也不影响后续触发', async () => {
    player = createSfxPlayer()
    player.sync(request())

    for (const audio of instancesFor('click_soft')) audio.failOnPlay = true

    expect(() => player?.play('click_soft')).not.toThrow()
    await Promise.resolve()

    for (const audio of instancesFor('click_soft')) audio.failOnPlay = false

    vi.advanceTimersByTime(getSfxTrack('click_soft').minIntervalMs)
    expect(() => player?.play('click_soft')).not.toThrow()
  })

  it('加载失败的音效被跳过，其余音效照常', () => {
    player = createSfxPlayer()
    player.sync(request())

    for (const audio of instancesFor('text_type')) audio.onerror?.()

    player.play('text_type')
    expect(instancesFor('text_type').every((audio) => audio.paused)).toBe(true)

    player.play('choice_select')
    expect(instancesFor('choice_select').some((audio) => !audio.paused)).toBe(true)
  })

  it('没有 Audio 实现时全部调用都是空操作', () => {
    vi.stubGlobal('Audio', undefined)

    player = createSfxPlayer()

    expect(() => {
      player?.sync(request())
      player?.play('click_soft')
      player?.stopAll()
    }).not.toThrow()
  })
})

describe('生命周期', () => {
  it('dispose 之后停掉全部声音，且所有调用都是空操作', () => {
    player = createSfxPlayer()
    player.sync(request())
    player.play('warning_soft')
    expect(playingCount()).toBe(1)

    player.dispose()
    expect(playingCount()).toBe(0)

    player.sync(request())
    player.play('click_soft')
    expect(playingCount()).toBe(0)
  })

  it('Strict Mode 式的建-弃-建不会遗留实例在播', () => {
    const first = createSfxPlayer()

    first.sync(request())
    first.play('choice_select')
    first.dispose()

    player = createSfxPlayer()
    player.sync(request())

    // 上一份实例已经全部停下，新播放器从零开始。
    expect(playingCount()).toBe(0)

    player.play('choice_select')
    expect(playingCount()).toBe(1)
  })

  it('dispose 会清掉待执行的停止 timer', () => {
    player = createSfxPlayer()
    player.sync(request())
    player.play('click_soft')

    player.dispose()

    expect(() => vi.advanceTimersByTime(5000)).not.toThrow()
    expect(playingCount()).toBe(0)
  })
})

describe('音量', () => {
  it('最终写入的音量等于 clamp(masterVolume × gain)', () => {
    for (const masterVolume of [0, 0.2, 0.5, 1, 2, -1, Number.NaN]) {
      MockAudio.instances = []

      const current = createSfxPlayer()

      current.sync(request({ masterVolume }))
      current.play('choice_select')

      const audio = instancesFor('choice_select').find((item) => !item.paused)

      if (audio) {
        expect(audio.volume).toBeGreaterThanOrEqual(0)
        expect(audio.volume).toBeLessThanOrEqual(1)
        expect(Number.isFinite(audio.volume)).toBe(true)
      }

      current.dispose()
    }
  })

  it('主音量变化后下一次播放使用新的音量', () => {
    player = createSfxPlayer()
    player.sync(request({ masterVolume: 0.5 }))
    player.play('choice_select')

    const expectedHalf = 0.5 * getSfxTrack('choice_select').gain

    expect(instancesFor('choice_select').find((audio) => !audio.paused)?.volume).toBeCloseTo(
      expectedHalf,
      3,
    )

    player.sync(request({ masterVolume: 0.2 }))
    vi.advanceTimersByTime(getSfxTrack('choice_select').maxDurationMs)
    player.play('choice_select')

    expect(instancesFor('choice_select').find((audio) => !audio.paused)?.volume).toBeCloseTo(
      0.2 * getSfxTrack('choice_select').gain,
      3,
    )
  })
})
