/**
 * 音频类型（A01 / A02 / A03）。
 *
 * 只描述「现在应该响哪一首」和「这首怎么放」，不包含任何剧情语义：
 * 剧情侧的输入只有当前节点 ID 与章节 ID，解析规则在 src/utils/audio/bgmScene.ts，
 * 资源与音量集中在 src/data/audioTracks.ts。
 *
 * BGM 与 SFX 是同一套音频状态下的两类声音：共享一个静音状态、一个主音量、
 * 一次用户手势解锁，但生命周期完全不同 —— BGM 是长期循环的单实例，
 * SFX 是短促的一次性触发。
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

/* ---------------------------------- SFX（A03） ---------------------------------- */

/**
 * SFX 键。
 *
 * `public/audio/sfx/` 下有五个文件，运行时只用其中四个：
 * `sfx-ending-reveal.mp3` 在 A03 试玩修订里被取消（素材偏欢快，与结局情绪不符），
 * 文件与授权记录保留为预留素材，但不再有运行时键与配置 ——
 * 留一个永远不会被调用的键只会变成死代码。见 docs/05-assets-map.md §7。
 */
export type SfxKey = 'click_soft' | 'choice_select' | 'text_type' | 'warning_soft'

/**
 * 一个短音效的运行时定义。
 *
 * 除了资源与音量，还包含实例策略：五个素材的长度、响度和触发频率差别很大
 * （从 82ms 的轻点到 8 秒的连续打字），一套统一参数无法同时做到
 * 「快速点击不叠成噪声」和「打字声足够稀疏」。这些参数全部集中在
 * src/data/audioTracks.ts，页面与事件处理器里不出现任何魔法数字。
 */
export type SfxTrack = {
  key: SfxKey
  /** 适配 Vite base 的公开资源路径。 */
  src: string
  /**
   * 音效自身增益，最终音量 = 主音量 × gain，写入前再夹到 [0, 1]。
   *
   * 与 BGM 的 gain 含义一致：把响度不同的素材拉平到设计目标，
   * 不是「这个音效更重要」的表达手段。因此 gain 数值之间不能直接比听感，
   * 要看 referenceRmsDb 与 gain 一起算出来的播放响度。
   */
  gain: number
  /**
   * 素材有效发声段的实测 RMS（dBFS）。
   *
   * 用浏览器的 decodeAudioData 实测得到，只用于音量平衡与测试断言，
   * 运行时不参与播放。有了它，「听感排序」才有可验证的依据，
   * 而不是靠一串没有说明的 gain 数字。
   */
  referenceRmsDb: number
  /** 同一个音效最多允许几个实例同时发声。 */
  maxConcurrent: number
  /** 两次触发之间的最小间隔，用来吃掉快速重复事件。 */
  minIntervalMs: number
  /**
   * 播放这么久之后主动停止。
   *
   * 素材尾部的静音或多余内容没必要占着实例，也不该拖进下一次触发；
   * 打字声更是只取素材里的一次击键，靠这个值截断。
   */
  maxDurationMs: number
  /** true：已经在播时忽略新的触发，既不重叠也不重启（警告与结局揭示）。 */
  exclusive: boolean
  /**
   * 每次播放的起始偏移（秒），按顺序循环取用；空数组表示总是从头播放。
   *
   * 只有打字声需要：素材是一段 8 秒的连续打字，开头 450ms 是静音，
   * 从 0 播放什么都听不到。这里给的是实测的击键起音点。
   */
  startOffsets: readonly number[]
  /** 调试与文档用的中文说明，不显示在界面上。 */
  description: string
}
