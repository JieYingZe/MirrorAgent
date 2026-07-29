import type { ImageSceneKey, SceneKey, SceneVisual } from '../types/visual'

import bgStartDesktop from '../assets/backgrounds/desktop/bg-start.webp'
import bgPrologueDesktop from '../assets/backgrounds/desktop/bg-prologue.webp'
import bgEfficiencyDesktop from '../assets/backgrounds/desktop/bg-efficiency.webp'
import bgRelationshipDesktop from '../assets/backgrounds/desktop/bg-relationship.webp'
import bgPerfectSelfDesktop from '../assets/backgrounds/desktop/bg-perfect-self.webp'
import bgControlDesktop from '../assets/backgrounds/desktop/bg-control.webp'
import bgEndingDesktop from '../assets/backgrounds/desktop/bg-ending.webp'

import bgStartMobile from '../assets/backgrounds/mobile/bg-start-mobile.webp'
import bgPrologueMobile from '../assets/backgrounds/mobile/bg-prologue-mobile.webp'
import bgEfficiencyMobile from '../assets/backgrounds/mobile/bg-efficiency-mobile.webp'
import bgRelationshipMobile from '../assets/backgrounds/mobile/bg-relationship-mobile.webp'
import bgPerfectSelfMobile from '../assets/backgrounds/mobile/bg-perfect-self-mobile.webp'
import bgControlMobile from '../assets/backgrounds/mobile/bg-control-mobile.webp'
import bgEndingMobile from '../assets/backgrounds/mobile/bg-ending-mobile.webp'

/**
 * 背景资源与调校参数（V02）。
 *
 * 全项目唯一维护背景图路径的地方，页面和组件都不再各自 import 图片。
 * 资源清单见 docs/05-assets-map.md §3，章节 → 场景键的映射来自
 * src/data/story/manifest.ts 的 `backgroundKey`，解析规则见 utils/visualScene.ts。
 *
 * 桌面图 1672×941，移动图 941×1672；由 `<picture>` 按断点二选一下载，
 * 不会一次性加载全部十二张。
 */

/** 必须与 global.css 里的移动端断点一致，否则会下错图。 */
export const MOBILE_SCENE_MEDIA = '(max-width: 768px)'

/**
 * object-position 说明。
 *
 * 视口比桌面图更窄（≈16:9 以下）时只会横向裁剪，图片中心始终落在视口中心，
 * 所以横向百分比是可预期的；`bg-start` 的画面标题恰好结束在图片 50% 处，
 * 开始页遮罩的横向拐点也就定在 50%，两边一起决定了它会不会露出来。
 */
const SCENE_VISUALS: Record<ImageSceneKey, SceneVisual> = {
  start: {
    key: 'start',
    desktopSrc: bgStartDesktop,
    mobileSrc: bgStartMobile,
    /*
      这张不是氛围底图，是开始页成稿：英文标题、中文标题、副标题、右侧终端
      及其中的中文、渐变与光效都画在图里，是有意保留的可见内容。

      因此它是唯一一个用 `object-fit: contain` 完整显示的场景（见 global.css 里
      按 data-scene-key='start' 的规则），不透明度保持 1，也不叠全局暗色层。
      既然不裁剪，`objectPosition` 对它就没有作用，留 50% 只是保持字段完整。

      序章不用这张图，用没有海报文字的 `prologue`。
    */
    desktop: { objectPosition: '50% 50%', opacity: 1 },
    mobile: { objectPosition: '50% 50%', opacity: 1 },
    description: '开始页成稿：暗房中的发光终端与镜面，含标题与副标题',
  },
  prologue: {
    key: 'prologue',
    desktopSrc: bgPrologueDesktop,
    mobileSrc: bgPrologueMobile,
    // 与开始页同一个房间，但画面里没有海报标题，可以正常压在正文底下。
    // 主体（发光终端）在右侧，左边整片留白正好留给剧情阅读区。
    desktop: { objectPosition: '56% 50%', opacity: 0.95 },
    mobile: { objectPosition: '50% 42%', opacity: 0.6 },
    description: '序章：暗房中的发光终端，无海报文字',
  },
  efficiency: {
    key: 'efficiency',
    desktopSrc: bgEfficiencyDesktop,
    mobileSrc: bgEfficiencyMobile,
    desktop: { objectPosition: '58% 50%', opacity: 0.95 },
    mobile: { objectPosition: '50% 58%', opacity: 0.6 },
    description: '深夜书桌与散落的计划表',
  },
  relationship: {
    key: 'relationship',
    desktopSrc: bgRelationshipDesktop,
    mobileSrc: bgRelationshipMobile,
    desktop: { objectPosition: '56% 50%', opacity: 0.95 },
    mobile: { objectPosition: '50% 55%', opacity: 0.6 },
    description: '夜里亮着的聊天界面光影',
  },
  perfect_self: {
    key: 'perfect_self',
    desktopSrc: bgPerfectSelfDesktop,
    mobileSrc: bgPerfectSelfMobile,
    desktop: { objectPosition: '54% 50%', opacity: 0.95 },
    mobile: { objectPosition: '50% 50%', opacity: 0.6 },
    description: '镜中更清晰的另一个自己',
  },
  control: {
    key: 'control',
    desktopSrc: bgControlDesktop,
    mobileSrc: bgControlMobile,
    // 第四章只允许克制的 warning 倾向：图里本来就只有一点暗红光，
    // 这里不额外叠红，只把整体压得更暗一点。
    desktop: { objectPosition: '52% 50%', opacity: 0.9 },
    mobile: { objectPosition: '50% 50%', opacity: 0.55 },
    description: '玻璃隔间与受限的低光警示',
  },
  ending: {
    key: 'ending',
    desktopSrc: bgEndingDesktop,
    mobileSrc: bgEndingMobile,
    desktop: { objectPosition: '50% 50%', opacity: 0.95 },
    mobile: { objectPosition: '50% 52%', opacity: 0.6 },
    description: '人站在巨大镜面前，镜中是数据化轮廓',
  },
}

/** 没有图片资源的场景（`fallback`）返回 null，由调用方只渲染渐变层。 */
export function getSceneVisual(key: SceneKey): SceneVisual | null {
  return key === 'fallback' ? null : SCENE_VISUALS[key]
}
