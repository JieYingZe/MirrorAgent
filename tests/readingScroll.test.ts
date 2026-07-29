import { describe, expect, it } from 'vitest'
import {
  isTargetVisibleInContainer,
  resolveContainerScrollDelta,
} from '../src/utils/readingScroll'
import type { ScrollBounds } from '../src/utils/readingScroll'

/**
 * 剧情容器内部滚动的几何规则。
 *
 * 这一层是纯矩形计算，可以直接测。真实的滚动跟随行为依赖 scroll 事件，
 * 属于浏览器手动验收范围。
 */

/** 容器视野：屏幕上的 100–500，高 400。 */
const container: ScrollBounds = { top: 100, bottom: 500, height: 400 }

function bounds(top: number, height: number): ScrollBounds {
  return { top, bottom: top + height, height }
}

describe('resolveContainerScrollDelta', () => {
  it('完整可见的块不滚动', () => {
    expect(resolveContainerScrollDelta(container, bounds(150, 100))).toBe(0)
  })

  it('紧贴上下边界也算完整可见', () => {
    expect(resolveContainerScrollDelta(container, bounds(100, 400))).toBe(0)
  })

  it('块在下方时只滚到它的底部刚好进入视野', () => {
    // 底部超出 60，最小滚动就是 60，不会一路滚到底。
    expect(resolveContainerScrollDelta(container, bounds(440, 120))).toBe(60)
  })

  it('块在上方时往回滚到它的顶部', () => {
    expect(resolveContainerScrollDelta(container, bounds(40, 80))).toBe(-60)
  })

  it('比容器还高的块对齐到容器顶部，从头开始读', () => {
    expect(resolveContainerScrollDelta(container, bounds(300, 900))).toBe(200)
  })

  it('超高且已经在上方的块同样对齐顶部，不会反向乱跳', () => {
    expect(resolveContainerScrollDelta(container, bounds(-200, 900))).toBe(-300)
  })
})

describe('isTargetVisibleInContainer', () => {
  it('当前块完整可见时保持自动跟随', () => {
    expect(isTargetVisibleInContainer(container, bounds(200, 100))).toBe(true)
  })

  it('只露出一部分也算在跟读', () => {
    expect(isTargetVisibleInContainer(container, bounds(460, 200))).toBe(true)
    expect(isTargetVisibleInContainer(container, bounds(20, 100))).toBe(true)
  })

  it('当前块完全落在视野下方时停止跟随', () => {
    expect(isTargetVisibleInContainer(container, bounds(600, 100))).toBe(false)
  })

  it('当前块完全滚到上方时也停止跟随', () => {
    expect(isTargetVisibleInContainer(container, bounds(-200, 100))).toBe(false)
  })

  it('边缘只差几像素时按 margin 算作不可见，避免抖动', () => {
    expect(isTargetVisibleInContainer(container, bounds(495, 100))).toBe(false)
    expect(isTargetVisibleInContainer(container, bounds(490, 100))).toBe(true)
  })
})
