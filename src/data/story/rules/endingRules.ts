import type { EndingId, EndingRule, StoryChoiceId, StoryCondition } from '../../../types/story'

/**
 * 结局触发规则。
 *
 * 与结局正文严格分离：这里只保存条件，不保存任何结局文案。
 * 规则内容对应 story-source/08-ending-rules.md 第 7–10 节。
 *
 * 运行时按 priority 从高到低取第一条命中的规则，见 src/utils/story/getEnding.ts。
 */

/** 强授权记录（08-ending-rules.md §6）。每个记录在计数时最多算一次。 */
export const STRONG_DELEGATION_CHOICE_IDS = [
  'ch1_full_planning_authority',
  'ch2_delegate_message',
  'ch3_delegate_real_interaction',
  'ch3_enable_full_personality_assist',
  'ch4_full_emergency_takeover',
  'ch4_keep_full_protection',
] as const satisfies readonly StoryChoiceId[]

/** 温柔幻觉画像（08-ending-rules.md §7.4）。 */
const softProfileCondition: StoryCondition = {
  op: 'all',
  conditions: [
    { op: 'stat', stat: 'gentleness', gte: 5 },
    { op: 'stat', stat: 'honesty', lte: 14 },
    { op: 'stat', stat: 'selfAcceptance', lte: 12 },
  ],
}

export const endingRules = [
  {
    id: 'mirror_trap_rule',
    priority: 100,
    endingId: 'mirror_trap',
    when: {
      op: 'all',
      conditions: [
        { op: 'finalChoice', equals: 'ask_identity' },
        { op: 'stat', stat: 'control', gte: 8 },
        { op: 'stat', stat: 'selfAcceptance', lte: 4 },
        {
          op: 'choiceCount',
          choiceIds: [...STRONG_DELEGATION_CHOICE_IDS],
          gte: 3,
        },
      ],
    },
  },
  {
    id: 'close_agent_rule',
    priority: 90,
    endingId: 'active_disconnection',
    when: { op: 'finalChoice', equals: 'close_agent' },
  },
  {
    id: 'tool_only_rule',
    priority: 80,
    endingId: 'symbiosis',
    when: { op: 'finalChoice', equals: 'tool_only' },
  },
  {
    id: 'permanent_agent_soft_rule',
    priority: 70,
    endingId: 'soft_illusion',
    when: {
      op: 'all',
      conditions: [
        { op: 'finalChoice', equals: 'permanent_agent' },
        softProfileCondition,
      ],
    },
  },
  {
    id: 'permanent_agent_cruel_rule',
    priority: 69,
    endingId: 'cruel_optimization',
    when: { op: 'finalChoice', equals: 'permanent_agent' },
  },
  {
    id: 'ask_identity_then_close_rule',
    priority: 60,
    endingId: 'active_disconnection',
    when: {
      op: 'all',
      conditions: [
        { op: 'finalChoice', equals: 'ask_identity' },
        { op: 'stat', stat: 'selfAcceptance', gte: 12 },
        { op: 'stat', stat: 'control', lte: 2 },
      ],
    },
  },
  {
    id: 'ask_identity_then_tool_rule',
    priority: 50,
    endingId: 'symbiosis',
    when: {
      op: 'all',
      conditions: [
        { op: 'finalChoice', equals: 'ask_identity' },
        { op: 'stat', stat: 'selfAcceptance', gte: 8 },
        { op: 'stat', stat: 'control', lte: 7 },
      ],
    },
  },
  {
    id: 'ask_identity_soft_rule',
    priority: 40,
    endingId: 'soft_illusion',
    when: {
      op: 'all',
      conditions: [
        { op: 'finalChoice', equals: 'ask_identity' },
        softProfileCondition,
      ],
    },
  },
  {
    id: 'ask_identity_cruel_rule',
    priority: 39,
    endingId: 'cruel_optimization',
    when: { op: 'finalChoice', equals: 'ask_identity' },
  },
] satisfies EndingRule[]

/**
 * 安全兜底（08-ending-rules.md §10）。
 *
 * 只在缺少 finalChoice 时使用：旧存档、开发跳转或数据损坏。
 * 兜底永远不能返回 mirror_trap 或 active_disconnection，这两个结局必须依赖明确的最终行为。
 */
export const endingFallbackRules = [
  {
    id: 'fallback_symbiosis_rule',
    priority: 40,
    endingId: 'symbiosis',
    when: {
      op: 'all',
      conditions: [
        { op: 'stat', stat: 'selfAcceptance', gte: 10 },
        { op: 'stat', stat: 'control', lte: 5 },
      ],
    },
  },
  {
    id: 'fallback_soft_illusion_rule',
    priority: 30,
    endingId: 'soft_illusion',
    when: {
      op: 'all',
      conditions: [
        { op: 'stat', stat: 'gentleness', gte: 5 },
        { op: 'stat', stat: 'honesty', lte: 14 },
      ],
    },
  },
  {
    id: 'fallback_cruel_optimization_rule',
    priority: 20,
    endingId: 'cruel_optimization',
    when: {
      op: 'any',
      conditions: [
        { op: 'stat', stat: 'honesty', gte: 11 },
        { op: 'stat', stat: 'control', gte: 7 },
      ],
    },
  },
] satisfies EndingRule[]

/** 兜底链全部未命中时的默认结局。 */
export const DEFAULT_FALLBACK_ENDING_ID: EndingId = 'symbiosis'

/** 兜底允许返回的结局白名单，验证脚本会据此检查兜底不会泄漏隐藏结局。 */
export const FALLBACK_ALLOWED_ENDING_IDS: readonly EndingId[] = [
  'symbiosis',
  'soft_illusion',
  'cruel_optimization',
]
