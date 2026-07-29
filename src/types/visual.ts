/**
 * 视觉场景类型（V02）。
 *
 * 只描述「哪一张背景、怎么摆」，不包含任何剧情语义：
 * 剧情侧唯一的输入是章节元信息里的 `backgroundKey`（见 src/data/story/manifest.ts）。
 * 具体资源与调校参数集中在 src/data/visualScenes.ts，解析规则在 src/utils/visualScene.ts。
 */

/**
 * 视觉场景键。
 *
 * `start` 由 StartPage 这个页面本身决定，其余六个与 `StoryChapterMeta.backgroundKey`
 * 的取值一一对应；`fallback` 表示「不显示任何图片，只保留 CSS 渐变」，
 * 用于错误页与图片加载失败。
 */
export type SceneKey =
  | 'start'
  | 'prologue'
  | 'efficiency'
  | 'relationship'
  | 'perfect_self'
  | 'control'
  | 'ending'
  | 'fallback'

/** 有图片资源的场景键。 */
export type ImageSceneKey = Exclude<SceneKey, 'fallback'>

/**
 * 画面种类。
 *
 * 与 App 的 screen 状态一一对应，另加错误页。遮罩按它区分，
 * 因为同一张图在开始页、剧情页和结局页需要不同的压暗方式。
 */
export type SceneSurface = 'start' | 'game' | 'ending' | 'error'

/**
 * 当前场景图片的加载状态。
 *
 * 供页面决定要不要显示可见兜底：开始页的可见标题与说明写在背景成稿里，
 * 成稿加载不出来时页面上不能只剩两个孤零零的按钮。
 * `unavailable` 表示这个场景本来就没有图片资源（错误页的 `fallback`）。
 */
export type SceneImageStatus = 'loading' | 'ready' | 'failed' | 'unavailable'

/** 单个断点下的图片摆放方式。 */
export type SceneImageTuning = {
  /** object-position，桌面与移动端可以不同。 */
  objectPosition: string
  /** 图片层不透明度：遮罩之外的第二道存在感控制。 */
  opacity: number
}

export type SceneVisual = {
  key: ImageSceneKey
  /** 由 Vite 处理后的最终资源 URL。 */
  desktopSrc: string
  mobileSrc: string
  desktop: SceneImageTuning
  mobile: SceneImageTuning
  /** 无障碍与调试用的中文场景名，不显示在界面上（图片层是纯装饰）。 */
  description: string
}
