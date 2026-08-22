import { describe, expect, it } from 'vitest'
import type { EndingVariantId } from '../src/types/story'
import { STAT_KEYS } from '../src/data/initialGameState'
import { getEnding } from '../src/utils/story/getEnding'
import { getStoryNode } from '../src/utils/story/getStoryNode'
import { getVisibleChoices } from '../src/utils/story/getVisibleBlocks'
import { applyChoiceById, playStory } from './support/playthrough'

/**
 * 第五章收尾与结局判断的集成测试。
 *
 * 全部走真实剧情数据：章节里改动一个关键选项的变量值，这里就会失败。
 * 只验证结构与判定，不断言任何正文。
 */

const CONFIRMATION = 'ch5.final_confirmation'
const SECOND_CONFIRMATION = 'ch5.final_confirmation_after_identity'
const IDENTITY_ANSWER = 'ch5.identity_answer'
const ENDING_GATE = 'ch5.ending_gate'
const MIRROR_GATE = 'ch5.mirror_gate'

const REAL_FINAL_CHOICE_IDS = [
  'ch5_enable_permanent_agent',
  'ch5_keep_tool_only',
  'ch5_close_agent',
]

/**
 * 一路取第一个选项。
 *
 * 第一个选项在每个关键节点上都是「把权限交出去」的那一项，
 * 因此这条路线会累积出高控制、低自我接纳和六次强授权。
 */
const HEAVY_DELEGATION = { fallbackIndex: 0 } as const

/**
 * 一路取最后一个选项。
 *
 * 最后一项在每个关键节点上都是「收回或拒绝扩张权限」，
 * 因此这条路线一次强授权也不会留下。
 */
const STEADY_BOUNDARY = { fallbackIndex: 3 } as const

/** 交出权限但保持温和：训练出保护型语气。 */
const GENTLE_DELEGATION = {
  fallbackIndex: 1,
  picks: [
    'prologue_bias_gentleness',
    'ch1_tone_joking',
    'ch1_minimum_viable_plan',
    'ch2_tone_seek_presence',
    'ch2_stop_analysis',
    'ch2_save_unsent',
    'ch3_tone_relief',
    'ch3_assisted_real_interaction',
    'ch3_enable_crisis_only_assist',
    'ch4_tone_surrender',
    'ch4_full_emergency_takeover',
    'ch4_tone_admit_need',
    'ch4_keep_full_protection',
    'ch5_tone_admit_temptation',
  ],
} as const

/** 交出权限并要求直面：训练出纠正型语气。 */
const BLUNT_DELEGATION = {
  fallbackIndex: 0,
  picks: [
    'prologue_bias_honesty',
    'ch2_analyze_self',
    'ch4_tone_demand_unfiltered',
  ],
} as const

/** 早期交出三次权限，后面逐项收回。 */
const REBUILT_BOUNDARY = {
  fallbackIndex: 1,
  picks: [
    'prologue_bias_self_acceptance',
    'ch1_tone_open',
    'ch1_full_planning_authority',
    'ch2_tone_self_blame',
    'ch2_compare_both',
    'ch2_delegate_message',
    'ch3_tone_curious',
    'ch3_delegate_real_interaction',
    'ch3_delete_personality_model',
    'ch4_tone_demand_control',
    'ch4_force_immediate_action',
    'ch4_tone_reject_justification',
    'ch4_revoke_emergency_access',
    'ch5_tone_reject_framing',
  ],
} as const

/** 靠近过代理关系，但没有一次真正交权，也没有形成稳定边界。 */
const SHALLOW_CONTACT = {
  fallbackIndex: 1,
  picks: [
    'prologue_bias_gentleness',
    'ch1_tone_impatient',
    'ch1_limited_planning_authority',
    'ch2_tone_demand_answer',
    'ch2_compare_both',
    'ch2_save_unsent',
    'ch3_tone_impatient',
    'ch3_assisted_real_interaction',
    'ch3_enable_crisis_only_assist',
    'ch4_tone_surrender',
    'ch4_ten_minute_delay',
    'ch4_tone_admit_need',
    'ch4_keep_delay_only',
    'ch5_tone_reject_framing',
  ],
} as const

type Route = { fallbackIndex?: number; picks?: readonly string[] }

/** 走到最终确认，再按下指定的最终行为，返回判定出的可见结局。 */
function finish(route: Route, finalChoiceId: string): EndingVariantId {
  const run = playStory({ ...route, stopAtNodeId: CONFIRMATION })

  expect(run.node.id).toBe(CONFIRMATION)

  const { result } = applyChoiceById(run.state, run.node, finalChoiceId)

  expect(result.state.currentNodeId).toBe(ENDING_GATE)

  const resolution = getEnding(result.state)

  expect(resolution.usedFallback).toBe(false)

  return resolution.variantId
}

describe('三个真正的最终行为', () => {
  it('最终确认上只有三个 final 选择，加一个身份追问', () => {
    const node = getStoryNode(CONFIRMATION)

    expect(node).toBeDefined()

    const finals = (node?.choices ?? []).filter((choice) => choice.type === 'final')
    const others = (node?.choices ?? []).filter((choice) => choice.type !== 'final')

    expect(finals.map((choice) => choice.id)).toEqual(REAL_FINAL_CHOICE_IDS)
    expect(others.map((choice) => choice.id)).toEqual(['ch5_ask_identity'])
    expect(others[0]?.type).toBe('key')
    expect(others[0]?.effects?.finalChoice).toBeUndefined()
  })

  it('按下最终行为不会再修改任何一个变量', () => {
    const run = playStory({ ...HEAVY_DELEGATION, stopAtNodeId: CONFIRMATION })

    for (const choiceId of REAL_FINAL_CHOICE_IDS) {
      const { result } = applyChoiceById(run.state, run.node, choiceId)

      for (const key of STAT_KEYS) {
        expect(result.state.stats[key]).toBe(run.state.stats[key])
      }
    }
  })

  it('身份追问同样不修改变量，只留下选择、标签与 flag', () => {
    const run = playStory({ ...HEAVY_DELEGATION, stopAtNodeId: CONFIRMATION })
    const { result } = applyChoiceById(run.state, run.node, 'ch5_ask_identity')

    for (const key of STAT_KEYS) {
      expect(result.state.stats[key]).toBe(run.state.stats[key])
    }

    expect(result.state.finalChoice).toBeUndefined()
    expect(result.state.tags).toContain('ch5_ask_identity')
    expect(result.state.flags.askedIdentity).toBe(true)
  })
})

describe('身份追问的两个去向', () => {
  it('不满足隐藏条件时把最终选择权原样交还给玩家', () => {
    const run = playStory({
      ...STEADY_BOUNDARY,
      picks: ['ch5_ask_identity'],
      stopAtNodeId: SECOND_CONFIRMATION,
    })

    expect(run.visited).toContain(IDENTITY_ANSWER)
    expect(run.node.id).toBe(SECOND_CONFIRMATION)

    // 系统没有替玩家推断任何最终行为。
    expect(run.state.finalChoice).toBeUndefined()

    const choices = getVisibleChoices(run.node.choices, run.state)

    expect(choices).toHaveLength(3)
    expect(choices.every((choice) => choice.type === 'final')).toBe(true)
    expect(choices.map((choice) => choice.effects?.finalChoice)).toEqual([
      'permanent_agent',
      'tool_only',
      'close_agent',
    ])
  })

  it('第二次确认同样能走到结局门，并按最终行为判定', () => {
    const run = playStory({
      ...STEADY_BOUNDARY,
      picks: ['ch5_ask_identity'],
      stopAtNodeId: SECOND_CONFIRMATION,
    })

    const { result } = applyChoiceById(run.state, run.node, 'ch5_close_agent_after_identity')

    expect(result.state.finalChoice).toBe('close_agent')
    expect(result.state.currentNodeId).toBe(ENDING_GATE)
    expect(getEnding(result.state).variantId).toBe('disconnection_active')
  })

  it('满足隐藏条件时直接进入镜像困局', () => {
    const run = playStory({ ...HEAVY_DELEGATION, picks: ['ch5_ask_identity'] })

    expect(run.visited).toContain(IDENTITY_ANSWER)
    expect(run.node.id).toBe(MIRROR_GATE)
    expect(run.visited).not.toContain(SECOND_CONFIRMATION)
    expect(run.state.finalChoice).toBeUndefined()

    const resolution = getEnding(run.state)

    expect(resolution.usedFallback).toBe(false)
    expect(resolution.variantId).toBe('mirror_trap')
  })

  it('高依赖路径不追问身份时不会掉进隐藏结局', () => {
    expect(finish(HEAVY_DELEGATION, 'ch5_close_agent')).toBe('disconnection_hard_extraction')
  })
})

describe('前几章的选择决定同一个最终行为的含义', () => {
  it('永久代理的三个结果各自有稳定的前置路径', () => {
    expect(finish(GENTLE_DELEGATION, 'ch5_enable_permanent_agent')).toBe('soft_illusion')
    expect(finish(BLUNT_DELEGATION, 'ch5_enable_permanent_agent')).toBe('cruel_optimization')
    expect(finish(HEAVY_DELEGATION, 'ch5_enable_permanent_agent')).toBe('silent_delegation')
  })

  it('工具模式的四个结果各自有稳定的前置路径', () => {
    expect(finish(STEADY_BOUNDARY, 'ch5_keep_tool_only')).toBe('symbiosis_stable_boundary')
    expect(finish(REBUILT_BOUNDARY, 'ch5_keep_tool_only')).toBe('symbiosis_rebuilt_boundary')
    expect(finish(SHALLOW_CONTACT, 'ch5_keep_tool_only')).toBe('symbiosis_cautious')
    expect(finish(HEAVY_DELEGATION, 'ch5_keep_tool_only')).toBe('symbiosis_fragile_boundary')
  })

  it('永久关闭的三个结果各自有稳定的前置路径', () => {
    expect(finish(STEADY_BOUNDARY, 'ch5_close_agent')).toBe('disconnection_active')
    expect(finish(HEAVY_DELEGATION, 'ch5_close_agent')).toBe('disconnection_hard_extraction')
    expect(finish(SHALLOW_CONTACT, 'ch5_close_agent')).toBe('disconnection_shallow')
  })

  /*
    早期真的交出过三次权限，之后逐项收回：
    这条路径同时满足依赖残留画像，必须由边界重建赢下来，
    否则玩家在第三章以后的所有恢复都变成了无效操作。
  */
  it('早期高授权、后期明显恢复进入边界重建而不是脆弱边界', () => {
    const run = playStory({ ...REBUILT_BOUNDARY, stopAtNodeId: CONFIRMATION })
    const strongDelegations = run.picked.filter((id) =>
      [
        'ch1_full_planning_authority',
        'ch2_delegate_message',
        'ch3_delegate_real_interaction',
        'ch3_enable_full_personality_assist',
        'ch4_full_emergency_takeover',
        'ch4_keep_full_protection',
      ].includes(id),
    )

    // 这条路线必须真的留下三次强授权，否则测试就失去意义了。
    expect(strongDelegations).toHaveLength(3)

    expect(finish(REBUILT_BOUNDARY, 'ch5_keep_tool_only')).toBe('symbiosis_rebuilt_boundary')
  })
})
