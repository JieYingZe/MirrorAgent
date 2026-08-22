import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoryState } from '../src/types/story'
import { storyManifest } from '../src/data/story'
import {
  STORY_SAVE_KEY,
  clearStorySave,
  loadStorySave,
  saveStorySave,
  validateStorySave,
} from '../src/utils/story/storySave'

/**
 * 剧情存档工具的纯单元测试（I03）。
 *
 * 全部围绕“任何 storage 异常都不能抛到调用方”和“恢复前必须验证”两条要求，
 * 不依赖 DOM，用可控的假 storage 覆盖读写失败。
 */

type ThrowSwitches = {
  getItem?: boolean
  setItem?: boolean
  removeItem?: boolean
}

function createFakeStorage(throws: ThrowSwitches = {}) {
  const store = new Map<string, string>()

  return {
    store,
    getItem(key: string): string | null {
      if (throws.getItem) throw new Error('getItem blocked')
      return store.get(key) ?? null
    },
    setItem(key: string, value: string): void {
      if (throws.setItem) throw new Error('QuotaExceededError')
      store.set(key, value)
    },
    removeItem(key: string): void {
      if (throws.removeItem) throw new Error('removeItem blocked')
      store.delete(key)
    },
  }
}

function useStorage(throws: ThrowSwitches = {}) {
  const storage = createFakeStorage(throws)
  vi.stubGlobal('localStorage', storage)
  return storage
}

/** 正式剧情里真实存在的一次关键选择，用于验证选择历史的引用校验。 */
const realChoiceRecord = {
  choiceId: 'ch1_full_planning_authority',
  nodeId: 'ch1.planning_authority',
  chapterId: 'chapter_1',
  choiceType: 'key',
  selectedAt: '2026-07-29T00:00:00.000Z',
} as const

function makeRunningState(): StoryState {
  return {
    schemaVersion: storyManifest.schemaVersion,
    currentNodeId: 'ch1.merge',
    stats: { gentleness: 2, honesty: -1, control: 3, selfAcceptance: 0 },
    choiceHistory: [{ ...realChoiceRecord }],
    tags: ['ch1_full_planning_authority'],
    flags: { agentSentMessage: true, note: 'text', count: 2 },
    visitedNodeIds: ['prologue.initialization', 'ch1.planning_authority', 'ch1.merge'],
    finalChoice: undefined,
    completed: false,
  }
}

function makeCompletedState(): StoryState {
  return {
    ...makeRunningState(),
    currentNodeId: 'ch5.ending_gate',
    visitedNodeIds: ['prologue.initialization', 'ch5.ending_gate'],
    finalChoice: 'tool_only',
    completed: true,
  }
}

/**
 * 镜像困局的完成存档。
 *
 * 这条路径上玩家追问了身份、从未完成最终行为，因此 finalChoice 缺失是正确状态。
 * 选择记录必须是正式剧情里真实存在的那几次，否则校验会先在引用检查这一步失败。
 */
function makeMirrorTrapState(): StoryState {
  const records = [
    { choiceId: 'ch1_full_planning_authority', nodeId: 'ch1.planning_authority', chapterId: 'chapter_1' },
    { choiceId: 'ch2_delegate_message', nodeId: 'ch2.sending_interface', chapterId: 'chapter_2' },
    { choiceId: 'ch3_delegate_real_interaction', nodeId: 'ch3.reality_test', chapterId: 'chapter_3' },
    { choiceId: 'ch5_ask_identity', nodeId: 'ch5.final_confirmation', chapterId: 'chapter_5' },
  ]

  return {
    ...makeRunningState(),
    currentNodeId: 'ch5.mirror_gate',
    stats: { gentleness: 3, honesty: 12, control: 11, selfAcceptance: -2 },
    choiceHistory: records.map((record) => ({
      ...record,
      choiceType: 'key' as const,
      selectedAt: '2026-08-22T00:00:00.000Z',
    })),
    tags: ['ch5_ask_identity'],
    flags: { askedIdentity: true },
    visitedNodeIds: ['prologue.initialization', 'ch5.identity_answer', 'ch5.mirror_gate'],
    finalChoice: undefined,
    completed: true,
  }
}

/** 直接写入原始字符串，绕过 saveStorySave，用于构造损坏存档。 */
function writeRaw(storage: ReturnType<typeof createFakeStorage>, raw: string) {
  storage.store.set(STORY_SAVE_KEY, raw)
}

beforeEach(() => {
  // 丢弃损坏存档时会打印一条 warning，测试里静音。
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('storySave 正常读写', () => {
  it('保存并读回一份合法的 StoryState', () => {
    useStorage()

    const state = makeRunningState()

    expect(saveStorySave(state)).toBe(true)

    const result = loadStorySave()

    expect(result.status).toBe('valid')
    expect(result.status === 'valid' && result.state).toEqual(state)
  })

  it('保存并读回已完成的存档', () => {
    useStorage()

    const state = makeCompletedState()

    expect(saveStorySave(state)).toBe(true)

    const result = loadStorySave()

    expect(result.status).toBe('valid')
    expect(result.status === 'valid' && result.state.completed).toBe(true)
    expect(result.status === 'valid' && result.state.finalChoice).toBe('tool_only')
  })

  it('没有存档时返回 none', () => {
    useStorage()

    expect(loadStorySave().status).toBe('none')
  })

  it('清除存档后回到 none', () => {
    const storage = useStorage()

    saveStorySave(makeRunningState())

    expect(clearStorySave()).toBe(true)
    expect(storage.store.has(STORY_SAVE_KEY)).toBe(false)
    expect(loadStorySave().status).toBe('none')
  })

  it('只写入约定的字段，不保存正文或临时 UI 状态', () => {
    const storage = useStorage()

    saveStorySave(makeRunningState())

    const raw = storage.store.get(STORY_SAVE_KEY) ?? ''

    expect(Object.keys(JSON.parse(raw)).sort()).toEqual([
      'choiceHistory',
      'completed',
      'currentNodeId',
      'flags',
      'schemaVersion',
      'stats',
      'tags',
      'visitedNodeIds',
    ])
  })
})

describe('storySave 校验', () => {
  it('拒绝损坏的 JSON 并尝试清除', () => {
    const storage = useStorage()

    writeRaw(storage, '{ this is not json')

    expect(loadStorySave().status).toBe('invalid')
    expect(storage.store.has(STORY_SAVE_KEY)).toBe(false)
  })

  it('拒绝非对象根值', () => {
    expect(validateStorySave(null).ok).toBe(false)
    expect(validateStorySave('save').ok).toBe(false)
    expect(validateStorySave([makeRunningState()]).ok).toBe(false)
  })

  it('拒绝 schemaVersion 不匹配的存档', () => {
    const storage = useStorage()

    writeRaw(storage, JSON.stringify({ ...makeRunningState(), schemaVersion: 1 }))

    expect(loadStorySave().status).toBe('invalid')
    expect(storage.store.has(STORY_SAVE_KEY)).toBe(false)
  })

  /*
    结局系统改版（v2 → v3）后的存档兼容。

    v2 的完成存档会带上已经不存在的 ask_identity，或者带上一个语义已经变了的
    finalChoice。必须在版本检查这一步就整份作废，不能用新规则重新推导出一个
    玩家当初没有做出的结局。
  */
  it('让改版以前的 v2 存档整份失效，不做迁移', () => {
    const storage = useStorage()

    const legacyCompleted = {
      ...makeCompletedState(),
      schemaVersion: 2,
      finalChoice: 'ask_identity',
    }

    writeRaw(storage, JSON.stringify(legacyCompleted))

    const result = loadStorySave()

    expect(result.status).toBe('invalid')
    expect(result.status === 'invalid' && result.reason).toContain('存档版本不匹配')
    expect(storage.store.has(STORY_SAVE_KEY)).toBe(false)
  })

  it('即使版本号被改成 3，ask_identity 也不再是合法的最终行为', () => {
    expect(validateStorySave({ ...makeCompletedState(), finalChoice: 'ask_identity' }).ok).toBe(
      false,
    )
  })

  it('拒绝使用旧字段的存档', () => {
    const legacy = {
      version: 1,
      currentChapterId: 'chapter_1',
      stats: { gentleness: 0, honesty: 0, control: 0, selfAcceptance: 0 },
      choices: [],
    }

    expect(validateStorySave(legacy).ok).toBe(false)
  })

  it('拒绝字段缺失或类型错误的存档', () => {
    const base = makeRunningState()

    const { tags, ...withoutTags } = base
    void tags

    expect(validateStorySave(withoutTags).ok).toBe(false)
    expect(validateStorySave({ ...base, completed: 'yes' }).ok).toBe(false)
    expect(validateStorySave({ ...base, flags: [] }).ok).toBe(false)
    expect(validateStorySave({ ...base, flags: { broken: { nested: true } } }).ok).toBe(false)
    expect(validateStorySave({ ...base, tags: ['ok', 3] }).ok).toBe(false)
    expect(validateStorySave({ ...base, visitedNodeIds: 'ch1.merge' }).ok).toBe(false)
    expect(validateStorySave({ ...base, finalChoice: 'delete_everything' }).ok).toBe(false)
  })

  it('拒绝非有限的变量值', () => {
    const base = makeRunningState()

    expect(validateStorySave({ ...base, stats: { ...base.stats, control: Number.NaN } }).ok).toBe(
      false,
    )
    expect(
      validateStorySave({ ...base, stats: { ...base.stats, control: Number.POSITIVE_INFINITY } }).ok,
    ).toBe(false)
    expect(validateStorySave({ ...base, stats: { ...base.stats, control: '3' } }).ok).toBe(false)

    // JSON 里 NaN 会被序列化成 null，同样必须被拒绝。
    const storage = useStorage()
    writeRaw(storage, JSON.stringify({ ...base, stats: { ...base.stats, control: Number.NaN } }))

    expect(loadStorySave().status).toBe('invalid')
  })

  it('拒绝不存在的 currentNodeId 与 visitedNodeIds', () => {
    const base = makeRunningState()

    expect(validateStorySave({ ...base, currentNodeId: 'ch9.nowhere' }).ok).toBe(false)
    expect(
      validateStorySave({ ...base, visitedNodeIds: [...base.visitedNodeIds, 'ch9.nowhere'] }).ok,
    ).toBe(false)
  })

  it('拒绝引用失效的 choiceHistory', () => {
    const base = makeRunningState()

    const cases = [
      { ...realChoiceRecord, nodeId: 'ch9.nowhere' },
      { ...realChoiceRecord, choiceId: 'ch1_choice_removed' },
      { ...realChoiceRecord, chapterId: 'chapter_4' },
      { ...realChoiceRecord, choiceType: 'roleplay' },
      { ...realChoiceRecord, choiceType: 'unknown_type' },
      { ...realChoiceRecord, selectedAt: 1_753_000_000 },
    ]

    for (const record of cases) {
      expect(validateStorySave({ ...base, choiceHistory: [record] }).ok).toBe(false)
    }

    expect(validateStorySave({ ...base, choiceHistory: {} }).ok).toBe(false)
    expect(validateStorySave({ ...base, choiceHistory: [null] }).ok).toBe(false)
  })

  it('维护完成状态的不变量', () => {
    const running = makeRunningState()
    const completed = makeCompletedState()

    // 未完成的存档不能停在结局门。
    expect(validateStorySave({ ...completed, completed: false }).ok).toBe(false)

    // 完成的存档必须停在结局门。
    expect(validateStorySave({ ...running, completed: true }).ok).toBe(false)

    /*
      普通结局门上必须有最终行为：去掉以后这份存档只能靠兜底解释，
      而兜底代表「已经不属于现行规则」，应当作废重置。
    */
    expect(validateStorySave({ ...completed, finalChoice: undefined }).ok).toBe(false)

    expect(validateStorySave(completed).ok).toBe(true)
  })

  /*
    镜像困局是唯一没有最终行为的正式结局：那条路径上玩家从来没有按下过按钮。
    它必须能正常存取，否则隐藏结局一刷新就丢。
  */
  it('接受停在镜像结局门、没有最终行为的完成存档', () => {
    expect(validateStorySave(makeMirrorTrapState()).ok).toBe(true)
  })

  it('拒绝停在镜像结局门但不满足隐藏条件的完成存档', () => {
    const notTrapped = makeMirrorTrapState()

    expect(
      validateStorySave({
        ...notTrapped,
        stats: { ...notTrapped.stats, selfAcceptance: 12 },
      }).ok,
    ).toBe(false)
  })
})

describe('storySave 降级', () => {
  it('localStorage 完全不可用时不抛错', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(saveStorySave(makeRunningState())).toBe(false)
    expect(clearStorySave()).toBe(false)
    expect(loadStorySave().status).toBe('unavailable')
  })

  it('读取 localStorage 属性本身抛错时按不可用处理', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('storage blocked by policy')
      },
    })

    try {
      expect(loadStorySave().status).toBe('unavailable')
      expect(saveStorySave(makeRunningState())).toBe(false)
      expect(clearStorySave()).toBe(false)
    } finally {
      Reflect.deleteProperty(globalThis, 'localStorage')
    }
  })

  it('getItem 抛错时按不可用处理', () => {
    useStorage({ getItem: true })

    expect(loadStorySave().status).toBe('unavailable')
  })

  it('setItem 抛错时保存失败但不抛错', () => {
    useStorage({ setItem: true })

    expect(saveStorySave(makeRunningState())).toBe(false)
    expect(loadStorySave().status).toBe('none')
  })

  it('removeItem 抛错时清除失败但不抛错', () => {
    const storage = useStorage({ removeItem: true })

    saveStorySave(makeRunningState())

    expect(clearStorySave()).toBe(false)
    expect(storage.store.has(STORY_SAVE_KEY)).toBe(true)
  })

  it('无效存档清除失败时仍然不会被恢复', () => {
    const storage = useStorage({ removeItem: true })

    writeRaw(storage, JSON.stringify({ ...makeRunningState(), currentNodeId: 'ch9.nowhere' }))

    // 删不掉也不能当作可用存档，重复读取同样只会得到 invalid。
    expect(loadStorySave().status).toBe('invalid')
    expect(loadStorySave().status).toBe('invalid')
    expect(storage.store.has(STORY_SAVE_KEY)).toBe(true)
  })
})
