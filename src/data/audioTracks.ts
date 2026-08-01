import type { BgmTrack, BgmTrackKey, SfxKey, SfxTrack } from '../types/audio'
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

/* -------------------------------------------------------------------------- */
/*                                 SFX（A03）                                  */
/* -------------------------------------------------------------------------- */

/**
 * SFX 资源、音量与实例策略。
 *
 * 与 BGM 共用同一个主音量与同一个静音状态，音量组合关系也完全一样：
 *
 *     最终音量 = clamp(masterVolume × gain, 0, 1)
 *
 * SFX 没有淡入淡出，因此没有第三层系数；播放器（utils/audio/sfxPlayer.ts）
 * 在写入 HTMLAudioElement.volume 之前统一夹取，masterVolume 是 NaN 或越界时也安全。
 *
 * ## 音量是怎么定的
 *
 * 素材的原始响度差了 20 dB 以上，直接给相近的 gain 会得到完全不成比例的听感，
 * 因此先用浏览器 decodeAudioData 实测了每个素材「有效发声段」的 RMS，
 * 再倒推出各自的 gain，让播放响度落在设计目标上。同一批实测里的 BGM 播放响度是：
 *
 * | BGM | 播放 RMS |
 * |---|---|
 * | main_theme | −24.1 dBFS |
 * | game_ambient | −23.1 dBFS |
 * | control_mode | −27.5 dBFS |
 * | ending | −25.1 dBFS |
 *
 * SFX 的目标就是以这条 −23 至 −27.5 dB 的底噪为参照定的，不是沿用旧的经验值：
 *
 * | 音效 | 素材 RMS | gain | 主音量 0.5 时的音量 | 播放 RMS | 定位 |
 * |---|---|---|---|---|---|
 * | text_type | −32.4 | 0.66 | 0.330 | ≈ −42.0 | 远低于其余三种，只是一点点纸面感 |
 * | choice_select | −21.0 | 0.72 | 0.360 | ≈ −29.9 | 轻量的一次确认，不追求比 click 更响 |
 * | click_soft | −14.8 | 0.42 | 0.210 | ≈ −28.4 | 最清楚的操作反馈 |
 * | warning_soft | −16.4 | 0.84 | 0.420 | ≈ −23.9 | 明确可察觉，仍不越过最响 BGM 的响度 |
 *
 * 排序（轻 → 明显）：text_type ≪ choice_select < click_soft < warning_soft。
 * 这个顺序由 tests/sfxTracks.test.ts 按 referenceRmsDb + gain 复算断言，
 * 改任何一个 gain 都会被测试立刻发现。choice_select 在 2026-08-02 的音量微调后
 * 比 click_soft 更轻（此前一轮曾经反过来，见下面的「音量微调」）。
 *
 * 注意 gain 数字本身不可比：text_type 的 gain（0.66）比 choice_select（0.72）小，
 * 但它的素材安静得多，播放出来反而低 12 dB。
 *
 * ## A03 试玩修订（2026-08-01）
 *
 * - `click_soft` 0.28 → 0.36：试玩反馈普通点击偏小、常被 BGM 掩盖。
 * - `choice_select` 0.80 → 0.90，同时加上 `startOffsets: [0.24]`：
 *   当时的素材头部有 255ms 的数字静音，是「选择音慢半拍」的主因。
 * - `warning_soft` 0.66 → 0.84（+2.1 dB）：试玩反馈第四章入口的存在感不够。
 * - `ending_reveal` 整条删除：素材偏欢快，与结局的情绪不符，本版不再播放。
 *   文件与授权记录保留（见 credits/audio-credits.md 与 docs/05-assets-map.md §7），
 *   运行时不再有它的键与配置，避免留下永远不会被调用的死配置。
 * - `text_type` 一个字没动：试玩反馈略小，但提高后可能干扰长时间阅读。
 *
 * ## A03 小修复（2026-08-02）
 *
 * 试玩修订上线后又出了两个问题：
 *
 * 1. **`sfx-choice-select.mp3` 被手动裁剪并重新导出，点击选项完全没有声音。**
 *    真实原因：文件已经在本地被物理裁掉前置静音（新文件 45KB，原来是 74KB），
 *    但运行时配置仍然是针对旧文件写的 `startOffsets: [0.24]`。新文件的音头
 *    已经在最开头（实测 1%/10%/31% 峰值阈值的起音点都在 0–2ms 以内），
 *    继续从 0.24s 起播等于对着一个已经裁过的文件再裁一刀，播放的是
 *    「攻击段之后已经衰减到 −30 dB 左右的尾音」，而不是原本的确认声，
 *    在 masterVolume 0.5 的实际播放音量下几乎听不见 —— 这是「二次裁切」，
 *    不是解码失败、404 或播放被拒绝（浏览器端未观察到任何媒体错误）。
 *    修复：删除 `startOffsets`，改回从 `currentTime = 0` 起播；
 *    `maxDurationMs` 按新文件的有效发声段（实测到约 861ms）重新定为 900ms；
 *    `referenceRmsDb` 按新文件重新测量（−21.04 dB，与旧口径的 −21.12 dB
 *    几乎一致，因为裁掉的只是静音，音频内容本身没有变化，gain 不需要跟着调）。
 * 2. **`click_soft` 试玩后仍然偏小。** 0.36 → 0.42：
 *    0.44 会让 click 的播放响度（−27.99 dB）追平甚至压过 choice_select
 *    当时的响度（−27.98 dB），违反「choice 仍应比 click 更具确认感」；
 *    0.42 把 click 留在 choice 之下（−28.40 dB，约 0.42 dB 差距），
 *    是能满足这条约束的上限附近取值。这条约束后来被下面的音量微调放弃了。
 *
 * ## 音量微调（2026-08-02）
 *
 * `choice_select` 0.90 → 0.72（约 −2 dB）：试玩反馈选择音偏大。
 * 这一步之后 choice_select 的播放响度（≈ −29.9 dB）落到了 click_soft
 * （≈ −28.4 dB）之下，「choice 仍应比 click 更具确认感」这条此前的设计目标
 * 不再成立 —— 按实际听感调整优先于这条自设的排序约束，没有再联动调整
 * click 或其他音效的 gain。
 */

/** 同时发声的短音效上限。超过时先停掉最旧的一个，避免叠出音量峰值。 */
export const MAX_CONCURRENT_SFX = 4

const SFX_TRACKS: Record<SfxKey, SfxTrack> = {
  click_soft: {
    key: 'click_soft',
    src: publicAssetUrl('audio/sfx/sfx-click-soft.mp3'),
    // 素材接近满刻度（峰值 −0.06 dBFS），仍然需要大幅压低才够「轻」。
    // A03 试玩修订：0.28 → 0.36；小修复再提到 0.44 会追平 choice_select，
    // 因此定在 0.42（播放响度 −28.4 dB，仍留在 choice 的 −28.0 dB 之下）。
    gain: 0.42,
    referenceRmsDb: -14.84,
    // 单实例：快速连点是「停下重播」，不是叠加。
    maxConcurrent: 1,
    minIntervalMs: 55,
    // 起音在 23ms，有效发声只有 82ms，文件后面接近 1 秒全是静音。
    maxDurationMs: 220,
    exclusive: false,
    startOffsets: [],
    description: '普通按钮点击：极轻的一次触点反馈',
  },
  choice_select: {
    key: 'choice_select',
    src: publicAssetUrl('audio/sfx/sfx-choice-select.mp3'),
    // A03 试玩修订：0.80 → 0.90。小修复没有再动它（新文件裁掉的只是前置静音，
    // 音频内容本身没变，重新测量的 referenceRmsDb 与旧口径几乎一致，见下方）。
    // 音量微调（2026-08-02）：0.90 → 0.72（约 −2 dB），试玩反馈选择音偏大。
    gain: 0.72,
    /*
      A03 小修复：素材已经在本地重新导出，裁掉了原来约 255ms 的前置静音
      （文件从 74KB 变成 45KB）。这里的 −21.04 dB 是对着**新文件**从 0 到
      有效发声结束（约 861ms）重新测量的，取代了旧口径的 −21.12 dB
      （那是对着旧文件、从 0.24s 起算到 1.117s 测的）。两个数字几乎一样，
      因为裁掉的只是静音，不代表音频内容变了，因此 gain 不需要跟着调。
    */
    referenceRmsDb: -21.04,
    maxConcurrent: 1,
    // 一次有效选择只会触发一次，这里只是兜住重复事件。
    minIntervalMs: 200,
    /*
      A03 小修复：不再使用 startOffsets。

      旧文件前 255ms 是数字静音，因此配置了 startOffsets: [0.24] 跳过它。
      文件被手动重新导出、物理裁掉这段静音之后，音头已经在最开头
      （实测 1%/10%/31% 峰值阈值的起音点都在 0–2ms 以内，没有需要跳过的静音）。
      继续用旧的 0.24 偏移会在一个已经裁过的文件上再裁一刀，播放的是
      攻击段之后已经衰减到约 −30 dB 的尾音，在实际播放音量下几乎听不见 ——
      这正是「选择音效完全没有声音」的真实原因，不是解码失败或播放被拒绝。
      现在改回默认从 0 起播，与其余没有明显前置静音的音效（click / warning）一致。
    */
    // 新文件有效发声到约 0.861s 结束；留出余量后在这里截断，
    // 早于旧的 1200ms（当时是按含静音的旧文件估的），实例能更快复用。
    maxDurationMs: 900,
    exclusive: false,
    startOffsets: [],
    description: '剧情选项确认：从文件开头播放的即时确认音',
  },
  text_type: {
    key: 'text_type',
    src: publicAssetUrl('audio/sfx/sfx-text-type.mp3'),
    gain: 0.66,
    // 取下面四个起音点各 120ms 的实测平均值，不是整段 8 秒的平均值。
    referenceRmsDb: -32.4,
    // 允许少量重叠，让相邻两次击键的尾音自然衔接，但绝不无限并发。
    maxConcurrent: 3,
    // 硬下限；实际频率由 utils/audio/typingSfx.ts 的策略决定。
    minIntervalMs: 70,
    // 只取一次击键：素材是 8 秒连续打字，不截断会一直响下去。
    maxDurationMs: 110,
    exclusive: false,
    // 实测击键起音点（秒）。素材开头 450ms 是静音，从 0 播放听不到东西。
    startOffsets: [0.45, 1.17, 1.59, 1.77],
    description: '打字机揭示：按策略抽样的单次击键',
  },
  warning_soft: {
    key: 'warning_soft',
    src: publicAssetUrl('audio/sfx/sfx-warning-soft.mp3'),
    /*
      A03 试玩修订：0.66 → 0.84（约 +2.1 dB）。

      原来压到与 control_mode BGM 相当的存在感，试玩下来「几乎注意不到」，
      而这一声要表达的是「进入异常接管状态」，需要被察觉。
      提高后播放 RMS 约 −23.9 dB、峰值约 −10.8 dB，仍然低于最响的 BGM
      （game_ambient 播放峰值 −8.1 dB），因此是「明确可察觉」而不是惊吓。

      素材起音在 29ms，头部只有约 20ms 的极轻引入，不构成延迟，
      因此不需要 startOffset —— 48kHz 下一个 mp3 帧就有 24ms，
      为了 20ms 去 seek 反而可能削掉起音。
    */
    gain: 0.84,
    referenceRmsDb: -16.35,
    maxConcurrent: 1,
    minIntervalMs: 0,
    maxDurationMs: 1000,
    // 一次性语义：正在播时忽略新的触发，不重叠也不重启。
    exclusive: true,
    startOffsets: [],
    description: '第四章失控模式：进入警告场景时的一次提示',
  },
}

export function getSfxTrack(key: SfxKey): SfxTrack {
  return SFX_TRACKS[key]
}

/** 供测试与文档使用的完整清单，运行时不需要遍历。 */
export const SFX_KEYS = Object.keys(SFX_TRACKS) as SfxKey[]
