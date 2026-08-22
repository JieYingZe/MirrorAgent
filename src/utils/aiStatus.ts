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
  /**
   * 标签下方的英文副标（V03）。
   *
   * 只是排版用的副标，不是变量的内部字段名 —— 面板上永远不出现
   * gentleness / honesty / control / selfAcceptance。桌面端显示，移动端隐藏。
   */
  labelEn: string
  /** 必须按 max 升序声明，且只有最后一档可以省略 max。 */
  bands: AiStatusBand[]
}

export type AiStatusItem = {
  key: StatKey
  label: string
  labelEn: string
  value: string
}

/**
 * 结局页状态摘要用的展示模型（V03）。
 *
 * 在 AiStatusItem 之上多两个字段：命中的是第几档、一共几档。
 * 结局页把它画成一排点（第 level 个之前的点亮起），docs/04 §5.3 允许
 * 「结局页可以展示更明确的结果」。
 *
 * 仍然不是裸数值：level 是**档位序号**，不是变量值，也不是百分比；
 * 变量本身没有上下限（见 utils/story/storyState.ts），根本没有可归一化的量程。
 */
export type AiStatusMeter = AiStatusItem & {
  /** 命中的档位，从 1 开始。 */
  level: number
  /** 这一项一共几档。四项当前都是 5，但不写死。 */
  levels: number
}

/**
 * 映射配置集中维护在这里，组件与页面都不再写区间判断。
 *
 * 状态文案统一收在四个汉字以内（V03）。面板右列是定宽的一栏，
 * 五到七个字的文案在 260px 的面板里会折行，四行状态就会长短不一；
 * 收成等长之后整列右边缘是齐的，也不再有任何一档需要换行。
 * 收窄只改措辞，不改分档阈值 —— 区间仍与 endingRules 的判定点对齐。
 */
export const AI_STATUS_SCALE: Record<StatKey, AiStatusScaleEntry> = {
  gentleness: {
    label: '语气',
    labelEn: 'Tone',
    bands: [
      { max: 0, value: '中性输出' },
      { max: 4, value: '低度安抚' },
      { max: 8, value: '支持校准' },
      { max: 12, value: '保护增强' },
      { value: '缓冲优先' },
    ],
  },
  honesty: {
    label: '反馈',
    labelEn: 'Feedback',
    bands: [
      { max: 3, value: '委婉过滤' },
      { max: 7, value: '事实校准' },
      { max: 10, value: '直接反馈' },
      { max: 14, value: '直面模式' },
      { value: '去除修饰' },
    ],
  },
  control: {
    label: '权限',
    labelEn: 'Access',
    bands: [
      { max: -3, value: '权限收回' },
      { max: 2, value: '工具模式' },
      { max: 5, value: '建议模式' },
      { max: 7, value: '代理预备' },
      { value: '接管倾向' },
    ],
  },
  /*
    标签是「边界」而不是「自我边界」：面板左列与图标、英文副标共用一行，
    四个字的标签会把右列的状态挤到折行。变量名仍然是 selfAcceptance，
    文案层的收窄不影响任何判定。
  */
  selfAcceptance: {
    label: '边界',
    labelEn: 'Boundary',
    bands: [
      { max: 0, value: '尚未确认' },
      { max: 4, value: '尚不稳定' },
      { max: 7, value: '正在形成' },
      { max: 11, value: '自主回收' },
      { value: '清晰稳定' },
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

/**
 * 命中档位的下标（0 起）。
 *
 * 与 resolveStatBand 共用同一次查找，两者永远不会给出不一致的结果。
 * 末档没有 max，findIndex 必然命中；-1 只是让返回值不依赖这一点。
 */
export function resolveStatBandIndex(key: StatKey, value: number): number {
  const { bands } = AI_STATUS_SCALE[key]
  const safe = normalize(value)
  const index = bands.findIndex((band) => band.max === undefined || safe <= band.max)

  return index === -1 ? bands.length - 1 : index
}

/** 任意数值都只命中一档，永远不会返回 undefined。 */
export function resolveStatBand(key: StatKey, value: number): AiStatusBand {
  const { bands } = AI_STATUS_SCALE[key]

  return bands[resolveStatBandIndex(key, value)]
}

export function resolveStatStatus(key: StatKey, value: number): string {
  return resolveStatBand(key, value).value
}

/** 面板展示模型：固定四项，顺序与 STAT_KEYS 一致。 */
export function deriveAiStatusItems(stats: Stats): AiStatusItem[] {
  return STAT_KEYS.map((key) => ({
    key,
    label: AI_STATUS_SCALE[key].label,
    labelEn: AI_STATUS_SCALE[key].labelEn,
    value: resolveStatStatus(key, stats[key]),
  }))
}

/** 结局页的状态摘要：在面板展示模型之上补上档位序号。 */
export function deriveAiStatusMeters(stats: Stats): AiStatusMeter[] {
  return STAT_KEYS.map((key) => {
    const entry = AI_STATUS_SCALE[key]
    const index = resolveStatBandIndex(key, stats[key])

    return {
      key,
      label: entry.label,
      labelEn: entry.labelEn,
      value: entry.bands[index].value,
      level: index + 1,
      levels: entry.bands.length,
    }
  })
}
