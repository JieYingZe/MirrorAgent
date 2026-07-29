import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_USER_PREFERENCES,
  USER_PREFERENCES_KEY,
  loadUserPreferences,
  normalizeUserPreferences,
  saveUserPreferences,
} from '../src/utils/userPreferences'
import { STORY_SAVE_KEY, loadStorySave } from '../src/utils/story/storySave'

/**
 * 本地用户偏好。
 *
 * 关键约束：默认关闭自动播放、任何损坏都只回落默认值不抛错、
 * 与 I03 剧情存档用不同的 key 且互不影响。
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
  it('自动播放默认关闭', () => {
    expect(DEFAULT_USER_PREFERENCES).toEqual({ version: 1, autoplayEnabled: false })
  })

  it('首次进入（没有任何偏好）时自动播放关闭', () => {
    installStorage()

    expect(loadUserPreferences().autoplayEnabled).toBe(false)
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
    expect(normalizeUserPreferences({ version: 1 })).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('字段类型错误时忽略该值', () => {
    expect(normalizeUserPreferences({ autoplayEnabled: 'yes' }).autoplayEnabled).toBe(false)
    expect(normalizeUserPreferences({ autoplayEnabled: 1 }).autoplayEnabled).toBe(false)
  })

  it('未知字段被丢弃，认得的字段照常保留', () => {
    const result = normalizeUserPreferences({
      version: 99,
      autoplayEnabled: true,
      volume: 0.5,
      未来字段: '随便',
    })

    expect(result).toEqual({ version: 1, autoplayEnabled: true })
  })
})

describe('读写', () => {
  it('开启后保存，再次读取仍为开启（等价于刷新页面）', () => {
    const store = installStorage()

    expect(saveUserPreferences({ version: 1, autoplayEnabled: true })).toBe(true)
    expect(store[USER_PREFERENCES_KEY]).toBe('{"version":1,"autoplayEnabled":true}')
    expect(loadUserPreferences().autoplayEnabled).toBe(true)
  })

  it('关闭后同样保存并保持', () => {
    installStorage({ [USER_PREFERENCES_KEY]: '{"version":1,"autoplayEnabled":true}' })

    saveUserPreferences({ version: 1, autoplayEnabled: false })

    expect(loadUserPreferences().autoplayEnabled).toBe(false)
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
    expect(saveUserPreferences({ version: 1, autoplayEnabled: true })).toBe(false)
  })

  it('getItem 抛错时回落默认值', () => {
    installStorage({}, {
      getItem: () => {
        throw new Error('denied')
      },
    })

    expect(loadUserPreferences()).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('setItem 抛错时不影响继续游玩', () => {
    installStorage({}, {
      setItem: () => {
        throw new Error('quota')
      },
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(saveUserPreferences({ version: 1, autoplayEnabled: true })).toBe(false)
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

    saveUserPreferences({ version: 1, autoplayEnabled: true })

    expect(store[STORY_SAVE_KEY]).toBe('STORY-SAVE-UNTOUCHED')
    expect(Object.keys(store).sort()).toEqual([STORY_SAVE_KEY, USER_PREFERENCES_KEY].sort())
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
      [USER_PREFERENCES_KEY]: '{"version":1,"autoplayEnabled":true}',
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(loadStorySave().status).toBe('invalid')
    expect(loadUserPreferences().autoplayEnabled).toBe(true)
  })
})
