/**
 * 音频类型（A01 / A02）。
 *
 * 只描述「现在应该响哪一首」和「这首怎么放」，不包含任何剧情语义：
 * 剧情侧的输入只有当前节点 ID 与章节 ID，解析规则在 src/utils/audio/bgmScene.ts，
 * 资源与音量集中在 src/data/audioTracks.ts。
 *
 * 本轮只有 BGM。SFX 属于 A03，这里不提前定义。
 */

/** BGM 曲目键。与 public/audio/bgm/ 下的四个文件一一对应。 */
export type BgmTrackKey = 'main_theme' | 'game_ambient' | 'control_mode' | 'ending'

/**
 * 音频画面种类。
 *
 * 与 App 的 screen 状态一一对应（另加错误页），取值与 `SceneSurface` 一致，
 * 但两者是各自独立的输入：背景按章节的 backgroundKey 走，BGM 需要节点级边界。
 */
export type AudioSurface = 'start' | 'game' | 'ending' | 'error'

/**
 * 当前音频场景。
 *
 * 只有剧情页需要节点 ID：第五章要在章内换歌，章节级信息不足以定位边界。
 */
export type BgmScene =
  | { surface: Exclude<AudioSurface, 'game'> }
  | { surface: 'game'; nodeId: string; chapterId: string }

/** 一首 BGM 的运行时定义。 */
export type BgmTrack = {
  key: BgmTrackKey
  /** 适配 Vite base 的公开资源路径。 */
  src: string
  /**
   * 曲目自身增益，最终音量 = 主音量 × gain。
   *
   * 四个音源的响度并不一致，这一档用来把它们拉平，
   * 不是「这一章要更大声」的表达手段。
   */
  gain: number
  /** 调试与文档用的中文说明，不显示在界面上。 */
  description: string
}
