/**
 * 剧情阅读区的内部滚动几何（I01 验收修订）。
 *
 * 只做矩形计算，不碰 DOM，方便单独测试。
 * 调用方把 `getBoundingClientRect()` 的结果传进来，
 * 得到的结果只用于调整剧情容器自己的 scrollTop，绝不滚动 window。
 */

export type ScrollBounds = {
  top: number
  bottom: number
  height: number
}

/**
 * 把目标块带进容器视野所需的最小滚动量。
 *
 * 语义等价于 `scrollIntoView({ block: 'nearest' })`，但限制在容器内部：
 * - 比容器还高的块对齐到容器顶部，从头开始读；
 * - 在上方 → 往回滚到它的顶部；
 * - 在下方 → 只滚到它的底部刚好进入视野；
 * - 已经完整可见 → 不滚。
 */
export function resolveContainerScrollDelta(container: ScrollBounds, target: ScrollBounds): number {
  if (target.height > container.height || target.top < container.top) {
    return target.top - container.top
  }

  if (target.bottom > container.bottom) {
    return target.bottom - container.bottom
  }

  return 0
}

/**
 * 目标块是否还在容器视野里（哪怕只露出一部分）。
 *
 * 用来判断玩家是不是还在跟读当前块：
 * 玩家主动往回翻历史时当前块会移出视野，自动跟随就此停止；
 * 玩家滚回来时它重新出现，自动跟随恢复。
 */
export function isTargetVisibleInContainer(
  container: ScrollBounds,
  target: ScrollBounds,
  margin = 8,
): boolean {
  return target.bottom > container.top + margin && target.top < container.bottom - margin
}
