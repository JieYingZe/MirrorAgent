import type { SceneKey, SceneSurface } from '../types/visual'

/**
 * 视觉场景解析（V02）。
 *
 * 纯函数，不 import 任何图片资源，也不认识任何节点 ID：
 * 剧情侧的唯一输入是章节元信息里的 `backgroundKey`，
 * 开始页、结局页和错误页由 `surface` 决定。
 *
 * 这样「背景在什么时候换」就只剩一个可测的判断点：场景键有没有变。
 * 同一章内的节点跳转、局部分支和分支汇流拿到的都是同一个章节，
 * 因此场景键不变，图片层也就不会重新加载。
 */

/**
 * 与 manifest 中章节 `backgroundKey` 的取值集合保持一致，另加 StartPage 专用的 `start`。
 *
 * `start` 与 `prologue` 是两张不同的图：开始页那张是含标题与宣传语的成稿，
 * 序章那张是同一个房间但画面里没有任何海报文字，可以正常压在正文底下。
 */
export const IMAGE_SCENE_KEYS = [
  'start',
  'prologue',
  'efficiency',
  'relationship',
  'perfect_self',
  'control',
  'ending',
] as const satisfies readonly SceneKey[]

export function isImageSceneKey(value: string | undefined): value is (typeof IMAGE_SCENE_KEYS)[number] {
  return value !== undefined && (IMAGE_SCENE_KEYS as readonly string[]).includes(value)
}

/**
 * 解析当前应显示的场景键。
 *
 * - StartPage 固定 `start`（成稿展示），序章由 manifest 的 `backgroundKey` 给出 `prologue`，
 *   所以「开始页 → 序章」会发生一次背景切换；
 * - 第五章与 EndingPage 都落在 `ending`，两者之间不换图；
 * - 章节的 `backgroundKey` 不在已知集合里时退回 `fallback`，只显示渐变，不显示破图。
 */
export function resolveSceneKey(surface: SceneSurface, chapterBackgroundKey?: string): SceneKey {
  switch (surface) {
    case 'start':
      return 'start'
    case 'ending':
      return 'ending'
    case 'error':
      return 'fallback'
    case 'game':
      return isImageSceneKey(chapterBackgroundKey) ? chapterBackgroundKey : 'fallback'
  }
}
