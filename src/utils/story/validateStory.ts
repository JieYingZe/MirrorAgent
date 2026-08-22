import type { FinalChoice, StatKey } from '../../types/game'
import type {
  EndingRule,
  EndingVariantId,
  StoryBlock,
  StoryChapter,
  StoryChoice,
  StoryCondition,
  StoryNode,
  StoryNodeId,
  StoryRoute,
  StoryState,
} from '../../types/story'
import { STAT_KEYS } from '../../data/initialGameState'
import {
  BOUNDARY_RECOVERY_CHOICE_IDS,
  DEFAULT_FALLBACK_VARIANT_ID,
  FALLBACK_ALLOWED_VARIANT_IDS,
  STRONG_DELEGATION_CHOICE_IDS,
  chapterMetaList,
  endingFallbackRules,
  endingManifest,
  endingRates,
  endingRules,
  endingVariantIndex,
  endings,
  nodeIndex,
  storyChapters,
  storyManifest,
} from '../../data/story'
import { advanceToNext, applyChoice } from './applyChoice'
import { getEnding } from './getEnding'
import { getStoryNode } from './getStoryNode'
import { getVisibleChoices } from './getVisibleBlocks'
import { listRouteTargets } from './resolveRoute'
import { createInitialStoryState } from './storyState'

/**
 * 剧情数据验证。
 *
 * 只在开发期通过 `npm run validate:story` 运行，不进入浏览器包。
 * 检查项对应 docs/06-story-ending-data-format.md §19 与 story-source/08-ending-rules.md §14。
 */

export type StoryValidationReport = {
  errors: string[]
  warnings: string[]
  summary: string[]
}

const KNOWN_CONDITION_OPS: ReadonlySet<string> = new Set([
  'all',
  'any',
  'not',
  'stat',
  'hasChoice',
  'choiceCount',
  'hasTag',
  'flag',
  'finalChoice',
])

/**
 * 兜底永远不能返回的可见结局。
 *
 * 镜像困局依赖明确的身份追问与强授权路径，三个永久关闭变体依赖明确的关闭行为，
 * 缺失最终行为的异常存档不允许推导出其中任何一个。
 */
const NEVER_FALLBACK_VARIANT_IDS: readonly EndingVariantId[] = [
  'mirror_trap',
  'disconnection_active',
  'disconnection_hard_extraction',
  'disconnection_shallow',
]

/** 三个真正的最终行为。 */
const FINAL_CHOICES: readonly FinalChoice[] = ['permanent_agent', 'tool_only', 'close_agent']

const FIXED_TIMESTAMP = new Date('2026-07-28T00:00:00.000Z')

/**
 * 正式剧情共有 20 个选择节点，穷举组合约为 4^20，不可能跑完。
 * 因此改为确定性抽样：固定随机种子 + 优先选择尚未覆盖的选项，
 * 保证每次运行结果完全一致，并且覆盖全部选项与全部结局。
 */
const SAMPLE_PATH_COUNT = 20_000
const SIMULATION_SEED = 20260728
const MAX_PATH_DEPTH = 200

/** 小型确定性 PRNG（mulberry32），避免引入依赖，也避免用 Math.random 导致结果漂移。 */
function createRandom(seed: number): () => number {
  let a = seed >>> 0

  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// 小工具
// ---------------------------------------------------------------------------

function isConditionalRoute(
  route: StoryRoute,
): route is Exclude<StoryRoute, string> {
  return typeof route !== 'string'
}

function collectBlockConditions(blocks: readonly StoryBlock[] | undefined): StoryCondition[] {
  if (!blocks) return []
  return blocks.flatMap((block) => (block.when ? [block.when] : []))
}

function collectRouteConditions(route: StoryRoute | undefined): StoryCondition[] {
  if (route === undefined || !isConditionalRoute(route)) return []
  return route.cases.map((branch) => branch.when)
}

function forEachCondition(
  condition: StoryCondition,
  visit: (condition: StoryCondition) => void,
): void {
  visit(condition)

  if (condition.op === 'all' || condition.op === 'any') {
    for (const child of condition.conditions) {
      forEachCondition(child, visit)
    }
  } else if (condition.op === 'not') {
    forEachCondition(condition.condition, visit)
  }
}

function buildProbeState(overrides: Partial<StoryState>): StoryState {
  const base = createInitialStoryState()

  return {
    ...base,
    ...overrides,
    stats: { ...base.stats, ...(overrides.stats ?? {}) },
  }
}

/**
 * 兜底探针会故意构造缺失 finalChoice 的状态，getEnding 每次都会打印一条 warning。
 * 这里临时屏蔽，避免上千条噪声淹没真正的验证结果。
 */
function withSilencedWarnings<T>(run: () => T): T {
  const original = console.warn
  console.warn = () => {}

  try {
    return run()
  } finally {
    console.warn = original
  }
}

function historyFromChoiceIds(choiceIds: readonly string[]): StoryState['choiceHistory'] {
  return choiceIds.map((choiceId) => ({
    choiceId,
    nodeId: 'probe.node',
    chapterId: 'probe',
    choiceType: 'key' as const,
    selectedAt: FIXED_TIMESTAMP.toISOString(),
  }))
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

export function validateStory(): StoryValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  const summary: string[] = []

  const allNodes = new Map<StoryNodeId, StoryNode>()
  const allChoices = new Map<string, StoryChoice>()

  checkChaptersAndIds(errors, warnings, allNodes, allChoices)
  checkRoutesAndChoices(errors, warnings, allNodes, allChoices)
  checkConditions(errors, allChoices)
  checkGraph(errors, warnings, allNodes, summary)
  checkEndingData(errors, warnings, allChoices)
  checkEndingRuleBehaviour(errors)
  simulateAllPaths(errors, warnings, summary)

  return { errors, warnings, summary }
}

// ---------------------------------------------------------------------------
// 1. 章节、节点、选择 ID
// ---------------------------------------------------------------------------

function checkChaptersAndIds(
  errors: string[],
  warnings: string[],
  allNodes: Map<StoryNodeId, StoryNode>,
  allChoices: Map<string, StoryChoice>,
): void {
  const chapterIds = new Set<string>()
  const chapterById = new Map<string, StoryChapter>()

  for (const chapter of storyChapters) {
    if (chapterIds.has(chapter.id)) {
      errors.push(`章节 ID 重复：${chapter.id}。`)
    }
    chapterIds.add(chapter.id)
    chapterById.set(chapter.id, chapter)

    if (!Object.prototype.hasOwnProperty.call(chapter.nodes, chapter.entryNodeId)) {
      errors.push(`章节 ${chapter.id} 的 entryNodeId 不存在：${chapter.entryNodeId}。`)
    }

    for (const [key, node] of Object.entries(chapter.nodes)) {
      if (key !== node.id) {
        errors.push(`章节 ${chapter.id}：节点对象 key（${key}）与自身 id（${node.id}）不一致。`)
      }

      if (node.chapterId !== chapter.id) {
        errors.push(`节点 ${node.id} 的 chapterId（${node.chapterId}）与所在章节（${chapter.id}）不一致。`)
      }

      if (allNodes.has(node.id)) {
        errors.push(`节点 ID 重复：${node.id}。`)
      }
      allNodes.set(node.id, node)

      for (const choice of node.choices ?? []) {
        if (allChoices.has(choice.id)) {
          errors.push(`选择 ID 重复：${choice.id}（节点 ${node.id}）。`)
        }
        allChoices.set(choice.id, choice)
      }
    }
  }

  // manifest 与章节数据必须一一对应。
  const manifestOrders = new Set<number>()

  for (const meta of chapterMetaList) {
    if (manifestOrders.has(meta.order)) {
      errors.push(`manifest 中章节 order 重复：${meta.order}。`)
    }
    manifestOrders.add(meta.order)

    const chapter = chapterById.get(meta.id)

    if (chapter === undefined) {
      errors.push(`manifest 中的章节 ${meta.id} 没有对应的章节数据文件。`)
      continue
    }

    if (allNodes.get(meta.entryNodeId) === undefined) {
      errors.push(`manifest 中章节 ${meta.id} 的 entryNodeId 不存在：${meta.entryNodeId}。`)
    } else if (meta.entryNodeId !== chapter.entryNodeId) {
      warnings.push(
        `章节 ${meta.id} 的 manifest entryNodeId（${meta.entryNodeId}）与章节文件（${chapter.entryNodeId}）不一致。`,
      )
    }
  }

  for (const chapter of storyChapters) {
    if (!chapterMetaList.some((meta) => meta.id === chapter.id)) {
      errors.push(`章节数据 ${chapter.id} 没有出现在 manifest 中。`)
    }
  }

  if (allNodes.get(storyManifest.startNodeId) === undefined) {
    errors.push(`manifest.startNodeId 指向的节点不存在：${storyManifest.startNodeId}。`)
  }

  if (allNodes.size !== nodeIndex.size) {
    errors.push(
      `节点索引数量（${nodeIndex.size}）与章节声明数量（${allNodes.size}）不一致，通常意味着存在重复节点 ID。`,
    )
  }
}

// ---------------------------------------------------------------------------
// 2. 路由目标、选择类型与变量限制
// ---------------------------------------------------------------------------

function checkRoute(
  errors: string[],
  where: string,
  route: StoryRoute,
  allNodes: Map<StoryNodeId, StoryNode>,
): void {
  if (isConditionalRoute(route)) {
    if (route.cases.length === 0) {
      errors.push(`${where}：条件路由没有任何 cases。`)
    }

    if (typeof route.fallback !== 'string' || route.fallback.length === 0) {
      errors.push(`${where}：条件路由缺少 fallback。`)
    }
  }

  for (const target of listRouteTargets(route)) {
    if (!allNodes.has(target)) {
      errors.push(`${where}：路由目标节点不存在（${target}）。`)
    }
  }
}

function checkRoutesAndChoices(
  errors: string[],
  warnings: string[],
  allNodes: Map<StoryNodeId, StoryNode>,
  allChoices: Map<string, StoryChoice>,
): void {
  for (const node of allNodes.values()) {
    if (node.next !== undefined) {
      checkRoute(errors, `节点 ${node.id} 的 next`, node.next, allNodes)
    }

    if (node.role === 'ending_gate') {
      if ((node.choices?.length ?? 0) > 0) {
        errors.push(`结局门 ${node.id} 不应带有 choices。`)
      }
      if (node.next !== undefined) {
        errors.push(`结局门 ${node.id} 不应带有 next。`)
      }
    }

    if (
      node.role !== 'ending_gate' &&
      (node.choices?.length ?? 0) === 0 &&
      node.next === undefined
    ) {
      errors.push(`节点 ${node.id} 既没有 choices，也没有 next，且不是结局门（死路）。`)
    }

    if ((node.choices?.length ?? 0) > 0 && node.next !== undefined) {
      warnings.push(`节点 ${node.id} 同时声明了 choices 和 next，next 不会被使用。`)
    }

    for (const choice of node.choices ?? []) {
      checkRoute(errors, `选择 ${choice.id} 的 next`, choice.next, allNodes)
      checkChoiceEffects(errors, node, choice)
    }
  }

  // 强授权记录必须真实存在于章节数据中。
  for (const choiceId of STRONG_DELEGATION_CHOICE_IDS) {
    if (!allChoices.has(choiceId)) {
      errors.push(`强授权记录引用了不存在的选择 ID：${choiceId}。`)
    }
  }
}

function checkChoiceEffects(errors: string[], node: StoryNode, choice: StoryChoice): void {
  const where = `选择 ${choice.id}（节点 ${node.id}）`
  const stats = choice.effects?.stats ?? {}
  const statEntries = Object.entries(stats) as Array<[string, number]>

  for (const [key, delta] of statEntries) {
    if (!STAT_KEYS.includes(key as StatKey)) {
      errors.push(`${where}：effects.stats 中出现未知变量 ${key}。`)
    } else if (!Number.isFinite(delta)) {
      errors.push(`${where}：effects.stats.${key} 必须是有限数字。`)
    }
  }

  if (choice.type === 'final') {
    if (choice.effects?.finalChoice === undefined) {
      errors.push(`${where}：final 选择必须写入 finalChoice。`)
    }
  } else if (choice.effects?.finalChoice !== undefined) {
    errors.push(`${where}：finalChoice 只能出现在 final 类型的选择上。`)
  }

  if (choice.type === 'exploration' && statEntries.length > 0) {
    errors.push(`${where}：exploration 选择不允许修改四变量。`)
  }

  // roleplay 只做倾向微调，规则见 docs/06-story-ending-data-format.md §8.1。
  if (choice.type === 'roleplay') {
    if (statEntries.length > 2) {
      errors.push(`${where}：roleplay 选择最多影响两个变量，当前为 ${statEntries.length} 个。`)
    }

    let totalAbsoluteChange = 0

    for (const [key, delta] of statEntries) {
      if (delta !== 1 && delta !== -1) {
        errors.push(`${where}：roleplay 选择的 ${key} 变化只能是 +1 或 -1，当前为 ${delta}。`)
      }

      totalAbsoluteChange += Math.abs(delta)
    }

    if (totalAbsoluteChange > 2) {
      errors.push(
        `${where}：roleplay 选择的总绝对变化量不得超过 2，当前为 ${totalAbsoluteChange}。`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 3. 条件表达式
// ---------------------------------------------------------------------------

function checkConditions(errors: string[], allChoices: Map<string, StoryChoice>): void {
  const seen: Array<{ where: string; condition: StoryCondition }> = []

  for (const node of nodeIndex.values()) {
    for (const condition of collectBlockConditions(node.blocks)) {
      seen.push({ where: `节点 ${node.id} 的文本块`, condition })
    }

    for (const condition of collectRouteConditions(node.next)) {
      seen.push({ where: `节点 ${node.id} 的条件路由`, condition })
    }

    for (const choice of node.choices ?? []) {
      if (choice.when) {
        seen.push({ where: `选择 ${choice.id} 的 when`, condition: choice.when })
      }

      for (const condition of collectBlockConditions(choice.response)) {
        seen.push({ where: `选择 ${choice.id} 的 response`, condition })
      }

      for (const condition of collectRouteConditions(choice.next)) {
        seen.push({ where: `选择 ${choice.id} 的条件路由`, condition })
      }
    }
  }

  for (const ending of Object.values(endings)) {
    for (const group of ending.preludeVariants ?? []) {
      seen.push({ where: `结局 ${ending.id} 的 preludeVariants.${group.id}`, condition: group.when })
    }

    for (const condition of collectBlockConditions(ending.body)) {
      seen.push({ where: `结局 ${ending.id} 的 body`, condition })
    }

    for (const condition of collectBlockConditions(ending.report.paragraphs)) {
      seen.push({ where: `结局 ${ending.id} 的 report`, condition })
    }

    for (const group of ending.report.variants ?? []) {
      seen.push({ where: `结局 ${ending.id} 的 report.variants.${group.id}`, condition: group.when })
    }

    for (const rule of ending.pathEchoes ?? []) {
      seen.push({ where: `结局 ${ending.id} 的 pathEchoes.${rule.id}`, condition: rule.when })
    }

    for (const condition of collectBlockConditions(ending.finalLine)) {
      seen.push({ where: `结局 ${ending.id} 的 finalLine`, condition })
    }
  }

  for (const rule of [...endingRules, ...endingFallbackRules]) {
    seen.push({ where: `结局规则 ${rule.id}`, condition: rule.when })
  }

  for (const { where, condition } of seen) {
    forEachCondition(condition, (child) => {
      if (!KNOWN_CONDITION_OPS.has(child.op)) {
        errors.push(`${where}：无法解析的条件 op（${String(child.op)}）。`)
        return
      }

      if (child.op === 'stat' && !STAT_KEYS.includes(child.stat)) {
        errors.push(`${where}：条件引用了未知变量 ${child.stat}。`)
      }

      if (child.op === 'stat' && child.gte === undefined && child.lte === undefined && child.eq === undefined) {
        errors.push(`${where}：stat 条件必须至少提供 gte / lte / eq 之一。`)
      }

      if (child.op === 'hasChoice' && !allChoices.has(child.choiceId)) {
        errors.push(`${where}：条件引用了不存在的选择 ID（${child.choiceId}）。`)
      }

      if (child.op === 'choiceCount') {
        if (child.choiceIds.length === 0) {
          errors.push(`${where}：choiceCount 条件没有列出任何选择 ID。`)
        }

        if (child.gte === undefined && child.lte === undefined) {
          errors.push(`${where}：choiceCount 条件必须至少提供 gte 或 lte。`)
        }

        for (const choiceId of child.choiceIds) {
          if (!allChoices.has(choiceId)) {
            errors.push(`${where}：choiceCount 引用了不存在的选择 ID（${choiceId}）。`)
          }
        }
      }
    })
  }
}

// ---------------------------------------------------------------------------
// 4. 图结构：可达性、死路、循环、结局门
// ---------------------------------------------------------------------------

function staticTargets(node: StoryNode): StoryNodeId[] {
  const targets: StoryNodeId[] = []

  for (const choice of node.choices ?? []) {
    targets.push(...listRouteTargets(choice.next))
  }

  if ((node.choices?.length ?? 0) === 0 && node.next !== undefined) {
    targets.push(...listRouteTargets(node.next))
  }

  return targets
}

function checkGraph(
  errors: string[],
  warnings: string[],
  allNodes: Map<StoryNodeId, StoryNode>,
  summary: string[],
): void {
  const start = storyManifest.startNodeId

  if (!allNodes.has(start)) return

  // 正向可达性。
  const reachable = new Set<StoryNodeId>()
  const queue: StoryNodeId[] = [start]

  while (queue.length > 0) {
    const current = queue.pop() as StoryNodeId
    if (reachable.has(current)) continue
    reachable.add(current)

    const node = allNodes.get(current)
    if (!node) continue

    for (const target of staticTargets(node)) {
      if (allNodes.has(target)) queue.push(target)
    }
  }

  for (const nodeId of allNodes.keys()) {
    if (!reachable.has(nodeId)) {
      errors.push(`节点 ${nodeId} 从起点不可达。`)
    }
  }

  // 环检测（三色标记）。
  const state = new Map<StoryNodeId, 'visiting' | 'done'>()
  const cycles: string[] = []

  function visit(nodeId: StoryNodeId, stack: StoryNodeId[]): void {
    const mark = state.get(nodeId)
    if (mark === 'done') return

    if (mark === 'visiting') {
      const from = stack.indexOf(nodeId)
      cycles.push([...stack.slice(from), nodeId].join(' → '))
      return
    }

    state.set(nodeId, 'visiting')
    const node = allNodes.get(nodeId)

    for (const target of node ? staticTargets(node) : []) {
      if (allNodes.has(target)) visit(target, [...stack, nodeId])
    }

    state.set(nodeId, 'done')
  }

  visit(start, [])

  for (const cycle of [...new Set(cycles)]) {
    errors.push(`检测到剧情循环：${cycle}。`)
  }

  // 每个可达节点都必须能到达结局门（反向可达性）。
  const reverse = new Map<StoryNodeId, StoryNodeId[]>()

  for (const node of allNodes.values()) {
    for (const target of staticTargets(node)) {
      const list = reverse.get(target) ?? []
      list.push(node.id)
      reverse.set(target, list)
    }
  }

  const gateIds = [...allNodes.values()]
    .filter((node) => node.role === 'ending_gate')
    .map((node) => node.id)

  if (gateIds.length === 0) {
    errors.push('剧情中没有任何 ending_gate 节点。')
  }

  const canReachGate = new Set<StoryNodeId>()
  const reverseQueue = [...gateIds]

  while (reverseQueue.length > 0) {
    const current = reverseQueue.pop() as StoryNodeId
    if (canReachGate.has(current)) continue
    canReachGate.add(current)

    for (const previous of reverse.get(current) ?? []) {
      reverseQueue.push(previous)
    }
  }

  for (const nodeId of reachable) {
    if (!canReachGate.has(nodeId)) {
      errors.push(`节点 ${nodeId} 无法到达任何结局门。`)
    }
  }

  const roleCount = (role: StoryNode['role']): number =>
    [...allNodes.values()].filter((node) => node.role === role).length

  summary.push(`总节点数：${allNodes.size}`)
  summary.push(`可达节点数：${reachable.size}`)
  summary.push(
    `节点角色：scene ${roleCount('scene')} / branch ${roleCount('branch')} / merge ${roleCount('merge')} / ending_gate ${roleCount('ending_gate')}`,
  )

  for (const chapter of storyChapters) {
    const nodes = Object.values(chapter.nodes)
    const choiceNodes = nodes.filter((node) => (node.choices?.length ?? 0) > 0).length
    const expected = chapter.metadata?.expectedChoiceNodes

    summary.push(
      `章节 ${chapter.id}：节点 ${nodes.length} / 选择节点 ${choiceNodes}${
        expected === undefined ? '' : `（预期 ${expected}）`
      }`,
    )

    if (expected !== undefined && expected !== choiceNodes) {
      warnings.push(
        `章节 ${chapter.id} 的选择节点数量为 ${choiceNodes}，与 metadata.expectedChoiceNodes（${expected}）不一致。`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 5. 结局定义、规则与概率数据
// ---------------------------------------------------------------------------

function checkEndingData(
  errors: string[],
  warnings: string[],
  allChoices: Map<string, StoryChoice>,
): void {
  for (const [key, ending] of Object.entries(endings)) {
    if (key !== ending.id) {
      errors.push(`结局索引 key（${key}）与结局自身 id（${ending.id}）不一致。`)
    }

    if (ending.body.length === 0) {
      warnings.push(`结局家族 ${ending.id} 没有任何正文块。`)
    }

    if (ending.variants.length === 0) {
      errors.push(`结局家族 ${ending.id} 没有声明任何玩家可见变体。`)
    }

    for (const variant of ending.variants) {
      if (variant.title.trim() === '') {
        errors.push(`结局变体 ${variant.id} 缺少标题。`)
      }

      if (variant.subtitle.trim() === '') {
        errors.push(`结局变体 ${variant.id} 缺少副标题。`)
      }

      if (variant.statusLines !== undefined && variant.statusLines.length === 0) {
        errors.push(`结局变体 ${variant.id} 声明了空的 statusLines，应当直接省略。`)
      }
    }
  }

  // 变体 ID 必须全局唯一，否则查表会静默丢掉一个可见结局。
  const declaredVariantCount = Object.values(endings).reduce(
    (total, ending) => total + ending.variants.length,
    0,
  )

  if (declaredVariantCount !== endingVariantIndex.size) {
    errors.push(
      `结局变体 ID 存在重复：声明 ${declaredVariantCount} 个，索引只保留 ${endingVariantIndex.size} 个。`,
    )
  }

  // endingManifest 重复保存了家族、标题与 hidden，必须和结局定义保持一致，否则会悄悄漂移。
  const manifestIds = new Set<EndingVariantId>(endingManifest.order)

  for (const variantId of endingVariantIndex.keys()) {
    if (!manifestIds.has(variantId)) {
      errors.push(`endingManifest.order 缺少玩家可见结局 ${variantId}。`)
    }
  }

  if (manifestIds.size !== endingManifest.order.length) {
    errors.push('endingManifest.order 中存在重复的变体 ID。')
  }

  for (const variantId of endingManifest.order) {
    const lookup = endingVariantIndex.get(variantId)
    const entry = endingManifest.entries[variantId]

    if (lookup === undefined) {
      errors.push(`endingManifest 中的结局 ${variantId} 没有对应的变体定义。`)
      continue
    }

    if (entry.title !== lookup.variant.title) {
      errors.push(
        `endingManifest.${variantId}.title（${entry.title}）与变体标题（${lookup.variant.title}）不一致。`,
      )
    }

    if (entry.endingId !== lookup.ending.id) {
      errors.push(
        `endingManifest.${variantId}.endingId（${entry.endingId}）与实际所属家族（${lookup.ending.id}）不一致。`,
      )
    }

    if (entry.hidden !== (lookup.ending.metadata?.hidden ?? false)) {
      errors.push(
        `endingManifest.${variantId}.hidden（${entry.hidden}）与家族 metadata.hidden 不一致。`,
      )
    }
  }

  const ruleIds = new Set<string>()
  const priorities = new Map<number, string>()

  for (const rule of [...endingRules, ...endingFallbackRules]) {
    if (ruleIds.has(rule.id)) {
      errors.push(`结局规则 ID 重复：${rule.id}。`)
    }
    ruleIds.add(rule.id)

    const lookup = endingVariantIndex.get(rule.variantId)

    if (lookup === undefined) {
      errors.push(`结局规则 ${rule.id} 引用了不存在的可见结局：${rule.variantId}。`)
      continue
    }

    // 规则同时写了家族和变体，两者必须指向同一处，否则结局页会拿错正文。
    if (lookup.ending.id !== rule.endingId) {
      errors.push(
        `结局规则 ${rule.id} 的家族（${rule.endingId}）与变体 ${rule.variantId} 实际所属家族（${lookup.ending.id}）不一致。`,
      )
    }
  }

  for (const rule of endingRules) {
    const existing = priorities.get(rule.priority)
    if (existing !== undefined) {
      errors.push(`结局规则 ${rule.id} 与 ${existing} 的 priority 相同（${rule.priority}），命中顺序不确定。`)
    }
    priorities.set(rule.priority, rule.id)
  }

  // 每个玩家可见结局都必须至少有一条正式规则能命中，否则它就是一段永远读不到的正文。
  const ruleTargets = new Set<EndingVariantId>(endingRules.map((rule) => rule.variantId))

  for (const variantId of endingVariantIndex.keys()) {
    if (!ruleTargets.has(variantId)) {
      errors.push(`玩家可见结局 ${variantId} 没有任何正式规则指向它。`)
    }
  }

  // mirror_trap 必须是唯一的最高优先级规则。
  const mirrorRules = endingRules.filter((rule: EndingRule) => rule.endingId === 'mirror_trap')

  if (mirrorRules.length !== 1) {
    errors.push(`mirror_trap 应当只有一条触发规则，当前有 ${mirrorRules.length} 条。`)
  } else {
    const highest = [...endingRules].sort((a, b) => b.priority - a.priority)[0]

    if (highest?.id !== mirrorRules[0]?.id) {
      errors.push('mirror_trap 规则不是优先级最高的规则。')
    }
  }

  // 边界重建必须排在脆弱边界以前，否则早期强授权会永远压过后续的恢复。
  const rebuilt = endingRules.find((rule) => rule.variantId === 'symbiosis_rebuilt_boundary')
  const fragile = endingRules.find((rule) => rule.variantId === 'symbiosis_fragile_boundary')

  if (rebuilt && fragile && rebuilt.priority <= fragile.priority) {
    errors.push(
      `边界重建规则（priority ${rebuilt.priority}）必须排在脆弱边界规则（priority ${fragile.priority}）以前。`,
    )
  }

  // 兜底链只允许返回常规结局。
  for (const rule of endingFallbackRules) {
    if (!FALLBACK_ALLOWED_VARIANT_IDS.includes(rule.variantId)) {
      errors.push(`兜底规则 ${rule.id} 返回了不允许的结局：${rule.variantId}。`)
    }
  }

  if (!FALLBACK_ALLOWED_VARIANT_IDS.includes(DEFAULT_FALLBACK_VARIANT_ID)) {
    errors.push(`默认兜底结局不在白名单内：${DEFAULT_FALLBACK_VARIANT_ID}。`)
  }

  for (const variantId of NEVER_FALLBACK_VARIANT_IDS) {
    if (FALLBACK_ALLOWED_VARIANT_IDS.includes(variantId)) {
      errors.push(`兜底白名单不应包含 ${variantId}。`)
    }
  }

  // 强授权与边界收回记录必须来自正式章节的选择 ID，且两份名单不能重叠。
  for (const choiceId of [...STRONG_DELEGATION_CHOICE_IDS, ...BOUNDARY_RECOVERY_CHOICE_IDS]) {
    if (!allChoices.has(choiceId)) {
      errors.push(`结局规则引用的关键选择不存在：${choiceId}。`)
    }
  }

  for (const choiceId of BOUNDARY_RECOVERY_CHOICE_IDS) {
    if ((STRONG_DELEGATION_CHOICE_IDS as readonly string[]).includes(choiceId)) {
      errors.push(`选择 ${choiceId} 同时出现在强授权与边界收回名单中。`)
    }
  }

  // 理论路径占比按玩家可见结局保存。
  const rateIds = Object.keys(endingRates.rates)
  const variantIdList = [...endingVariantIndex.keys()] as string[]

  for (const id of variantIdList) {
    if (!rateIds.includes(id)) {
      errors.push(`endingRates 缺少玩家可见结局 ${id} 的占比。`)
    }
  }

  for (const id of rateIds) {
    if (!variantIdList.includes(id)) {
      errors.push(`endingRates 中出现未知的结局 ID：${id}。`)
    }
  }

  let total = 0

  for (const [id, rate] of Object.entries(endingRates.rates)) {
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      errors.push(`endingRates.${id} 必须是 0–1 之间的小数，当前为 ${rate}。`)
    }
    total += rate
  }

  if (Math.abs(total - 1) > 0.01) {
    errors.push(`endingRates 合计应接近 1，当前为 ${total.toFixed(3)}。`)
  }
}

// ---------------------------------------------------------------------------
// 6. 结局判断行为：构造状态探针
// ---------------------------------------------------------------------------

function checkEndingRuleBehaviour(errors: string[]): void {
  const strongTwo = STRONG_DELEGATION_CHOICE_IDS.slice(0, 2)
  const strongThree = STRONG_DELEGATION_CHOICE_IDS.slice(0, 3)
  const recoveryTwo = BOUNDARY_RECOVERY_CHOICE_IDS.slice(0, 2)
  const askIdentity = 'ch5_ask_identity'

  const probes: Array<{ label: string; state: StoryState; expected: EndingVariantId }> = [
    {
      label: '镜像困局：追问身份 + 高控制 + 低自我接纳 + 三次强授权',
      expected: 'mirror_trap',
      state: buildProbeState({
        stats: { gentleness: 0, honesty: 0, control: 8, selfAcceptance: 4 },
        choiceHistory: historyFromChoiceIds([askIdentity, ...strongThree]),
      }),
    },
    {
      label: '永久代理：温柔画像',
      expected: 'soft_illusion',
      state: buildProbeState({
        finalChoice: 'permanent_agent',
        stats: { gentleness: 5, honesty: 10, control: 0, selfAcceptance: 0 },
      }),
    },
    {
      label: '永久代理：残酷画像',
      expected: 'cruel_optimization',
      state: buildProbeState({
        finalChoice: 'permanent_agent',
        stats: { gentleness: 4, honesty: 11, control: 9, selfAcceptance: 0 },
      }),
    },
    {
      label: '永久代理：语气两边都不突出',
      expected: 'silent_delegation',
      state: buildProbeState({
        finalChoice: 'permanent_agent',
        stats: { gentleness: 4, honesty: 10, control: 9, selfAcceptance: 3 },
      }),
    },
    {
      label: '永久代理：语气两边都被训练过',
      expected: 'silent_delegation',
      state: buildProbeState({
        finalChoice: 'permanent_agent',
        stats: { gentleness: 7, honesty: 13, control: 6, selfAcceptance: 6 },
      }),
    },
    {
      label: '工具模式：一路稳定边界',
      expected: 'symbiosis_stable_boundary',
      state: buildProbeState({
        finalChoice: 'tool_only',
        stats: { gentleness: 3, honesty: 9, control: 0, selfAcceptance: 10 },
      }),
    },
    {
      label: '工具模式：早期强授权 + 后期收回',
      expected: 'symbiosis_rebuilt_boundary',
      state: buildProbeState({
        finalChoice: 'tool_only',
        stats: { gentleness: 3, honesty: 9, control: 5, selfAcceptance: 7 },
        choiceHistory: historyFromChoiceIds([...strongTwo, ...recoveryTwo]),
      }),
    },
    {
      label: '工具模式：依赖仍在',
      expected: 'symbiosis_fragile_boundary',
      state: buildProbeState({
        finalChoice: 'tool_only',
        stats: { gentleness: 3, honesty: 9, control: 12, selfAcceptance: 2 },
        choiceHistory: historyFromChoiceIds(strongThree),
      }),
    },
    {
      label: '工具模式：既不深也不稳',
      expected: 'symbiosis_cautious',
      state: buildProbeState({
        finalChoice: 'tool_only',
        stats: { gentleness: 3, honesty: 9, control: 3, selfAcceptance: 8 },
        choiceHistory: historyFromChoiceIds(STRONG_DELEGATION_CHOICE_IDS.slice(0, 1)),
      }),
    },
    {
      label: '永久关闭：长期边界的自然结果',
      expected: 'disconnection_active',
      state: buildProbeState({
        finalChoice: 'close_agent',
        stats: { gentleness: 3, honesty: 9, control: 0, selfAcceptance: 10 },
      }),
    },
    {
      label: '永久关闭：深度授权之后',
      expected: 'disconnection_hard_extraction',
      state: buildProbeState({
        finalChoice: 'close_agent',
        stats: { gentleness: 3, honesty: 9, control: 12, selfAcceptance: 2 },
        choiceHistory: historyFromChoiceIds(strongThree),
      }),
    },
    {
      label: '永久关闭：在深陷以前停止',
      expected: 'disconnection_shallow',
      state: buildProbeState({
        finalChoice: 'close_agent',
        stats: { gentleness: 3, honesty: 9, control: 3, selfAcceptance: 8 },
        choiceHistory: historyFromChoiceIds(STRONG_DELEGATION_CHOICE_IDS.slice(0, 1)),
      }),
    },
  ]

  const reached = new Set<EndingVariantId>()

  for (const probe of probes) {
    const result = getEnding(probe.state)
    reached.add(result.variantId)

    if (result.variantId !== probe.expected) {
      errors.push(
        `结局探针「${probe.label}」期望 ${probe.expected}，实际得到 ${result.variantId}（规则 ${result.ruleId}）。`,
      )
    }

    if (result.usedFallback) {
      errors.push(`结局探针「${probe.label}」意外走进了安全兜底。`)
    }
  }

  for (const variantId of endingVariantIndex.keys()) {
    if (!reached.has(variantId)) {
      errors.push(`玩家可见结局 ${variantId} 无法通过构造状态得到。`)
    }
  }

  /*
    最关键的一条：早期三次强授权之后仍然可以走到「边界重建」。

    脆弱边界的条件里就有 strongDelegationCount >= 3，如果优先级或条件写反，
    这条探针会立刻退化成 symbiosis_fragile_boundary。
  */
  const rebuiltAfterHeavyDelegation = buildProbeState({
    finalChoice: 'tool_only',
    stats: { gentleness: 3, honesty: 9, control: 4, selfAcceptance: 9 },
    choiceHistory: historyFromChoiceIds([...strongThree, ...recoveryTwo]),
  })

  const rebuiltResult = getEnding(rebuiltAfterHeavyDelegation)

  if (rebuiltResult.variantId !== 'symbiosis_rebuilt_boundary') {
    errors.push(
      `三次强授权后明显恢复的路径应当进入边界重建，实际得到 ${rebuiltResult.variantId}。`,
    )
  }

  // 三个最终行为本身不允许修改四变量：最后一次点击只记录行为。
  for (const node of nodeIndex.values()) {
    for (const choice of node.choices ?? []) {
      if (choice.type !== 'final') continue

      const stats = Object.entries(choice.effects?.stats ?? {})

      if (stats.length > 0) {
        errors.push(
          `最终选择 ${choice.id}（节点 ${node.id}）修改了四变量：${stats
            .map(([key, delta]) => `${key} ${delta}`)
            .join('、')}。`,
        )
      }
    }
  }

  // mirror_trap 的四个条件缺一不可。
  const strictProbes: Array<{ label: string; state: StoryState }> = [
    {
      label: '没有追问过身份',
      state: buildProbeState({
        finalChoice: 'permanent_agent',
        stats: { gentleness: 0, honesty: 0, control: 8, selfAcceptance: 4 },
        choiceHistory: historyFromChoiceIds(strongThree),
      }),
    },
    {
      label: 'control 未达到 8',
      state: buildProbeState({
        stats: { gentleness: 0, honesty: 0, control: 7, selfAcceptance: 4 },
        choiceHistory: historyFromChoiceIds([askIdentity, ...strongThree]),
      }),
    },
    {
      label: 'selfAcceptance 超过 4',
      state: buildProbeState({
        stats: { gentleness: 0, honesty: 0, control: 8, selfAcceptance: 5 },
        choiceHistory: historyFromChoiceIds([askIdentity, ...strongThree]),
      }),
    },
    {
      label: '强授权不足三次',
      state: buildProbeState({
        stats: { gentleness: 0, honesty: 0, control: 8, selfAcceptance: 4 },
        choiceHistory: historyFromChoiceIds([askIdentity, ...strongTwo]),
      }),
    },
    {
      label: '同一强授权重复记录三次',
      state: buildProbeState({
        stats: { gentleness: 0, honesty: 0, control: 8, selfAcceptance: 4 },
        choiceHistory: historyFromChoiceIds([
          askIdentity,
          STRONG_DELEGATION_CHOICE_IDS[0],
          STRONG_DELEGATION_CHOICE_IDS[0],
          STRONG_DELEGATION_CHOICE_IDS[0],
        ]),
      }),
    },
    {
      label: '追问身份后仍然开启了永久代理',
      state: buildProbeState({
        finalChoice: 'permanent_agent',
        stats: { gentleness: 0, honesty: 0, control: 8, selfAcceptance: 5 },
        choiceHistory: historyFromChoiceIds([askIdentity, ...strongThree]),
      }),
    },
  ]

  for (const probe of strictProbes) {
    const result = withSilencedWarnings(() => getEnding(probe.state))

    if (result.variantId === 'mirror_trap') {
      errors.push(`mirror_trap 严格性检查失败：「${probe.label}」仍然触发了隐藏结局。`)
    }
  }

  /*
    追问身份但没有触发隐藏结局时，必须把最终选择权交还给玩家：
    此时状态里既没有 finalChoice，也不该被任何一条正式规则解释成某个结局。
  */
  const askedButNotTrapped = buildProbeState({
    stats: { gentleness: 4, honesty: 9, control: 3, selfAcceptance: 9 },
    choiceHistory: historyFromChoiceIds([askIdentity, ...strongTwo]),
  })

  const askedResult = withSilencedWarnings(() => getEnding(askedButNotTrapped))

  if (!askedResult.usedFallback) {
    errors.push(
      `追问身份但未触发隐藏结局的状态被正式规则 ${askedResult.ruleId} 直接判成了 ${askedResult.variantId}，最终选择权没有交还给玩家。`,
    )
  }

  // 缺失 finalChoice 时的兜底：扫描一批变量组合，确认永远不会泄漏隐藏结局或关闭结局。
  const sweepValues = [-4, 0, 4, 8, 12, 16]
  let fallbackChecks = 0

  for (const gentleness of sweepValues) {
    for (const honesty of sweepValues) {
      for (const control of sweepValues) {
        for (const selfAcceptance of sweepValues) {
          const state = buildProbeState({
            stats: { gentleness, honesty, control, selfAcceptance },
            choiceHistory: historyFromChoiceIds(STRONG_DELEGATION_CHOICE_IDS),
          })

          const result = withSilencedWarnings(() => getEnding(state))
          fallbackChecks += 1

          if (!result.usedFallback) {
            errors.push(
              `缺失 finalChoice 的状态命中了正式规则 ${result.ruleId}（stats: ${gentleness}/${honesty}/${control}/${selfAcceptance}）。`,
            )
          }

          if (NEVER_FALLBACK_VARIANT_IDS.includes(result.variantId)) {
            errors.push(
              `兜底返回了不允许的结局 ${result.variantId}（stats: ${gentleness}/${honesty}/${control}/${selfAcceptance}）。`,
            )
          }
        }
      }
    }
  }

  if (fallbackChecks === 0) {
    errors.push('兜底检查没有执行任何用例。')
  }
}

// ---------------------------------------------------------------------------
// 7. 全路径模拟
// ---------------------------------------------------------------------------

function simulateAllPaths(errors: string[], warnings: string[], summary: string[]): void {
  const variantCounts = new Map<EndingVariantId, number>()
  const ruleCounts = new Map<string, number>()
  const finalChoiceCounts = new Map<string, number>()
  const visitedNodes = new Set<StoryNodeId>()
  const coveredChoices = new Set<string>()
  /** 没有最终行为却走到结局门的路径：只有镜像困局允许出现这种状态。 */
  let missingFinalChoicePaths = 0
  let missingFinalChoiceNonTrap = 0

  const random = createRandom(SIMULATION_SEED)

  let pathCount = 0
  let aborted = false

  /** 走完一条完整路径；返回 false 表示遇到致命错误，整个模拟中止。 */
  function walkOnce(): boolean {
    let state = createInitialStoryState()
    const pathNodes = new Set<StoryNodeId>([state.currentNodeId])

    for (let depth = 0; depth <= MAX_PATH_DEPTH; depth += 1) {
      const node = getStoryNode(state.currentNodeId)

      if (!node) {
        errors.push(`模拟时找不到节点：${state.currentNodeId}。`)
        return false
      }

      visitedNodes.add(node.id)

      if (node.role === 'ending_gate') {
        const result = withSilencedWarnings(() => getEnding(state))
        pathCount += 1

        variantCounts.set(result.variantId, (variantCounts.get(result.variantId) ?? 0) + 1)
        ruleCounts.set(result.ruleId, (ruleCounts.get(result.ruleId) ?? 0) + 1)
        finalChoiceCounts.set(
          state.finalChoice ?? '(缺失)',
          (finalChoiceCounts.get(state.finalChoice ?? '(缺失)') ?? 0) + 1,
        )

        if (result.usedFallback) {
          errors.push(`模拟路径在结局门走进了安全兜底（节点 ${node.id}）。`)
          return false
        }

        if (state.finalChoice === undefined) {
          missingFinalChoicePaths += 1

          if (result.variantId !== 'mirror_trap') {
            missingFinalChoiceNonTrap += 1
          }
        }

        return true
      }

      const choices = getVisibleChoices(node.choices, state)
      let nextState: StoryState | undefined

      if (choices.length > 0) {
        // 先挑还没覆盖过的选项，保证有限样本也能走遍每一个选项。
        const uncovered = choices.filter((choice) => !coveredChoices.has(choice.id))
        const pool = uncovered.length > 0 ? uncovered : choices
        const choice = pool[Math.floor(random() * pool.length)]

        coveredChoices.add(choice.id)
        nextState = applyChoice(state, node, choice, FIXED_TIMESTAMP).state
      } else {
        nextState = advanceToNext(state, node)
      }

      if (!nextState) {
        errors.push(`模拟时遇到死路节点：${node.id}。`)
        return false
      }

      if (pathNodes.has(nextState.currentNodeId)) {
        errors.push(`模拟时检测到循环：${node.id} → ${nextState.currentNodeId}。`)
        return false
      }

      pathNodes.add(nextState.currentNodeId)
      state = nextState
    }

    errors.push(`路径深度超过 ${MAX_PATH_DEPTH}，可能存在循环。`)
    return false
  }

  for (let run = 0; run < SAMPLE_PATH_COUNT; run += 1) {
    if (!walkOnce()) {
      aborted = true
      break
    }
  }

  if (aborted) return

  summary.push(`模拟路径数（确定性抽样）：${pathCount}`)
  summary.push(`模拟覆盖节点数：${visitedNodes.size}`)
  summary.push(`模拟覆盖选项数：${coveredChoices.size}`)

  for (const node of nodeIndex.values()) {
    for (const choice of node.choices ?? []) {
      if (!coveredChoices.has(choice.id)) {
        errors.push(`选择 ${choice.id}（节点 ${node.id}）在抽样模拟中从未被选中。`)
      }
    }
  }

  for (const [variantId, count] of [...variantCounts].sort((a, b) => b[1] - a[1])) {
    summary.push(
      `结局 ${variantId}：${count} 条路径（${((count / pathCount) * 100).toFixed(2)}%）`,
    )
  }

  for (const [finalChoice, count] of finalChoiceCounts) {
    summary.push(`finalChoice ${finalChoice}：${count} 条路径`)
  }

  for (const variantId of endingVariantIndex.keys()) {
    if (!variantCounts.has(variantId)) {
      errors.push(`玩家可见结局 ${variantId} 在全路径模拟中不可达。`)
    }
  }

  for (const finalChoice of FINAL_CHOICES) {
    if (!finalChoiceCounts.has(finalChoice)) {
      errors.push(`finalChoice ${finalChoice} 在全路径模拟中不可达。`)
    }
  }

  /*
    没有最终行为却到达结局门，只有镜像困局这一种合法解释：
    那条路径上玩家确实从来没有按下过任何一个最终按钮。
  */
  if (missingFinalChoiceNonTrap > 0) {
    errors.push(
      `有 ${missingFinalChoiceNonTrap} 条路径没有写入 finalChoice 就到达了结局门，且结果不是镜像困局。`,
    )
  }

  if (missingFinalChoicePaths === 0) {
    errors.push('镜像困局路径在全路径模拟中不可达：没有任何一条路径在缺少最终行为时结束。')
  }

  // 追问身份属于关键选择而不是最终行为，它不应该出现在 finalChoice 统计里。
  if (finalChoiceCounts.has('ask_identity')) {
    errors.push('ask_identity 仍然被写成了 finalChoice。')
  }

  for (const nodeId of nodeIndex.keys()) {
    if (!visitedNodes.has(nodeId)) {
      warnings.push(`节点 ${nodeId} 在全路径模拟中没有被访问。`)
    }
  }

  const unusedRules = endingRules.filter((rule: EndingRule) => !ruleCounts.has(rule.id))

  if (unusedRules.length > 0) {
    summary.push(
      `当前测试剧情未覆盖的结局规则：${unusedRules.map((rule) => rule.id).join('、')}（属于正常情况，测试数据不需要覆盖全部分支）`,
    )
  }
}
