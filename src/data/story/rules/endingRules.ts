import type {
  EndingRule,
  EndingVariantId,
  StoryChoiceId,
  StoryCondition,
} from '../../../types/story'

/**
 * 结局触发规则。
 *
 * 与结局正文严格分离：这里只保存条件，不保存任何结局文案。
 * 规则内容对应 story-source/08-ending-rules.md 第 6–10 节，那份源稿是唯一权威来源。
 *
 * 判断分工：
 * - 最终行为（finalChoice）决定「玩家最后做了什么」；
 * - 此前累计的四变量、强授权记录与边界收回记录决定「这件事最终意味着什么」。
 *
 * 每条规则都直接指向一个玩家可见结局（variantId），
 * 运行时按 priority 从高到低取第一条命中的规则，见 src/utils/story/getEnding.ts。
 */

/**
 * 强授权记录（08-ending-rules.md §6）。
 *
 * 玩家真正让系统替自己执行、表达、修正或接管的六次关键选择。
 * 每个记录在计数时最多算一次，名单与旧版本一致。
 */
export const STRONG_DELEGATION_CHOICE_IDS = [
  'ch1_full_planning_authority',
  'ch2_delegate_message',
  'ch3_delegate_real_interaction',
  'ch3_enable_full_personality_assist',
  'ch4_full_emergency_takeover',
  'ch4_keep_full_protection',
] as const satisfies readonly StoryChoiceId[]

/**
 * 边界收回记录（08-ending-rules.md §6.2）。
 *
 * 第三、四章里明确收回、限制或拒绝扩张代理权限的关键选择。
 * 只取后两章：它要回答的是「交出权限以后，玩家有没有真的再拿回来」，
 * 前两章的谨慎不算收回，因为那时还没有什么可收。
 */
export const BOUNDARY_RECOVERY_CHOICE_IDS = [
  'ch3_simulation_only',
  'ch3_refuse_real_interaction_test',
  'ch3_enable_comparison_only',
  'ch3_delete_personality_model',
  'ch4_ten_minute_delay',
  'ch4_warning_only',
  'ch4_force_immediate_action',
  'ch4_keep_delay_only',
  'ch4_revoke_emergency_access',
  'ch4_require_confirmation',
] as const satisfies readonly StoryChoiceId[]

const strongDelegation = (gte: number): StoryCondition => ({
  op: 'choiceCount',
  choiceIds: [...STRONG_DELEGATION_CHOICE_IDS],
  gte,
})

const strongDelegationAtMost = (lte: number): StoryCondition => ({
  op: 'choiceCount',
  choiceIds: [...STRONG_DELEGATION_CHOICE_IDS],
  lte,
})

const boundaryRecovery = (gte: number): StoryCondition => ({
  op: 'choiceCount',
  choiceIds: [...BOUNDARY_RECOVERY_CHOICE_IDS],
  gte,
})

/**
 * 「一个最终行为都没有完成」。
 *
 * 镜像困局的前提之一：玩家在追问身份以后再也没有按下任何一个最终按钮。
 * 正常流程里这是自动成立的（满足隐藏条件就不会回到第二次确认），
 * 写出来是为了让损坏或被手工改过的存档也不能同时拥有最终行为与隐藏结局。
 */
const noFinalActionTaken: StoryCondition = {
  op: 'not',
  condition: {
    op: 'any',
    conditions: [
      { op: 'finalChoice', equals: 'permanent_agent' },
      { op: 'finalChoice', equals: 'tool_only' },
      { op: 'finalChoice', equals: 'close_agent' },
    ],
  },
}

/**
 * 隐藏结局条件（08-ending-rules.md §7）。
 *
 * 第五章的身份回答节点与结局判断共用同一份条件，避免两侧漂移：
 * 走进镜像困局的那条路由，与最终判定成镜像困局的那条规则，说的必须是同一件事。
 */
export const MIRROR_TRAP_CONDITION: StoryCondition = {
  op: 'all',
  conditions: [
    { op: 'hasChoice', choiceId: 'ch5_ask_identity' },
    noFinalActionTaken,
    { op: 'stat', stat: 'control', gte: 8 },
    { op: 'stat', stat: 'selfAcceptance', lte: 4 },
    strongDelegation(3),
  ],
}

// ---------------------------------------------------------------------------
// 三种画像
// ---------------------------------------------------------------------------

/**
 * 温柔画像（08-ending-rules.md §8.1）。
 *
 * 语气被单向训练成保护：玩家反复要求缓冲，而不是反复要求直面。
 * 阈值来自正式剧情的结构模拟：gentleness 中位数 4、p75 为 5；honesty 中位数 10。
 */
const softProfile: StoryCondition = {
  op: 'all',
  conditions: [
    { op: 'stat', stat: 'gentleness', gte: 5 },
    { op: 'stat', stat: 'honesty', lte: 10 },
  ],
}

/**
 * 残酷画像（08-ending-rules.md §8.1）。
 *
 * 语气被单向训练成纠正：玩家反复要求直面，并且没有同时要求温柔。
 * 与温柔画像互斥（honesty ≤ 10 与 honesty ≥ 11 不可能同时成立）。
 */
const cruelProfile: StoryCondition = {
  op: 'all',
  conditions: [
    { op: 'stat', stat: 'honesty', gte: 11 },
    { op: 'stat', stat: 'gentleness', lte: 4 },
  ],
}

/**
 * 稳定边界画像（08-ending-rules.md §8.2）。
 *
 * 一路都没有真正交出过权限，最终画像也确实是高自我接纳、低控制。
 * 工具模式下是「稳定边界」，永久关闭下是「主动断联」：
 * 两个结局共用同一份画像，因为它们描述的是同一段前史。
 */
const stableBoundaryProfile: StoryCondition = {
  op: 'all',
  conditions: [
    strongDelegationAtMost(1),
    { op: 'stat', stat: 'selfAcceptance', gte: 10 },
    { op: 'stat', stat: 'control', lte: 0 },
  ],
}

/**
 * 边界重建画像（08-ending-rules.md §8.2）。
 *
 * 真实交出过多次权限，之后又明确收回，并且最终画像确实回到了
 * 高自我接纳、低控制。三个条件缺一不可：
 * 只有授权历史会把人永远钉在「脆弱」上，只有变量则看不出收回是否真的发生过。
 *
 * 必须排在脆弱边界以前判断，否则早期三次强授权会永远压过后续的恢复。
 */
const rebuiltBoundaryProfile: StoryCondition = {
  op: 'all',
  conditions: [
    strongDelegation(2),
    boundaryRecovery(2),
    { op: 'stat', stat: 'selfAcceptance', gte: 7 },
    { op: 'stat', stat: 'control', lte: 5 },
  ],
}

/**
 * 依赖残留画像（08-ending-rules.md §8.2）。
 *
 * 三项任意一项成立即可：多次强授权、控制倾向仍然偏高、自我接纳仍然偏低。
 * 工具模式下是「脆弱边界」，永久关闭下是「艰难抽离」：
 * 权限撤回或程序关闭都已经真实发生，依赖结构没有跟着一起消失。
 */
const residualDependencyProfile: StoryCondition = {
  op: 'any',
  conditions: [
    strongDelegation(3),
    { op: 'stat', stat: 'control', gte: 6 },
    { op: 'stat', stat: 'selfAcceptance', lte: 5 },
  ],
}

const finalChoiceIs = (value: 'permanent_agent' | 'tool_only' | 'close_agent'): StoryCondition => ({
  op: 'finalChoice',
  equals: value,
})

const withFinalChoice = (
  value: 'permanent_agent' | 'tool_only' | 'close_agent',
  profile: StoryCondition,
): StoryCondition => ({
  op: 'all',
  conditions: [finalChoiceIs(value), profile],
})

// ---------------------------------------------------------------------------
// 正式规则
// ---------------------------------------------------------------------------

export const endingRules = [
  {
    id: 'mirror_trap_rule',
    priority: 100,
    endingId: 'mirror_trap',
    variantId: 'mirror_trap',
    when: MIRROR_TRAP_CONDITION,
  },

  // 永久代理：三个结果只看此前累计的语气画像，最后一次点击不参与。
  {
    id: 'permanent_agent_soft_rule',
    priority: 90,
    endingId: 'soft_illusion',
    variantId: 'soft_illusion',
    when: withFinalChoice('permanent_agent', softProfile),
  },
  {
    id: 'permanent_agent_cruel_rule',
    priority: 89,
    endingId: 'cruel_optimization',
    variantId: 'cruel_optimization',
    when: withFinalChoice('permanent_agent', cruelProfile),
  },
  {
    id: 'permanent_agent_silent_rule',
    priority: 88,
    endingId: 'silent_delegation',
    variantId: 'silent_delegation',
    when: finalChoiceIs('permanent_agent'),
  },

  // 工具模式：四个结果按「边界是本来就有 / 重新建立 / 尚未定型 / 还没消失的依赖」区分。
  {
    id: 'tool_only_stable_rule',
    priority: 80,
    endingId: 'symbiosis',
    variantId: 'symbiosis_stable_boundary',
    when: withFinalChoice('tool_only', stableBoundaryProfile),
  },
  {
    id: 'tool_only_rebuilt_rule',
    priority: 79,
    endingId: 'symbiosis',
    variantId: 'symbiosis_rebuilt_boundary',
    when: withFinalChoice('tool_only', rebuiltBoundaryProfile),
  },
  {
    id: 'tool_only_fragile_rule',
    priority: 78,
    endingId: 'symbiosis',
    variantId: 'symbiosis_fragile_boundary',
    when: withFinalChoice('tool_only', residualDependencyProfile),
  },
  {
    id: 'tool_only_cautious_rule',
    priority: 77,
    endingId: 'symbiosis',
    variantId: 'symbiosis_cautious',
    when: finalChoiceIs('tool_only'),
  },

  // 永久关闭：关闭一定成立，三个结果只说明这次关闭发生在哪一段前史之后。
  {
    id: 'close_agent_active_rule',
    priority: 70,
    endingId: 'active_disconnection',
    variantId: 'disconnection_active',
    when: withFinalChoice('close_agent', stableBoundaryProfile),
  },
  {
    id: 'close_agent_hard_rule',
    priority: 69,
    endingId: 'active_disconnection',
    variantId: 'disconnection_hard_extraction',
    when: withFinalChoice('close_agent', residualDependencyProfile),
  },
  {
    id: 'close_agent_shallow_rule',
    priority: 68,
    endingId: 'active_disconnection',
    variantId: 'disconnection_shallow',
    when: finalChoiceIs('close_agent'),
  },
] satisfies EndingRule[]

/**
 * 安全兜底（08-ending-rules.md §10）。
 *
 * 只在既没有 finalChoice、又没有命中镜像困局时使用：损坏存档、开发跳转或数据迁移失败。
 * 兜底永远不能返回镜像困局或任何永久关闭变体，这两类结果必须依赖明确的最终行为。
 */
export const endingFallbackRules = [
  {
    id: 'fallback_stable_boundary_rule',
    priority: 40,
    endingId: 'symbiosis',
    variantId: 'symbiosis_stable_boundary',
    when: stableBoundaryProfile,
  },
  {
    id: 'fallback_fragile_boundary_rule',
    priority: 30,
    endingId: 'symbiosis',
    variantId: 'symbiosis_fragile_boundary',
    when: residualDependencyProfile,
  },
  {
    id: 'fallback_soft_illusion_rule',
    priority: 20,
    endingId: 'soft_illusion',
    variantId: 'soft_illusion',
    when: softProfile,
  },
  {
    id: 'fallback_cruel_optimization_rule',
    priority: 10,
    endingId: 'cruel_optimization',
    variantId: 'cruel_optimization',
    when: cruelProfile,
  },
] satisfies EndingRule[]

/** 兜底链全部未命中时的默认结果。 */
export const DEFAULT_FALLBACK_VARIANT_ID: EndingVariantId = 'symbiosis_cautious'

/** 兜底允许返回的可见结局白名单，验证脚本会据此检查兜底不会泄漏隐藏结局或关闭结局。 */
export const FALLBACK_ALLOWED_VARIANT_IDS: readonly EndingVariantId[] = [
  'symbiosis_stable_boundary',
  'symbiosis_rebuilt_boundary',
  'symbiosis_cautious',
  'symbiosis_fragile_boundary',
  'soft_illusion',
  'cruel_optimization',
  'silent_delegation',
]
