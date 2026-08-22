/**
 * 理论路径占比的展示取整。
 *
 * 这是唯一把占比变成界面数字的地方。结局页只显示整数百分比：
 * 一位小数会让这份「结构模拟结果」看起来像精确的实时统计，
 * 而它既不是玩家达成率，也不是随机概率（docs/06-story-ending-data-format.md §15）。
 *
 * 纯函数，不读结局数据，方便直接单测。
 */

/**
 * 把 0–1 的小数转成用于展示的整数百分比。
 *
 * 下限锁在 1：占比再低也不能显示成「约 0%」—— 玩家确实抵达了这个结局，
 * 一个 0 会读成「这条路不存在」。上限锁在 100，非有限数字同样回落到 1。
 */
export function toEndingRatePercent(rate: number): number {
  if (!Number.isFinite(rate)) return 1

  return Math.min(100, Math.max(1, Math.round(rate * 100)))
}
