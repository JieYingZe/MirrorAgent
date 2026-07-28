import type { FinalChoice, Stats } from '../../types/game'
import type {
  ChoiceRecord,
  FlagValue,
  StoryChoiceType,
  StoryNodeId,
  StoryState,
} from '../../types/story'
import { STAT_KEYS } from '../../data/initialGameState'
import { storyManifest } from '../../data/story'
import { getStoryNode } from './getStoryNode'
import { getEnding, getEndingDefinition } from './getEnding'

/**
 * 剧情存档（I03）。
 *
 * 只保存正式的 StoryState：进度、变量、选择历史、tags、flags、访问记录、
 * 最终选择和完成标记。剧情正文、当前可见块、页面状态、选项专属 response、
 * 临时快照、动画与音频偏好都不进存档，可由正式数据重新推导的内容也不进存档。
 *
 * 存档结构版本以 storyManifest.schemaVersion 为唯一来源，当前阶段不做迁移：
 * 版本不一致、结构损坏或引用已失效的存档一律安全清除，按“无存档”处理。
 *
 * 本模块不允许把任何 storage 异常抛给 React 渲染层：
 * 读取 localStorage 这个属性本身、getItem、setItem、removeItem 和 JSON 解析
 * 都各自容错，失败时只影响“能否保存”，不影响能否继续游玩。
 */

export const STORY_SAVE_KEY = 'mirror-agent:story-save'

type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type StorySaveLoadResult =
  /** 存档存在且通过全部校验，可以直接恢复。 */
  | { status: 'valid'; state: StoryState }
  /** storage 可用，但没有存档。 */
  | { status: 'none' }
  /** 存档存在但不可用（损坏、旧版本、引用失效），已尝试清除。 */
  | { status: 'invalid'; reason: string }
  /** storage 本身不可用，本次会话不保存。 */
  | { status: 'unavailable'; reason: string }

export type StorySaveValidation =
  | { ok: true; state: StoryState }
  | { ok: false; reason: string }

type Checked<T> = { ok: true; value: T } | { ok: false; reason: string }

function ok<T>(value: T): Checked<T> {
  return { ok: true, value }
}

function fail<T>(reason: string): Checked<T> {
  return { ok: false, reason }
}

/**
 * 穷举列出的合法枚举值。
 * 用 satisfies Record<...> 保证以后新增最终选择或选择类型时这里会编译报错。
 */
const FINAL_CHOICE_IDS = Object.keys({
  close_agent: true,
  ask_identity: true,
  permanent_agent: true,
  tool_only: true,
} satisfies Record<FinalChoice, true>) as FinalChoice[]

const CHOICE_TYPES = Object.keys({
  roleplay: true,
  exploration: true,
  key: true,
  final: true,
} satisfies Record<StoryChoiceType, true>) as StoryChoiceType[]

// ---------------------------------------------------------------------------
// storage 访问
// ---------------------------------------------------------------------------

/** 只有一次失败提示，避免每次保存都往控制台刷同样的警告。 */
let warnedAboutStorage = false

function warnOnce(detail: string) {
  if (warnedAboutStorage) return
  warnedAboutStorage = true
  console.warn(`[story] 本地存档不可用，本次会话不保存进度：${detail}`)
}

/**
 * 读取 storage 引用。
 *
 * 不在模块顶层访问，因为在隐私模式或被策略禁用时，读取这个属性本身就会抛错。
 */
function getStorage(): StorageLike | null {
  try {
    const candidate = (globalThis as { localStorage?: StorageLike | null }).localStorage

    if (!candidate) return null

    if (
      typeof candidate.getItem !== 'function' ||
      typeof candidate.setItem !== 'function' ||
      typeof candidate.removeItem !== 'function'
    ) {
      return null
    }

    return candidate
  } catch {
    return null
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// ---------------------------------------------------------------------------
// 校验
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateStats(raw: unknown): Checked<Stats> {
  if (!isRecord(raw)) return fail('stats 不是对象。')

  const stats = {} as Stats

  for (const key of STAT_KEYS) {
    const value = raw[key]

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fail(`stats.${key} 不是有限数字。`)
    }

    stats[key] = value
  }

  return ok(stats)
}

/** 选择记录必须仍然能在正式剧情里找到对应的节点、章节和选项，且类型一致。 */
function validateChoiceHistory(raw: unknown): Checked<ChoiceRecord[]> {
  if (!Array.isArray(raw)) return fail('choiceHistory 不是数组。')

  const records: ChoiceRecord[] = []

  for (const [index, item] of raw.entries()) {
    if (!isRecord(item)) return fail(`choiceHistory[${index}] 不是对象。`)

    const { choiceId, nodeId, chapterId, choiceType, selectedAt } = item

    if (
      typeof choiceId !== 'string' ||
      typeof nodeId !== 'string' ||
      typeof chapterId !== 'string' ||
      typeof selectedAt !== 'string'
    ) {
      return fail(`choiceHistory[${index}] 的字段类型不正确。`)
    }

    if (typeof choiceType !== 'string' || !CHOICE_TYPES.includes(choiceType as StoryChoiceType)) {
      return fail(`choiceHistory[${index}] 的 choiceType 不是合法类型：${String(choiceType)}。`)
    }

    const node = getStoryNode(nodeId)

    if (!node) return fail(`choiceHistory[${index}] 引用的节点不存在：${nodeId}。`)

    if (node.chapterId !== chapterId) {
      return fail(`choiceHistory[${index}] 的章节与节点不一致：${chapterId}。`)
    }

    const choice = node.choices?.find((candidate) => candidate.id === choiceId)

    if (!choice) return fail(`choiceHistory[${index}] 引用的选项不存在：${choiceId}。`)

    if (choice.type !== choiceType) {
      return fail(`choiceHistory[${index}] 的选项类型与剧情数据不一致：${choiceId}。`)
    }

    records.push({
      choiceId,
      nodeId,
      chapterId,
      choiceType: choice.type,
      selectedAt,
    })
  }

  return ok(records)
}

function validateTags(raw: unknown): Checked<string[]> {
  if (!Array.isArray(raw)) return fail('tags 不是数组。')

  for (const [index, tag] of raw.entries()) {
    if (typeof tag !== 'string') return fail(`tags[${index}] 不是字符串。`)
  }

  return ok([...(raw as string[])])
}

function validateFlags(raw: unknown): Checked<Record<string, FlagValue>> {
  if (!isRecord(raw)) return fail('flags 不是对象。')

  const flags: Record<string, FlagValue> = {}

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'boolean' || typeof value === 'string') {
      flags[key] = value
      continue
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      flags[key] = value
      continue
    }

    return fail(`flags.${key} 不是 boolean / string / 有限数字。`)
  }

  return ok(flags)
}

function validateVisitedNodeIds(raw: unknown): Checked<StoryNodeId[]> {
  if (!Array.isArray(raw)) return fail('visitedNodeIds 不是数组。')

  for (const [index, nodeId] of raw.entries()) {
    if (typeof nodeId !== 'string') return fail(`visitedNodeIds[${index}] 不是字符串。`)
    if (!getStoryNode(nodeId)) return fail(`visitedNodeIds[${index}] 引用的节点不存在：${nodeId}。`)
  }

  return ok([...(raw as StoryNodeId[])])
}

/**
 * 运行时校验，绝不使用 `JSON.parse(raw) as StoryState` 代替。
 *
 * 通过校验后返回的是重新组装的干净状态，存档里多余的字段不会进入内存。
 */
export function validateStorySave(raw: unknown): StorySaveValidation {
  if (!isRecord(raw)) return { ok: false, reason: '存档根值不是对象。' }

  if (raw.schemaVersion !== storyManifest.schemaVersion) {
    return {
      ok: false,
      reason: `存档版本不匹配：${String(raw.schemaVersion)} ≠ ${storyManifest.schemaVersion}。`,
    }
  }

  if (typeof raw.currentNodeId !== 'string') {
    return { ok: false, reason: 'currentNodeId 不是字符串。' }
  }

  const node = getStoryNode(raw.currentNodeId)

  if (!node) {
    return { ok: false, reason: `currentNodeId 不在正式剧情中：${raw.currentNodeId}。` }
  }

  if (typeof raw.completed !== 'boolean') {
    return { ok: false, reason: 'completed 不是布尔值。' }
  }

  if (raw.finalChoice !== undefined && typeof raw.finalChoice !== 'string') {
    return { ok: false, reason: 'finalChoice 不是合法值。' }
  }

  if (
    raw.finalChoice !== undefined &&
    !FINAL_CHOICE_IDS.includes(raw.finalChoice as FinalChoice)
  ) {
    return { ok: false, reason: `finalChoice 不是合法值：${raw.finalChoice}。` }
  }

  const stats = validateStats(raw.stats)
  if (!stats.ok) return { ok: false, reason: stats.reason }

  const choiceHistory = validateChoiceHistory(raw.choiceHistory)
  if (!choiceHistory.ok) return { ok: false, reason: choiceHistory.reason }

  const tags = validateTags(raw.tags)
  if (!tags.ok) return { ok: false, reason: tags.reason }

  const flags = validateFlags(raw.flags)
  if (!flags.ok) return { ok: false, reason: flags.reason }

  const visitedNodeIds = validateVisitedNodeIds(raw.visitedNodeIds)
  if (!visitedNodeIds.ok) return { ok: false, reason: visitedNodeIds.reason }

  const state: StoryState = {
    schemaVersion: storyManifest.schemaVersion,
    currentNodeId: raw.currentNodeId,
    stats: stats.value,
    choiceHistory: choiceHistory.value,
    tags: tags.value,
    flags: flags.value,
    visitedNodeIds: visitedNodeIds.value,
    finalChoice: raw.finalChoice as FinalChoice | undefined,
    completed: raw.completed,
  }

  // 完成状态的不变量：结局门是唯一的完成检查点，两侧都不允许出现中间态。
  if (state.completed) {
    if (node.role !== 'ending_gate') {
      return { ok: false, reason: `完成存档没有停在结局门：${state.currentNodeId}。` }
    }

    if (state.finalChoice === undefined) {
      return { ok: false, reason: '完成存档缺少 finalChoice。' }
    }

    const resolution = getEnding(state)

    if (!getEndingDefinition(resolution.endingId)) {
      return { ok: false, reason: `完成存档无法重新推导结局：${resolution.endingId}。` }
    }
  } else if (node.role === 'ending_gate') {
    return { ok: false, reason: '未完成存档停在结局门，属于未提交的中间态。' }
  }

  return { ok: true, state }
}

// ---------------------------------------------------------------------------
// 读写
// ---------------------------------------------------------------------------

/** 删除存档。失败只返回 false，调用方不得因此继续使用旧存档。 */
export function clearStorySave(): boolean {
  const storage = getStorage()

  if (!storage) return false

  try {
    storage.removeItem(STORY_SAVE_KEY)
    return true
  } catch (error) {
    warnOnce(describeError(error))
    return false
  }
}

/** 保存正式状态。失败不抛错、不阻断游玩，只返回 false。 */
export function saveStorySave(state: StoryState): boolean {
  const storage = getStorage()

  if (!storage) {
    warnOnce('localStorage 不可用。')
    return false
  }

  let serialized: string

  try {
    serialized = JSON.stringify(state)
  } catch (error) {
    warnOnce(describeError(error))
    return false
  }

  try {
    storage.setItem(STORY_SAVE_KEY, serialized)
    return true
  } catch (error) {
    warnOnce(describeError(error))
    return false
  }
}

/** 读取存档。任何异常都降级为“没有可用存档”，损坏的存档会被尝试清除。 */
export function loadStorySave(): StorySaveLoadResult {
  const storage = getStorage()

  if (!storage) {
    return { status: 'unavailable', reason: 'localStorage 不可用。' }
  }

  let raw: string | null

  try {
    raw = storage.getItem(STORY_SAVE_KEY)
  } catch (error) {
    return { status: 'unavailable', reason: describeError(error) }
  }

  if (raw === null || raw === undefined) {
    return { status: 'none' }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    const reason = `存档不是合法 JSON：${describeError(error)}`
    console.warn(`[story] 已丢弃损坏的存档：${reason}`)
    clearStorySave()
    return { status: 'invalid', reason }
  }

  const validation = validateStorySave(parsed)

  if (!validation.ok) {
    console.warn(`[story] 已丢弃不可用的存档：${validation.reason}`)
    clearStorySave()
    return { status: 'invalid', reason: validation.reason }
  }

  return { status: 'valid', state: validation.state }
}
