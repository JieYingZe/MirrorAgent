import type { StatKey, Stats } from '../types/game'
import { STAT_KEYS } from '../data/initialGameState'

/**
 * 四个隐藏变量 → AI 系统状态文案（I02）。
 *
 * 纯映射，不读写 StoryState，不参与结局判断，也不认识任何节点 ID。
 * 面板上只出现状态描述：不显示数字、增减、百分比或内部字段名。
 *
 * 区间设计与 src/data/story/rules/endingRules.ts 的判定阈值对齐
 * （control 2 / 5 / 7 / 8，selfAcceptance 4 / 8 / 12，honesty 11 / 14，gentleness 5），
 * 这样玩家看到的状态描述和结局规则读的是同一批分界点。
 *
 * 变量不做上下限截断（见 utils/story/storyState.ts），因此首档向下开放到负无穷、
 * 末档向上开放到正无穷，任何有限或非有限的旧存档数值都能落到唯一一档。
 */

export type AiStatusBand = {
  /** 区间上界（含）。省略表示这是末档，向上开放到正无穷。 */
  max?: number
  /** 面板显示的状态文案。 */
  value: string
}

export type AiStatusScaleEntry = {
  /** 面板标签，不使用变量英文名。 */
  label: string
  /** 必须按 max 升序声明，且只有最后一档可以省略 max。 */
  bands: AiStatusBand[]
}

export type AiStatusItem = {
  key: StatKey
  label: string
  value: string
}

/** 映射配置集中维护在这里，组件与页面都不再写区间判断。 */
export const AI_STATUS_SCALE: Record<StatKey, AiStatusScaleEntry> = {
  gentleness: {
    label: '语气',
    bands: [
      { max: 0, value: '保护偏向未建立' },
      { max: 4, value: '低强度安抚' },
      { max: 8, value: '支持性校准' },
      { max: 12, value: '保护性增强' },
      { value: '缓冲优先' },
    ],
  },
  honesty: {
    label: '反馈',
    bands: [
      { max: 3, value: '委婉过滤' },
      { max: 7, value: '事实校准' },
      { max: 10, value: '直接反馈' },
      { max: 14, value: '直面模式' },
      { value: '去修饰输出' },
    ],
  },
  control: {
    label: '权限',
    bands: [
      { max: -3, value: '权限已收回' },
      { max: 2, value: '工具模式' },
      { max: 5, value: '建议模式' },
      { max: 7, value: '代理预备' },
      { value: '接管倾向' },
    ],
  },
  selfAcceptance: {
    label: '自我边界',
    bands: [
      { max: 0, value: '边界待确认' },
      { max: 4, value: '边界不稳定' },
      { max: 7, value: '边界形成中' },
      { max: 11, value: '自主权回收' },
      { value: '边界稳定' },
    ],
  },
}

/**
 * 异常值兜底。
 *
 * undefined 与 NaN 只可能来自损坏数据或旧存档，一律按初始值 0 处理；
 * ±Infinity 不做特殊处理，直接参与比较即可落入首档或末档。
 */
function normalize(value: number): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

/** 任意数值都只命中一档，永远不会返回 undefined。 */
export function resolveStatBand(key: StatKey, value: number): AiStatusBand {
  const { bands } = AI_STATUS_SCALE[key]
  const safe = normalize(value)
  const matched = bands.find((band) => band.max === undefined || safe <= band.max)

  // 末档没有 max，find 必然命中；这里只是让返回类型不含 undefined。
  return matched ?? bands[bands.length - 1]
}

export function resolveStatStatus(key: StatKey, value: number): string {
  return resolveStatBand(key, value).value
}

/** 面板展示模型：固定四项，顺序与 STAT_KEYS 一致。 */
export function deriveAiStatusItems(stats: Stats): AiStatusItem[] {
  return STAT_KEYS.map((key) => ({
    key,
    label: AI_STATUS_SCALE[key].label,
    value: resolveStatStatus(key, stats[key]),
  }))
}
