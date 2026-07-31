import type { BgmTrack, BgmTrackKey } from '../types/audio'
import { publicAssetUrl } from '../utils/audio/audioPaths'

/**
 * BGM 资源与音量（A01 / A02）。
 *
 * 全项目唯一维护音频文件路径与音量数值的地方：页面、hook 和播放器都不写死路径，
 * 也不各自散落 0.35、0.5 这样的魔法数字。资源清单见 docs/05-assets-map.md §6，
 * 来源与授权见 credits/audio-credits.md。
 *
 * 音量取向：BGM 服务于阅读氛围，属于「几乎注意不到，但关掉会觉得空」的存在感。
 *
 * `gain` 是曲目相对增益，不是可播放音量本身：实际播放音量 = masterVolume × gain，
 * 播放器（`utils/audio/bgmPlayer.ts`）在应用前会再夹到 [0, 1]。因此 `gain` 允许大于 1
 * （某个原始素材偏安静，需要相对放大），只要 `DEFAULT_MASTER_VOLUME × gain` 本身不超过 1，
 * 播放时就不会触及硬上限，也不需要为此引入新的音频链路。
 *
 * 四首素材的原始响度并不一致，因此保留各自独立的 gain 分别调校，
 * 不能只调 `DEFAULT_MASTER_VOLUME` 一个全局值。
 */

/**
 * 主音量默认值。
 *
 * 会被持久化到用户偏好里（`masterVolume`），本轮没有音量 UI，
 * 因此实际运行时它就是这个默认值。
 */
export const DEFAULT_MASTER_VOLUME = 0.5

/** 淡入淡出总时长。旧曲淡出与新曲淡入同时进行，重叠只有这么长。 */
export const BGM_FADE_MS = 600

/** 淡变的步进间隔。50ms 足够平滑，又不至于每秒排太多次回调。 */
export const BGM_FADE_STEP_MS = 50

const BGM_TRACKS: Record<BgmTrackKey, BgmTrack> = {
  main_theme: {
    key: 'main_theme',
    src: publicAssetUrl('audio/bgm/bgm-main-theme.mp3'),
    // 原始素材明显偏安静，相对放大约一倍。
    gain: 1.24,
    description: '开始页与序章：空旷、克制的主旋律',
  },
  game_ambient: {
    key: 'game_ambient',
    src: publicAssetUrl('audio/bgm/bgm-game-ambient.mp3'),
    // 这首本来就比其余三首响，只需要小幅提升。
    gain: 0.812,
    description: '第一至第三章与第五章前半：常规剧情氛围',
  },
  control_mode: {
    key: 'control_mode',
    src: publicAssetUrl('audio/bgm/bgm-control-mode.mp3'),
    // 第四章更紧张，但压低的用意应该由曲目本身的紧绷感承担，不靠音量差；
    // 原始素材偏安静，需要相对放大。
    gain: 1.2,
    description: '第四章失控日志：紧绷的钢琴',
  },
  ending: {
    key: 'ending',
    src: publicAssetUrl('audio/bgm/bgm-ending.mp3'),
    // 原始素材偏安静，相对放大约四成。
    gain: 1.4,
    description: '第五章后半与结局页：回望式的钢琴',
  },
}

export function getBgmTrack(key: BgmTrackKey): BgmTrack {
  return BGM_TRACKS[key]
}

/** 供测试与文档使用的完整清单，运行时不需要遍历。 */
export const BGM_TRACK_KEYS = Object.keys(BGM_TRACKS) as BgmTrackKey[]
