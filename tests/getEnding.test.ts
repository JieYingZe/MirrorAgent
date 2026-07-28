import { describe, expect, it, vi } from 'vitest'
import type { EndingId, FinalChoiceId, StoryChoiceId, StoryState } from '../src/types/story'
import { getEnding } from '../src/utils/story/getEnding'

type ProbeInput = {
  gentleness?: number
  honesty?: number
  control?: number
  selfAcceptance?: number
  finalChoice?: FinalChoiceId
  choices?: StoryChoiceId[]
}

function makeState(input: ProbeInput): StoryState {
  const choices = input.choices ?? []

  return {
    schemaVersion: 2,
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
      selectedAt: '2026-07-28T00:00:00.000Z',
    })),
    tags: [],
    flags: {},
    visitedNodeIds: ['ch5.ending_gate'],
    finalChoice: input.finalChoice,
    completed: true,
  }
}

/** 正式规则命中：断言结局并确认没有走兜底。 */
function resolve(input: ProbeInput): EndingId {
  const resolution = getEnding(makeState(input))

  expect(resolution.usedFallback).toBe(false)

  return resolution.endingId
}

/** 缺失 finalChoice 的异常存档：兜底会打印一条 warning，这里静音。 */
function resolveFallback(input: ProbeInput): EndingId {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    const resolution = getEnding(makeState(input))

    expect(resolution.usedFallback).toBe(true)

    return resolution.endingId
  } finally {
    warn.mockRestore()
  }
}

const strongChoices: StoryChoiceId[] = [
  'ch1_full_planning_authority',
  'ch2_delegate_message',
  'ch3_delegate_real_interaction',
]

describe('getEnding', () => {
  it('gives mirror_trap the highest priority', () => {
    expect(
      resolve({
        finalChoice: 'ask_identity',
        control: 8,
        selfAcceptance: 4,
        gentleness: 10,
        honesty: 4,
        choices: strongChoices,
      }),
    ).toBe('mirror_trap')
  })

  it('does not count duplicate strong delegation choices twice', () => {
    expect(
      resolve({
        finalChoice: 'ask_identity',
        control: 9,
        selfAcceptance: 3,
        gentleness: 8,
        honesty: 8,
        choices: [
          'ch1_full_planning_authority',
          'ch1_full_planning_authority',
          'ch2_delegate_message',
        ],
      }),
    ).not.toBe('mirror_trap')
  })

  it('keeps close_agent behavior consistent regardless of stats', () => {
    expect(resolve({ finalChoice: 'close_agent', control: 20, selfAcceptance: -3 })).toBe(
      'active_disconnection',
    )
  })

  it('keeps tool_only behavior consistent regardless of stats', () => {
    expect(resolve({ finalChoice: 'tool_only', control: 20, selfAcceptance: -3 })).toBe('symbiosis')
  })

  it('routes permanent_agent to soft_illusion when the soft profile matches', () => {
    expect(
      resolve({
        finalChoice: 'permanent_agent',
        gentleness: 5,
        honesty: 14,
        selfAcceptance: 12,
      }),
    ).toBe('soft_illusion')
  })

  it('routes other permanent_agent states to cruel_optimization', () => {
    expect(
      resolve({
        finalChoice: 'permanent_agent',
        gentleness: 4,
        honesty: 15,
        selfAcceptance: 13,
      }),
    ).toBe('cruel_optimization')
  })

  it('supports all four non-hidden ask_identity destinations', () => {
    expect(resolve({ finalChoice: 'ask_identity', selfAcceptance: 12, control: 2 })).toBe(
      'active_disconnection',
    )

    expect(resolve({ finalChoice: 'ask_identity', selfAcceptance: 8, control: 7 })).toBe('symbiosis')

    expect(
      resolve({
        finalChoice: 'ask_identity',
        gentleness: 5,
        honesty: 14,
        selfAcceptance: 7,
        control: 7,
      }),
    ).toBe('soft_illusion')

    expect(
      resolve({
        finalChoice: 'ask_identity',
        gentleness: 4,
        honesty: 15,
        selfAcceptance: 7,
        control: 8,
      }),
    ).toBe('cruel_optimization')
  })

  it('uses a safe fallback when finalChoice is missing', () => {
    expect(resolveFallback({ selfAcceptance: 10, control: 5 })).toBe('symbiosis')
    expect(resolveFallback({ gentleness: 5, honesty: 14 })).toBe('soft_illusion')
    expect(resolveFallback({ honesty: 11 })).toBe('cruel_optimization')
  })

  it('never leaks mirror_trap or active_disconnection through the fallback chain', () => {
    const sweep = [-4, 0, 4, 8, 12, 16]

    for (const gentleness of sweep) {
      for (const honesty of sweep) {
        for (const control of sweep) {
          for (const selfAcceptance of sweep) {
            const endingId = resolveFallback({
              gentleness,
              honesty,
              control,
              selfAcceptance,
              choices: strongChoices,
            })

            expect(endingId).not.toBe('mirror_trap')
            expect(endingId).not.toBe('active_disconnection')
          }
        }
      }
    }
  })
})
