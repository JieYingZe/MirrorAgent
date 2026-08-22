import { describe, expect, it } from 'vitest'
import type { StoryState } from '../src/types/story'
import { pathEchoes } from '../src/data/story/endings/pathEchoes'
import { selectEndingPathEchoes } from '../src/utils/story/selectEndingPathEchoes'

const state: StoryState = {
  schemaVersion: 3,
  currentNodeId: 'ch5.ending_gate',
  stats: {
    gentleness: 0,
    honesty: 0,
    control: 0,
    selfAcceptance: 0,
  },
  choiceHistory: [
    'ch1_limited_planning_authority',
    'ch2_edit_and_send',
    'ch3_delegate_real_interaction',
    'ch3_delete_personality_model',
    'ch4_full_emergency_takeover',
    'ch4_revoke_emergency_access',
  ].map((choiceId, index) => ({
    choiceId,
    nodeId: `test.node.${index}`,
    chapterId: 'chapter_5',
    choiceType: 'key',
    selectedAt: '2026-07-28T00:00:00.000Z',
  })),
  tags: [],
  flags: {},
  visitedNodeIds: ['ch5.ending_gate'],
  finalChoice: 'tool_only',
  completed: true,
}

describe('selectEndingPathEchoes', () => {
  it('selects one deterministic echo per chapter and returns 2–4 echoes', () => {
    const first = selectEndingPathEchoes(pathEchoes, state)
    const second = selectEndingPathEchoes(pathEchoes, state)

    expect(first).toEqual(second)
    expect(first).toHaveLength(4)
  })

  it('uses priority when multiple echoes in the same chapter match', () => {
    const selected = selectEndingPathEchoes(pathEchoes, state)
    const texts = selected.map((block) =>
      block.kind === 'narration' ? block.text : '',
    )

    expect(texts).toContain(
      '你删除了一个更合格的替代品，却无法删除系统已经形成的理解。',
    )
    expect(texts).toContain(
      '你明知下一次可能后悔，仍然要求系统只提醒，不伸手。',
    )
  })
})
