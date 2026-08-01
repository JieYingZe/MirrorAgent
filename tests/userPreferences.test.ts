import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_USER_PREFERENCES,
  USER_PREFERENCES_KEY,
  USER_PREFERENCES_VERSION,
  loadUserPreferences,
  normalizeUserPreferences,
  saveUserPreferences,
} from '../src/utils/userPreferences'
import { DEFAULT_MASTER_VOLUME } from '../src/data/audioTracks'
import { STORY_SAVE_KEY, clearStorySave, loadStorySave } from '../src/utils/story/storySave'

/**
 * 本地用户偏好（I01 自动播放 + A01 音频）。
 *
 * 关键约束：默认关闭自动播放、默认有声、旧版本偏好能升级且不丢自动播放、
 * 任何损坏都只回落默认值不抛错、与 I03 剧情存档用不同的 key 且互不影响。
 */

type StoreShape = Record<string, string>

function installStorage(initial: StoreShape = {}, overrides: Partial<Storage> = {}) {
  const store: StoreShape = { ...initial }

  const storage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key]
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length
    },
    ...overrides,
  } as Storage

  vi.stubGlobal('localStorage', storage)

  return store
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('默认值', () => {
  it('自动播放默认关闭，声音默认开启，音量来自音频层的集中定义', () => {
    expect(DEFAULT_USER_PREFERENCES).toEqual({
      version: USER_PREFERENCES_VERSION,
      autoplayEnabled: false,
      bgmMuted: false,
      sfxMuted: false,
      masterVolume: DEFAULT_MASTER_VOLUME,
    })
  })

  it('主音量默认值在 0–1 之间且保持低存在感', () => {
    expect(DEFAULT_MASTER_VOLUME).toBeGreaterThan(0)
    expect(DEFAULT_MASTER_VOLUME).toBeLessThanOrEqual(0.7)
  })

  it('首次进入（没有任何偏好）时自动播放关闭、两个音频通道都有声', () => {
    installStorage()

    const preferences = loadUserPreferences()

    expect(preferences.autoplayEnabled).toBe(false)
    expect(preferences.bgmMuted).toBe(false)
    expect(preferences.sfxMuted).toBe(false)
  })
})

describe('normalizeUserPreferences', () => {
  const fallbackCases: Array<[string, unknown]> = [
    ['null', null],
    ['undefined', undefined],
    ['数组', []],
    ['字符串', 'true'],
    ['数字', 1],
  ]

  for (const [name, raw] of fallbackCases) {
    it(`${name} 回落到默认值`, () => {
      expect(normalizeUserPreferences(raw)).toEqual(DEFAULT_USER_PREFERENCES)
    })
  }

  it('缺字段时与默认值合并', () => {
    expect(normalizeUserPreferences({ version: 2 })).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('字段类型错误时忽略该值', () => {
    expect(normalizeUserPreferences({ autoplayEnabled: 'yes' }).autoplayEnabled).toBe(false)
    expect(normalizeUserPreferences({ autoplayEnabled: 1 }).autoplayEnabled).toBe(false)
    expect(normalizeUserPreferences({ bgmMuted: 'true' }).bgmMuted).toBe(false)
    expect(normalizeUserPreferences({ sfxMuted: 1 }).sfxMuted).toBe(false)
  })

  it('未知字段被丢弃，认得的字段照常保留', () => {
    const result = normalizeUserPreferences({
      version: 99,
      autoplayEnabled: true,
      bgmMuted: true,
      sfxMuted: false,
      未来字段: '随便',
    })

    expect(result).toEqual({
      version: USER_PREFERENCES_VERSION,
      autoplayEnabled: true,
      bgmMuted: true,
      sfxMuted: false,
      masterVolume: DEFAULT_MASTER_VOLUME,
    })
  })

  describe('主音量校验', () => {
    const volumeCases: Array<[string, unknown, number]> = [
      ['正常值原样保留', 0.3, 0.3],
      ['0 保留', 0, 0],
      ['1 保留', 1, 1],
      ['超过 1 夹到 1', 4, 1],
      ['负数夹到 0', -1, 0],
      ['NaN 回落默认值', Number.NaN, DEFAULT_MASTER_VOLUME],
      ['Infinity 回落默认值', Number.POSITIVE_INFINITY, DEFAULT_MASTER_VOLUME],
      ['字符串回落默认值', '0.5', DEFAULT_MASTER_VOLUME],
      ['null 回落默认值', null, DEFAULT_MASTER_VOLUME],
    ]

    for (const [name, raw, expected] of volumeCases) {
      it(name, () => {
        expect(normalizeUserPreferences({ masterVolume: raw }).masterVolume).toBe(expected)
      })
    }
  })
})

describe('版本升级与旧数据兼容', () => {
  it('v1 偏好升级到当前版本时保留自动播放，音频字段取默认值', () => {
    installStorage({ [USER_PREFERENCES_KEY]: '{"version":1,"autoplayEnabled":true}' })

    expect(loadUserPreferences()).toEqual({
      version: USER_PREFERENCES_VERSION,
      autoplayEnabled: true,
      bgmMuted: false,
      sfxMuted: false,
      masterVolume: DEFAULT_MASTER_VOLUME,
    })
  })

  it('v1 且自动播放为关时，升级后仍然是关', () => {
    installStorage({ [USER_PREFERENCES_KEY]: '{"version":1,"autoplayEnabled":false}' })

    expect(loadUserPreferences().autoplayEnabled).toBe(false)
  })

  it('升级只发生在内存里；写回时才落盘成新版本结构', () => {
    const store = installStorage({ [USER_PREFERENCES_KEY]: '{"version":1,"autoplayEnabled":true}' })

    expect(store[USER_PREFERENCES_KEY]).toBe('{"version":1,"autoplayEnabled":true}')

    saveUserPreferences(loadUserPreferences())

    expect(JSON.parse(store[USER_PREFERENCES_KEY])).toEqual({
      version: USER_PREFERENCES_VERSION,
      autoplayEnabled: true,
      bgmMuted: false,
      sfxMuted: false,
      masterVolume: DEFAULT_MASTER_VOLUME,
    })
  })

  /*
    A03 试玩修订：单一的 muted 拆成 bgmMuted / sfxMuted。

    迁移不是一个独立的 migrate 函数，而是读取时的一条回落链
    （新字段 → 旧 muted → 默认值），因此这几个用例覆盖的就是运行时真实走的路径。
  */
  describe('v2 → v3：单一静音拆成两个通道', () => {
    it('旧 muted: true 迁移为两个通道都关闭', () => {
      installStorage({
        [USER_PREFERENCES_KEY]: '{"version":2,"autoplayEnabled":false,"muted":true}',
      })

      const preferences = loadUserPreferences()

      expect(preferences.bgmMuted).toBe(true)
      expect(preferences.sfxMuted).toBe(true)
    })

    it('旧 muted: false 迁移为两个通道都开启', () => {
      installStorage({
        [USER_PREFERENCES_KEY]: '{"version":2,"autoplayEnabled":false,"muted":false}',
      })

      const preferences = loadUserPreferences()

      expect(preferences.bgmMuted).toBe(false)
      expect(preferences.sfxMuted).toBe(false)
    })

    it('迁移不丢失 autoplayEnabled 与 masterVolume', () => {
      installStorage({
        [USER_PREFERENCES_KEY]:
          '{"version":2,"autoplayEnabled":true,"muted":true,"masterVolume":0.3}',
      })

      const preferences = loadUserPreferences()

      expect(preferences.autoplayEnabled).toBe(true)
      expect(preferences.masterVolume).toBe(0.3)
      expect(preferences.bgmMuted).toBe(true)
      expect(preferences.sfxMuted).toBe(true)
    })

    it('写回之后旧的 muted 字段不再出现在存储里', () => {
      const store = installStorage({
        [USER_PREFERENCES_KEY]: '{"version":2,"autoplayEnabled":true,"muted":true}',
      })

      saveUserPreferences(loadUserPreferences())

      const written = JSON.parse(store[USER_PREFERENCES_KEY])

      expect(written.version).toBe(USER_PREFERENCES_VERSION)
      expect(written.muted).toBeUndefined()
      expect(written.bgmMuted).toBe(true)
      expect(written.sfxMuted).toBe(true)
      expect(written.autoplayEnabled).toBe(true)
    })

    it('新字段存在时以新字段为准，旧 muted 不再干扰', () => {
      installStorage({
        [USER_PREFERENCES_KEY]:
          '{"version":3,"muted":true,"bgmMuted":false,"sfxMuted":true,"autoplayEnabled":true}',
      })

      const preferences = loadUserPreferences()

      expect(preferences.bgmMuted).toBe(false)
      expect(preferences.sfxMuted).toBe(true)
    })

    it('只坏了一个新字段时，它单独回落到旧 muted，另一个不受影响', () => {
      installStorage({
        [USER_PREFERENCES_KEY]: '{"version":3,"muted":true,"bgmMuted":"坏了","sfxMuted":false}',
      })

      const preferences = loadUserPreferences()

      expect(preferences.bgmMuted).toBe(true)
      expect(preferences.sfxMuted).toBe(false)
    })

    it('v1 偏好（连 muted 都没有）迁移为两个通道都开启', () => {
      installStorage({ [USER_PREFERENCES_KEY]: '{"version":1,"autoplayEnabled":true}' })

      const preferences = loadUserPreferences()

      expect(preferences.bgmMuted).toBe(false)
      expect(preferences.sfxMuted).toBe(false)
      expect(preferences.autoplayEnabled).toBe(true)
    })
  })

  it('缺 version 的更早期数据同样按字段回收', () => {
    installStorage({ [USER_PREFERENCES_KEY]: '{"autoplayEnabled":true}' })

    expect(loadUserPreferences().autoplayEnabled).toBe(true)
  })

  it('未来版本号不会让整份偏好作废', () => {
    installStorage({
      [USER_PREFERENCES_KEY]:
        '{"version":99,"autoplayEnabled":true,"bgmMuted":true,"sfxMuted":false}',
    })

    const preferences = loadUserPreferences()

    expect(preferences.autoplayEnabled).toBe(true)
    expect(preferences.bgmMuted).toBe(true)
    expect(preferences.sfxMuted).toBe(false)
  })
})

describe('读写', () => {
  it('开启后保存，再次读取仍为开启（等价于刷新页面）', () => {
    const store = installStorage()

    expect(
      saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, autoplayEnabled: true }),
    ).toBe(true)
    expect(JSON.parse(store[USER_PREFERENCES_KEY]).autoplayEnabled).toBe(true)
    expect(loadUserPreferences().autoplayEnabled).toBe(true)
  })

  it('关闭后同样保存并保持', () => {
    installStorage({ [USER_PREFERENCES_KEY]: '{"version":2,"autoplayEnabled":true}' })

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, autoplayEnabled: false })

    expect(loadUserPreferences().autoplayEnabled).toBe(false)
  })

  it('两个音频通道可以分别保存并在刷新后保留', () => {
    installStorage()

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, bgmMuted: true, sfxMuted: false })

    expect(loadUserPreferences().bgmMuted).toBe(true)
    expect(loadUserPreferences().sfxMuted).toBe(false)

    saveUserPreferences({ ...loadUserPreferences(), bgmMuted: false, sfxMuted: true })

    expect(loadUserPreferences().bgmMuted).toBe(false)
    expect(loadUserPreferences().sfxMuted).toBe(true)
  })

  it('切换一个通道不会覆盖另一个通道', () => {
    installStorage()

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, sfxMuted: true })
    saveUserPreferences({ ...loadUserPreferences(), bgmMuted: true })

    const both = loadUserPreferences()

    expect(both.sfxMuted).toBe(true)
    expect(both.bgmMuted).toBe(true)

    // 只恢复背景音乐，音效仍然关着。
    saveUserPreferences({ ...both, bgmMuted: false })

    const next = loadUserPreferences()

    expect(next.bgmMuted).toBe(false)
    expect(next.sfxMuted).toBe(true)
  })

  it('整份写回：改音频通道不会顺手把自动播放改掉', () => {
    installStorage()

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, autoplayEnabled: true })

    const current = loadUserPreferences()

    saveUserPreferences({ ...current, bgmMuted: true, sfxMuted: true })

    const next = loadUserPreferences()

    expect(next.autoplayEnabled).toBe(true)
    expect(next.bgmMuted).toBe(true)
    expect(next.sfxMuted).toBe(true)
  })

  it('整份写回：改自动播放也不会把两个音频通道抹掉', () => {
    installStorage()

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, bgmMuted: true, sfxMuted: true })

    const current = loadUserPreferences()

    saveUserPreferences({ ...current, autoplayEnabled: true })

    const next = loadUserPreferences()

    expect(next.bgmMuted).toBe(true)
    expect(next.sfxMuted).toBe(true)
    expect(next.autoplayEnabled).toBe(true)
  })

  it('保存时同样会做一次校验，越界音量不会被写进去', () => {
    const store = installStorage()

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, masterVolume: 9 })

    expect(JSON.parse(store[USER_PREFERENCES_KEY]).masterVolume).toBe(1)
  })

  it('JSON 损坏时回落默认值，且不抛错', () => {
    installStorage({ [USER_PREFERENCES_KEY]: '{ 这不是 JSON' })

    expect(() => loadUserPreferences()).not.toThrow()
    expect(loadUserPreferences()).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('localStorage 完全不可用时按默认值继续，保存只返回 false', () => {
    vi.stubGlobal('localStorage', undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(loadUserPreferences()).toEqual(DEFAULT_USER_PREFERENCES)
    expect(saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, sfxMuted: true })).toBe(false)
  })

  it('getItem 抛错时回落默认值', () => {
    installStorage(
      {},
      {
        getItem: () => {
          throw new Error('denied')
        },
      },
    )

    expect(loadUserPreferences()).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('setItem 抛错时不影响继续游玩', () => {
    installStorage(
      {},
      {
        setItem: () => {
          throw new Error('quota')
        },
      },
    )
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, sfxMuted: true })).toBe(false)
    expect(() => loadUserPreferences()).not.toThrow()
  })
})

describe('与 I03 剧情存档完全分离', () => {
  it('使用不同的 key', () => {
    expect(USER_PREFERENCES_KEY).toBe('mirror-agent:user-preferences')
    expect(USER_PREFERENCES_KEY).not.toBe(STORY_SAVE_KEY)
  })

  it('保存偏好不会写到剧情存档上', () => {
    const store = installStorage({ [STORY_SAVE_KEY]: 'STORY-SAVE-UNTOUCHED' })

    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, autoplayEnabled: true })

    expect(store[STORY_SAVE_KEY]).toBe('STORY-SAVE-UNTOUCHED')
    expect(Object.keys(store).sort()).toEqual([STORY_SAVE_KEY, USER_PREFERENCES_KEY].sort())
  })

  it('重新初始化剧情（清空剧情存档）不会清除音频偏好', () => {
    const store = installStorage({ [STORY_SAVE_KEY]: 'STORY-SAVE' })

    saveUserPreferences({
      ...DEFAULT_USER_PREFERENCES,
      bgmMuted: true,
      sfxMuted: true,
      autoplayEnabled: true,
    })

    expect(clearStorySave()).toBe(true)

    expect(store[STORY_SAVE_KEY]).toBeUndefined()
    expect(store[USER_PREFERENCES_KEY]).toBeDefined()
    expect(loadUserPreferences().bgmMuted).toBe(true)
    expect(loadUserPreferences().sfxMuted).toBe(true)
    expect(loadUserPreferences().autoplayEnabled).toBe(true)
  })

  it('偏好损坏不影响剧情存档的读取结果', () => {
    installStorage({ [USER_PREFERENCES_KEY]: 'broken' })
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(loadUserPreferences()).toEqual(DEFAULT_USER_PREFERENCES)
    // 没有剧情存档时仍然是干净的 none，而不是被偏好污染成 invalid。
    expect(loadStorySave().status).toBe('none')
  })

  it('剧情存档损坏也不影响偏好读取', () => {
    installStorage({
      [STORY_SAVE_KEY]: '{ 坏掉的存档',
      [USER_PREFERENCES_KEY]: '{"version":3,"autoplayEnabled":true,"sfxMuted":true}',
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(loadStorySave().status).toBe('invalid')
    expect(loadUserPreferences().autoplayEnabled).toBe(true)
    expect(loadUserPreferences().sfxMuted).toBe(true)
  })
})
