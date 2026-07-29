import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { SceneImageStatus, SceneKey, SceneSurface } from '../../types/visual'
import { MOBILE_SCENE_MEDIA, getSceneVisual } from '../../data/visualScenes'
import { useMediaQuery } from '../../hooks/useMediaQuery'

type SceneBackgroundProps = {
  /** 当前视觉场景键；只有它变化时才会换图。 */
  sceneKey: SceneKey
  /**
   * 当前画面种类。
   *
   * 遮罩按它区分而不是按 sceneKey：开始页与序章共用同一张 `start` 成稿，
   * 但开始页是成稿展示模式（几乎不压暗），序章是剧情阅读模式（要保证正文可读）。
   */
  surface: SceneSurface
  /** 当前场景图片的加载状态，供页面决定要不要显示可见兜底。 */
  onImageStatusChange?: (status: SceneImageStatus) => void
}

type LayerStatus = 'loading' | 'ready' | 'failed'

/**
 * 场景背景层（V02）。
 *
 * 四层结构，从下到上：
 * 1. `.scene__base`：CSS 渐变兜底，永远存在，图片没加载或加载失败时就是它；
 * 2. `.scene__layer`：响应式背景图片，`<picture>` 按断点二选一，`object-fit: cover`；
 * 3. `.scene__scrim`：页面级暗色遮罩，按 `surface` 区分方向与强度；
 * 4. 内容面板：不在这里，是各页面自己的 `.panel`。
 *
 * 加载策略：只挂载「已经出现过」的场景，同一章内的节点跳转、局部分支和汇流
 * 拿到的是同一个场景键，`<img src>` 不变，浏览器不会重新发起请求；
 * 也不会一次性预加载全部十二张图。
 *
 * 桌面／移动资源用 matchMedia 在 JS 里二选一，而不是 `<picture>` + `<source media>`：
 * React 会先给 img 设好 src 再把它接进 picture，浏览器那时已经开始下载 src 指向的桌面图，
 * 结果是移动端每个场景都会多下一张没用的横图。断点常量与 CSS 共用同一个字符串。
 *
 * 切换策略：新场景的图片 `onLoad` 之后才接管显示，在此之前继续显示上一张，
 * 因此换章不会先闪回纯渐变。加载失败的层直接不渲染，只保留渐变，不出现破图。
 *
 * 整层 `aria-hidden` + `alt=""`：背景是纯装饰，不进无障碍树，也不接收指针事件。
 */
export function SceneBackground({
  sceneKey,
  surface,
  onImageStatusChange,
}: SceneBackgroundProps) {
  const isMobile = useMediaQuery(MOBILE_SCENE_MEDIA)
  const [mounted, setMounted] = useState<SceneKey[]>(() =>
    getSceneVisual(sceneKey) ? [sceneKey] : [],
  )
  const [status, setStatus] = useState<Partial<Record<SceneKey, LayerStatus>>>({})
  /** 真正显示中的场景；只有图片就绪后才切过去。 */
  const [displayKey, setDisplayKey] = useState<SceneKey | null>(null)

  useEffect(() => {
    if (!getSceneVisual(sceneKey)) return

    setMounted((prev) => (prev.includes(sceneKey) ? prev : [...prev, sceneKey]))
  }, [sceneKey])

  // 跨过断点时全部换成另一套资源，旧的就绪状态不再适用。
  useEffect(() => {
    setStatus({})
  }, [isMobile])

  useEffect(() => {
    // 错误页与未知场景键：立刻退回纯渐变，不保留上一张图。
    if (!getSceneVisual(sceneKey)) {
      setDisplayKey(null)
      return
    }

    if (status[sceneKey] === 'ready') {
      setDisplayKey(sceneKey)
      return
    }

    // 新场景还没就绪时保持上一张，避免「有图 → 空白 → 有图」的闪烁；
    // 但正在显示的那一张自己失败了，就必须退回纯渐变 ——
    // 否则遮罩会继续压着一层根本不存在的图，画面比设计的还暗一档。
    setDisplayKey((prev) => (prev !== null && status[prev] === 'failed' ? null : prev))
  }, [sceneKey, status])

  const imageStatus: SceneImageStatus = getSceneVisual(sceneKey)
    ? (status[sceneKey] ?? 'loading')
    : 'unavailable'

  useEffect(() => {
    onImageStatusChange?.(imageStatus)
  }, [imageStatus, onImageStatusChange])

  function markStatus(key: SceneKey, next: LayerStatus) {
    setStatus((prev) => (prev[key] === next ? prev : { ...prev, [key]: next }))
  }

  return (
    <div
      className="scene"
      data-surface={surface}
      data-scene={displayKey ?? 'fallback'}
      data-image={displayKey ? 'ready' : 'none'}
      aria-hidden="true"
    >
      <div className="scene__base" />

      {mounted.map((key) => {
        const visual = getSceneVisual(key)

        if (!visual || status[key] === 'failed') return null

        return (
          <div
            key={key}
            className="scene__layer"
            // 显示方式跟着「是哪一张图」，不是跟着当前页面：
            // start 是成稿要完整显示，其余是氛围图铺满。
            // 按场景键写，换页时正在淡出的那一层才不会中途从 contain 跳成 cover。
            data-scene-key={key}
            data-active={key === displayKey ? 'true' : 'false'}
            style={
              {
                '--scene-position-desktop': visual.desktop.objectPosition,
                '--scene-position-mobile': visual.mobile.objectPosition,
                '--scene-opacity-desktop': String(visual.desktop.opacity),
                '--scene-opacity-mobile': String(visual.mobile.opacity),
              } as CSSProperties
            }
          >
            <img
              className="scene__image"
              src={isMobile ? visual.mobileSrc : visual.desktopSrc}
              alt=""
              decoding="async"
              draggable={false}
              onLoad={() => markStatus(key, 'ready')}
              onError={() => markStatus(key, 'failed')}
            />
          </div>
        )
      })}

      <div className="scene__scrim" />
    </div>
  )
}
