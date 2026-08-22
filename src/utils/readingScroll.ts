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

/* ---------- scroll 事件的归属判定 ---------- */

/**
 * 玩家输入之后多久之内的 scroll 事件才算他自己滚的。
 *
 * 滚轮、触摸、滚动键都会先留下一个时间戳。窗口一过就作废，
 * 因为「滚不动的那一下」（已经到底还继续滚轮）不会产生任何 scroll 事件，
 * 这种意图必须自己过期，否则会被后面某次程序滚动认领。
 */
export const USER_SCROLL_INTENT_WINDOW_MS = 400

/**
 * 一次程序滚动最多认领这么久的 scroll 事件。
 *
 * 跟随滚动是瞬时的，位置在同一帧就已经定下来，护栏只需要覆盖
 * 「发起滚动」到「它自己的 scroll 事件送达」之间的那点间隔；
 * 主线程再忙也用不了这么久。这些事件必须归给程序，否则会拿它去判断
 * 「玩家还在不在跟读」，把自动跟随关掉。
 */
export const PROGRAMMATIC_SCROLL_GUARD_MS = 300

/** 一次还没确认到位的程序滚动：目标位置与最晚结束时间。 */
export type PendingProgrammaticScroll = {
  top: number
  deadline: number
}

export type ScrollSourceDecision = {
  /** 是否按玩家滚动处理：只有玩家滚动才更新跟随状态。 */
  fromUser: boolean
  /** 处理完这次事件之后，程序滚动的护栏还要不要继续保留。 */
  keepPending: boolean
}

/**
 * 判断一次 scroll 事件该归给谁。
 *
 * 三种归属，只有第一种会改变跟随状态：
 * - 玩家：最近一次真实输入还在有效窗口内。玩家接管滚动，进行中的程序滚动作废；
 * - 程序：护栏还在，且既没到位也没超时 —— 这是我们自己刚发起的那次滚动；
 * - 不明：没有输入意图也没有程序滚动（例如布局变化引起的滚动），保持现状。
 */
export function classifyReadingScroll(input: {
  now: number
  /** 最近一次滚轮／触摸／滚动键的时间戳；0 表示没有。 */
  lastUserIntentAt: number
  pending: PendingProgrammaticScroll | null
  /** 事件发生时容器的 scrollTop。 */
  scrollTop: number
}): ScrollSourceDecision {
  const { now, lastUserIntentAt, pending, scrollTop } = input
  const fromUser = now - lastUserIntentAt < USER_SCROLL_INTENT_WINDOW_MS

  if (fromUser) return { fromUser: true, keepPending: false }

  const stillAnimating =
    pending !== null && now <= pending.deadline && Math.abs(scrollTop - pending.top) > 1

  return { fromUser: false, keepPending: stillAnimating }
}
