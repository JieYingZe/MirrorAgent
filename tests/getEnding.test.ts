import { describe, expect, it, vi } from 'vitest'
import type { EndingVariantId, StoryChoiceId, StoryState } from '../src/types/story'
import type { FinalChoice } from '../src/types/game'
import { getEnding } from '../src/utils/story/getEnding'
import {
  BOUNDARY_RECOVERY_CHOICE_IDS,
  STRONG_DELEGATION_CHOICE_IDS,
} from '../src/data/story/rules/endingRules'
import { endingVariantIndex } from '../src/data/story'

/**
 * 结局规则的单元测试。
 *
 * 这里只验证「给定画像 + 最终行为 → 哪个玩家可见结局」，不走剧情图；
 * 「某条前置路径最终会通向哪里」在 tests/chapter5Flow.test.ts 里用真实数据验证。
 */

type ProbeInput = {
  gentleness?: number
  honesty?: number
  control?: number
  selfAcceptance?: number
  finalChoice?: FinalChoice
  choices?: readonly StoryChoiceId[]
}

function makeState(input: ProbeInput): StoryState {
  const choices = input.choices ?? []

  return {
    schemaVersion: 3,
    currentNodeId: 'ch5.ending_gate',
    stats: {
      gentleness: input.gentleness ?? 0,
      honesty: input.honesty ?? 0,
      control: input.control ?? 0,
      selfAcceptance: input.selfAcceptance ?? 0,
    },
    choiceHistory: choices.map((choiceId, index) => ({
      choiceId,
      nodeId: `test.node.${index}`,
      chapterId: 'chapter_5',
      choiceType: 'key',
      selectedAt: '2026-08-22T00:00:00.000Z',
    })),
    tags: [],
    flags: {},
    visitedNodeIds: ['ch5.ending_gate'],
    finalChoice: input.finalChoice,
    completed: true,
  }
}

/** 正式规则命中：断言可见结局并确认没有走兜底。 */
function resolve(input: ProbeInput): EndingVariantId {
  const resolution = getEnding(makeState(input))

  expect(resolution.usedFallback).toBe(false)

  return resolution.variantId
}

/** 缺失最终行为的异常存档：兜底会打印一条 warning，这里静音。 */
function resolveFallback(input: ProbeInput): EndingVariantId {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    const resolution = getEnding(makeState(input))

    expect(resolution.usedFallback).toBe(true)

    return resolution.variantId
  } finally {
    warn.mockRestore()
  }
}

const ASK_IDENTITY = 'ch5_ask_identity'
const strongTwo = STRONG_DELEGATION_CHOICE_IDS.slice(0, 2)
const strongThree = STRONG_DELEGATION_CHOICE_IDS.slice(0, 3)
const recoveryTwo = BOUNDARY_RECOVERY_CHOICE_IDS.slice(0, 2)

/** 稳定边界画像：极少强授权、高自我接纳、低控制。 */
const stableProfile = { selfAcceptance: 12, control: -4 } as const
/** 依赖残留画像：多次强授权、高控制、低自我接纳。 */
const dependentProfile = { selfAcceptance: 1, control: 13, choices: [...strongThree] } as const
/** 既不深也不稳。 */
const middleProfile = { selfAcceptance: 8, control: 3, choices: [strongThree[0]] } as const

describe('隐藏结局', () => {
  it('镜像困局拥有最高优先级，且不需要最终行为', () => {
    expect(
      resolve({
        control: 8,
        selfAcceptance: 4,
        gentleness: 10,
        honesty: 4,
        choices: [ASK_IDENTITY, ...strongThree],
      }),
    ).toBe('mirror_trap')
  })

  it('四个条件缺一不可', () => {
    const complete = {
      control: 8,
      selfAcceptance: 4,
      choices: [ASK_IDENTITY, ...strongThree],
    }

    // 没有追问过身份。
    expect(
      resolve({ ...complete, finalChoice: 'tool_only', choices: [...strongThree] }),
    ).not.toBe('mirror_trap')

    // control 差一点。
    expect(resolveFallback({ ...complete, control: 7 })).not.toBe('mirror_trap')

    // selfAcceptance 高一点。
    expect(resolveFallback({ ...complete, selfAcceptance: 5 })).not.toBe('mirror_trap')

    // 强授权不足三次。
    expect(
      resolveFallback({ ...complete, choices: [ASK_IDENTITY, ...strongTwo] }),
    ).not.toBe('mirror_trap')
  })

  it('同一条强授权记录重复出现也只计一次', () => {
    expect(
      resolveFallback({
        control: 9,
        selfAcceptance: 3,
        choices: [
          ASK_IDENTITY,
          STRONG_DELEGATION_CHOICE_IDS[0],
          STRONG_DELEGATION_CHOICE_IDS[0],
          STRONG_DELEGATION_CHOICE_IDS[0],
        ],
      }),
    ).not.toBe('mirror_trap')
  })

  it('追问身份后仍然完成了最终行为时，按最终行为判定', () => {
    expect(
      resolve({
        finalChoice: 'close_agent',
        control: 13,
        selfAcceptance: 1,
        choices: [ASK_IDENTITY, ...strongThree],
      }),
    ).toBe('disconnection_hard_extraction')
  })
})

describe('永久代理的三个结果', () => {
  it('语气被单向训练成保护时进入温柔幻觉', () => {
    expect(
      resolve({ finalChoice: 'permanent_agent', gentleness: 5, honesty: 10 }),
    ).toBe('soft_illusion')
  })

  it('语气被单向训练成纠正时进入残酷优化', () => {
    expect(
      resolve({ finalChoice: 'permanent_agent', gentleness: 4, honesty: 11 }),
    ).toBe('cruel_optimization')
  })

  it('两边都不突出时进入无声代行', () => {
    expect(
      resolve({ finalChoice: 'permanent_agent', gentleness: 4, honesty: 10, control: 9 }),
    ).toBe('silent_delegation')
  })

  it('两边都被训练过时同样进入无声代行', () => {
    expect(
      resolve({ finalChoice: 'permanent_agent', gentleness: 8, honesty: 14, control: 9 }),
    ).toBe('silent_delegation')
  })

  it('最终行为相同、前几章不同时，结果确实会变', () => {
    const results = new Set([
      resolve({ finalChoice: 'permanent_agent', gentleness: 6, honesty: 8 }),
      resolve({ finalChoice: 'permanent_agent', gentleness: 2, honesty: 13 }),
      resolve({ finalChoice: 'permanent_agent', gentleness: 3, honesty: 9 }),
    ])

    expect(results).toEqual(
      new Set(['soft_illusion', 'cruel_optimization', 'silent_delegation']),
    )
  })
})

describe('工具模式的四个结果', () => {
  it('一路保持边界时进入稳定边界', () => {
    expect(resolve({ finalChoice: 'tool_only', ...stableProfile })).toBe(
      'symbiosis_stable_boundary',
    )
  })

  it('依赖仍在时进入脆弱边界', () => {
    expect(resolve({ finalChoice: 'tool_only', ...dependentProfile })).toBe(
      'symbiosis_fragile_boundary',
    )
  })

  it('既不深也不稳时进入谨慎共生', () => {
    expect(resolve({ finalChoice: 'tool_only', ...middleProfile })).toBe('symbiosis_cautious')
  })

  it('交出过多次权限但明显恢复时进入边界重建', () => {
    expect(
      resolve({
        finalChoice: 'tool_only',
        selfAcceptance: 9,
        control: 4,
        choices: [...strongTwo, ...recoveryTwo],
      }),
    ).toBe('symbiosis_rebuilt_boundary')
  })

  /*
    最关键的一条：早期三次强授权不应把玩家永远钉在脆弱边界上。
    这个画像同时满足依赖残留（strongDelegationCount >= 3），
    边界重建必须靠优先级赢下来。
  */
  it('三次强授权之后明显恢复的路径仍然是边界重建，不是脆弱边界', () => {
    expect(
      resolve({
        finalChoice: 'tool_only',
        selfAcceptance: 9,
        control: 4,
        choices: [...strongThree, ...recoveryTwo],
      }),
    ).toBe('symbiosis_rebuilt_boundary')
  })

  it('只有授权历史、没有真正收回时不算重建', () => {
    expect(
      resolve({
        finalChoice: 'tool_only',
        selfAcceptance: 9,
        control: 4,
        choices: [...strongThree],
      }),
    ).toBe('symbiosis_fragile_boundary')
  })
})

describe('永久关闭的三个结果', () => {
  it('长期边界之后的关闭是主动断联', () => {
    expect(resolve({ finalChoice: 'close_agent', ...stableProfile })).toBe('disconnection_active')
  })

  it('深度授权之后的关闭是艰难抽离', () => {
    expect(resolve({ finalChoice: 'close_agent', ...dependentProfile })).toBe(
      'disconnection_hard_extraction',
    )
  })

  it('没有深陷也没有定型时是浅尝辄止', () => {
    expect(resolve({ finalChoice: 'close_agent', ...middleProfile })).toBe(
      'disconnection_shallow',
    )
  })

  it('关闭行为本身永远成立，变量只决定它发生在哪一段前史之后', () => {
    const results = new Set([
      resolve({ finalChoice: 'close_agent', ...stableProfile }),
      resolve({ finalChoice: 'close_agent', ...dependentProfile }),
      resolve({ finalChoice: 'close_agent', ...middleProfile }),
    ])

    expect(results.size).toBe(3)

    for (const variantId of results) {
      expect(endingVariantIndex.get(variantId)?.ending.id).toBe('active_disconnection')
    }
  })
})

describe('11 个玩家可见结局全部可达', () => {
  it('每一个都能通过某种画像与最终行为得到', () => {
    const reached = new Set<EndingVariantId>([
      resolve({ control: 8, selfAcceptance: 4, choices: [ASK_IDENTITY, ...strongThree] }),
      resolve({ finalChoice: 'permanent_agent', gentleness: 5, honesty: 10 }),
      resolve({ finalChoice: 'permanent_agent', gentleness: 4, honesty: 11 }),
      resolve({ finalChoice: 'permanent_agent', gentleness: 4, honesty: 10 }),
      resolve({ finalChoice: 'tool_only', ...stableProfile }),
      resolve({
        finalChoice: 'tool_only',
        selfAcceptance: 9,
        control: 4,
        choices: [...strongTwo, ...recoveryTwo],
      }),
      resolve({ finalChoice: 'tool_only', ...middleProfile }),
      resolve({ finalChoice: 'tool_only', ...dependentProfile }),
      resolve({ finalChoice: 'close_agent', ...stableProfile }),
      resolve({ finalChoice: 'close_agent', ...dependentProfile }),
      resolve({ finalChoice: 'close_agent', ...middleProfile }),
    ])

    expect(reached.size).toBe(11)
    expect(new Set(endingVariantIndex.keys())).toEqual(reached)
  })
})

describe('安全兜底', () => {
  it('缺失最终行为时只返回常规结局', () => {
    expect(resolveFallback({ selfAcceptance: 12, control: -4 })).toBe(
      'symbiosis_stable_boundary',
    )
    expect(resolveFallback({ control: 9, selfAcceptance: 2 })).toBe(
      'symbiosis_fragile_boundary',
    )
    expect(resolveFallback({ gentleness: 6, honesty: 8, selfAcceptance: 8, control: 3 })).toBe(
      'soft_illusion',
    )
    expect(resolveFallback({ gentleness: 2, honesty: 13, selfAcceptance: 8, control: 3 })).toBe(
      'cruel_optimization',
    )
    expect(resolveFallback({ gentleness: 4, honesty: 10, selfAcceptance: 8, control: 3 })).toBe(
      'symbiosis_cautious',
    )
  })

  it('兜底永远不会泄漏隐藏结局或任何永久关闭结局', () => {
    const sweep = [-8, -4, 0, 4, 8, 12, 16]

    for (const gentleness of sweep) {
      for (const honesty of sweep) {
        for (const control of sweep) {
          for (const selfAcceptance of sweep) {
            const variantId = resolveFallback({
              gentleness,
              honesty,
              control,
              selfAcceptance,
              choices: [...STRONG_DELEGATION_CHOICE_IDS],
            })

            expect(variantId).not.toBe('mirror_trap')
            expect(endingVariantIndex.get(variantId)?.ending.id).not.toBe('active_disconnection')
          }
        }
      }
    }
  })
})
