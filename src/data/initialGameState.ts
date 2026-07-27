import type { StatKey, Stats } from '../types/game'

/** 游戏总是从序章开始。 */
export const INITIAL_CHAPTER_ID = 'prologue'

/** 遍历变量时使用，保证顺序稳定。 */
export const STAT_KEYS: readonly StatKey[] = ['gentleness', 'honesty', 'control', 'selfAcceptance']

/**
 * 初始变量值。冻结后只作为基准，任何会话都不应直接持有这个对象。
 */
export const initialStats: Readonly<Stats> = Object.freeze({
  gentleness: 0,
  honesty: 0,
  control: 0,
  selfAcceptance: 0,
})

/** 每次调用返回一份新的变量对象，避免不同会话共享同一个可变引用。 */
export function createInitialStats(): Stats {
  return { ...initialStats }
}
