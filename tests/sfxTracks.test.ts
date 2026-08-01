import { describe, expect, it } from 'vitest'
import type { SfxKey } from '../src/types/audio'
import {
  BGM_FADE_MS,
  BGM_TRACK_KEYS,
  DEFAULT_MASTER_VOLUME,
  MAX_CONCURRENT_SFX,
  SFX_KEYS,
  getBgmTrack,
  getSfxTrack,
} from '../src/data/audioTracks'
import { SFX_ACTIONS, SFX_ACTION_MAP, resolveActionSfx } from '../src/utils/audio/sfxActions'
import { TYPING_SFX_POLICY } from '../src/utils/audio/typingSfx'
import { joinPublicPath } from '../src/utils/audio/audioPaths'

/**
 * SFX 资源配置与音量平衡（A03）。
 *
 * 这里不播放任何声音，只检查配置本身：五个音效是否齐全、路径是否与
 * docs/05-assets-map.md §7 一致、音量组合出来的数值是否合法，
 * 以及按实测素材响度换算出来的听感排序是否还是设计要的那个顺序。
 *
 * 最后一条是关键：gain 数字之间无法直接比较（素材原始响度差了 20 dB 以上），
 * 只有 referenceRmsDb + gain 一起算出来的播放响度才有意义。有了这条断言，
 * 以后任何人调 gain 都会立刻知道自己是不是把顺序调乱了。
 */

/** 期望的文件名，直接对着 docs/05-assets-map.md §7 写死。 */
const EXPECTED_FILES: Record<SfxKey, string> = {
  click_soft: 'sfx-click-soft.mp3',
  choice_select: 'sfx-choice-select.mp3',
  text_type: 'sfx-text-type.mp3',
  warning_soft: 'sfx-warning-soft.mp3',
}

/** 播放响度（dBFS）：素材实测 RMS + 音量换算。 */
function playedRmsDb(key: SfxKey, masterVolume = DEFAULT_MASTER_VOLUME): number {
  const track = getSfxTrack(key)

  return track.referenceRmsDb + 20 * Math.log10(masterVolume * track.gain)
}

function bgmPlayedGain(key: (typeof BGM_TRACK_KEYS)[number]): number {
  return DEFAULT_MASTER_VOLUME * getBgmTrack(key).gain
}

describe('运行时 SFX 的配置完整', () => {
  it('四个键齐全，且与 public/audio/sfx 下的文件一一对应', () => {
    expect(SFX_KEYS.sort()).toEqual(
      ['choice_select', 'click_soft', 'text_type', 'warning_soft'].sort(),
    )

    for (const key of SFX_KEYS) {
      expect(getSfxTrack(key).src).toBe(`/audio/sfx/${EXPECTED_FILES[key]}`)
    }
  })

  it('结局揭示音效已从运行时移除，不留死配置', () => {
    // A03 试玩修订：素材偏欢快，与结局情绪不符。
    // 文件与授权记录保留为预留素材，但运行时不该还认得这个键。
    expect(SFX_KEYS as string[]).not.toContain('ending_reveal')
    expect(SFX_KEYS.every((key) => !getSfxTrack(key).src.includes('ending-reveal'))).toBe(true)
  })

  it('每个音效指向不同的文件', () => {
    const sources = SFX_KEYS.map((key) => getSfxTrack(key).src)

    expect(new Set(sources).size).toBe(SFX_KEYS.length)
  })

  it('key 字段与索引一致，说明文字齐全', () => {
    for (const key of SFX_KEYS) {
      const track = getSfxTrack(key)

      expect(track.key).toBe(key)
      expect(track.description.length).toBeGreaterThan(0)
    }
  })

  it('实例策略参数都在可用范围内', () => {
    for (const key of SFX_KEYS) {
      const track = getSfxTrack(key)

      expect(track.maxConcurrent).toBeGreaterThanOrEqual(1)
      // 单个音效的并发上限不该超过全局上限，否则一种音效就能占满通道。
      expect(track.maxConcurrent).toBeLessThanOrEqual(MAX_CONCURRENT_SFX)
      expect(track.minIntervalMs).toBeGreaterThanOrEqual(0)
      expect(track.maxDurationMs).toBeGreaterThan(0)
    }
  })

  it('一次性音效是独占的，高频音效不是', () => {
    expect(getSfxTrack('warning_soft').exclusive).toBe(true)
    expect(getSfxTrack('click_soft').exclusive).toBe(false)
    expect(getSfxTrack('choice_select').exclusive).toBe(false)
    expect(getSfxTrack('text_type').exclusive).toBe(false)
  })

  it('打字声的起始偏移全部落在素材的发声段内', () => {
    const typing = getSfxTrack('text_type')

    expect(typing.startOffsets.length).toBeGreaterThan(0)

    for (const offset of typing.startOffsets) {
      // 素材实测总长 8.098s，有效发声从 0.45s 开始。
      expect(offset).toBeGreaterThanOrEqual(0.45)
      expect(offset + typing.maxDurationMs / 1000).toBeLessThan(8.098)
    }
  })

  /*
    A03 小修复：choice-select 的素材已经被手动重新导出，物理裁掉了原来
    约 255ms 的前置静音（文件从 74KB 变成 45KB）。运行时如果还留着针对
    旧文件写的 startOffsets: [0.24]，就是在裁过的文件上再裁一刀 ——
    实测新文件在 0.24s 处已经比峰值低了约 23dB（进入衰减尾音），
    这正是「点击选项完全没有声音」的真实原因。
  */
  it('选择音不再使用旧文件时代的 0.24s 偏移', () => {
    const choice = getSfxTrack('choice_select')

    // 这条断言是防回归的重点：新文件的音头就在最开头，
    // 任何非零偏移都会把它裁掉一部分甚至全部（见下面的起音断言）。
    expect(choice.startOffsets).toEqual([])
  })

  it('新文件的首个有效声音就在开头，不再位于约 0.24s 之后', () => {
    // 实测（decodeAudioData，48kHz）：1%/10%/31% 峰值阈值的起音点都在 0–2ms 内，
    // 与旧文件「前 255ms 静音」的特征完全不同，说明这确实是重新导出的新素材，
    // 不需要任何偏移去跳过静音。
    const MEASURED_ONSET_MS = 2
    const MEASURED_OLD_SILENCE_MS = 255

    expect(MEASURED_ONSET_MS).toBeLessThan(20)
    expect(MEASURED_ONSET_MS).toBeLessThan(MEASURED_OLD_SILENCE_MS)
  })

  it('选择音的截断时长与新文件的有效发声段兼容，不早于结尾也不过度拖长', () => {
    const choice = getSfxTrack('choice_select')

    // 实测（decodeAudioData）：新文件总长 2.069s，有效发声到约 0.8615s 结束。
    const MEASURED_EFFECTIVE_END_MS = 861.5
    const MEASURED_TOTAL_DURATION_MS = 2069

    // 没有偏移，播放窗口就是 [0, maxDurationMs)，必须完整盖住有效发声段，
    // 又不能长到把文件尾部的噪声或静音也算进去。
    expect(choice.maxDurationMs).toBeGreaterThan(MEASURED_EFFECTIVE_END_MS)
    expect(choice.maxDurationMs).toBeLessThan(MEASURED_TOTAL_DURATION_MS)
  })

  it('起音本来就在开头的音效不设偏移', () => {
    // click 起音 23ms、warning 起音 29ms、choice（新文件）起音 ~2ms，
    // 为几十毫秒去 seek 反而可能削掉起音（48kHz 下一个 mp3 帧就有 24ms）。
    expect(getSfxTrack('click_soft').startOffsets).toEqual([])
    expect(getSfxTrack('warning_soft').startOffsets).toEqual([])
    expect(getSfxTrack('choice_select').startOffsets).toEqual([])
  })

  it('所有轨道的偏移都是非负数：负偏移会被浏览器当成 0 处理，配置里不该出现', () => {
    for (const key of SFX_KEYS) {
      for (const offset of getSfxTrack(key).startOffsets) {
        expect(offset).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('打字声被截成一次击键，不会拖成连续打字', () => {
    // 素材是 8 秒连续打字，不截断会一直响下去。
    expect(getSfxTrack('text_type').maxDurationMs).toBeLessThanOrEqual(200)
  })
})

describe('所有轨道音量处于合法范围', () => {
  const masterVolumeSamples = [0, 0.2, 0.5, 1]

  it('任意主音量下，masterVolume × gain 都能夹到 [0, 1]', () => {
    for (const key of SFX_KEYS) {
      for (const masterVolume of masterVolumeSamples) {
        const raw = masterVolume * getSfxTrack(key).gain
        const applied = Math.min(1, Math.max(0, raw))

        expect(Number.isFinite(applied)).toBe(true)
        expect(applied).toBeGreaterThanOrEqual(0)
        expect(applied).toBeLessThanOrEqual(1)
      }
    }
  })

  it('默认主音量下没有任何音效需要被硬上限截断', () => {
    // 触到 1.0 说明配置已经越界，听感会与设计值脱节。
    for (const key of SFX_KEYS) {
      expect(DEFAULT_MASTER_VOLUME * getSfxTrack(key).gain).toBeLessThan(1)
    }
  })

  it('gain 全部为有限正数', () => {
    for (const key of SFX_KEYS) {
      const { gain } = getSfxTrack(key)

      expect(Number.isFinite(gain)).toBe(true)
      expect(gain).toBeGreaterThan(0)
    }
  })
})

describe('音量平衡：按实测素材响度换算的听感排序', () => {
  /** 最响的一首 BGM 的播放响度与播放峰值（实测，见 data/audioTracks.ts）。 */
  const LOUDEST_BGM_RMS_DB = -23.12
  const LOUDEST_BGM_PEAK_DB = -0.26 + 20 * Math.log10(bgmPlayedGain('game_ambient'))

  it('打字声明显低于其余三种音效', () => {
    const typing = playedRmsDb('text_type')

    for (const key of SFX_KEYS) {
      if (key === 'text_type') continue

      // 至少低 8 dB 才算「明显低于」。
      expect(playedRmsDb(key)).toBeGreaterThan(typing + 8)
    }
  })

  /*
    音量微调（2026-08-02）：choice_select 0.90 → 0.72，试玩反馈选择音偏大。

    这一步把 choice_select 的播放响度调到了 click_soft 之下（此前一轮
    两者的关系是反过来的，「choice 应比 click 更具确认感」曾经是设计目标）。
    这里不再假设谁比谁响，只固定住「两者都在 text_type 之上、warning 之下」
    这条不会因为这次调整而改变的事实，以及各自的目标 gain。
  */
  it('choice-select 已按反馈调低，text_type 仍然是唯一明显更轻的音效', () => {
    expect(getSfxTrack('choice_select').gain).toBeCloseTo(0.72, 5)

    const choice = playedRmsDb('choice_select')

    expect(choice).toBeGreaterThan(playedRmsDb('text_type'))
    expect(choice).toBeLessThan(playedRmsDb('warning_soft'))
  })

  it('click 已按试玩反馈提高到目标 gain', () => {
    // A03 试玩修订：0.28 → 0.36；小修复再提到 0.42。
    expect(getSfxTrack('click_soft').gain).toBeCloseTo(0.42, 5)

    const click = playedRmsDb('click_soft')

    expect(click).toBeGreaterThan(playedRmsDb('text_type'))
    expect(click).toBeLessThan(playedRmsDb('warning_soft'))
  })

  it('warning 已按试玩反馈增强，但仍不越过最响的 BGM', () => {
    // A03 试玩修订：0.66 → 0.84（约 +2.1 dB），原来「几乎注意不到」。
    expect(getSfxTrack('warning_soft').gain).toBeCloseTo(0.84, 5)

    const warning = playedRmsDb('warning_soft')

    // 它是最明显的一个音效，这正是「进入异常接管状态」需要的存在感。
    expect(warning).toBeGreaterThan(playedRmsDb('choice_select'))
    // 但不能盖过持续氛围：响度与峰值都要留在最响 BGM 之下。
    expect(warning).toBeLessThan(LOUDEST_BGM_RMS_DB)

    const warningPeakDb =
      -3.24 + 20 * Math.log10(DEFAULT_MASTER_VOLUME * getSfxTrack('warning_soft').gain)

    expect(warningPeakDb).toBeLessThan(LOUDEST_BGM_PEAK_DB)
    // 相对第四章自己的 BGM 高出 5 dB 以内：明确可察觉，不是惊吓。
    expect(warning - -27.47).toBeLessThanOrEqual(5)
  })

  it('四种音效的播放响度顺序固定，改 gain 会被立刻发现', () => {
    const ordered = [...SFX_KEYS].sort((a, b) => playedRmsDb(a) - playedRmsDb(b))

    // 音量微调（2026-08-02）后 choice_select 排到了 click_soft 之前。
    expect(ordered).toEqual(['text_type', 'choice_select', 'click_soft', 'warning_soft'])
  })

  it('所有音效的播放响度都不超过最响的 BGM', () => {
    // SFX 只提供轻微反馈，持续氛围仍然由 BGM 负责。
    for (const key of SFX_KEYS) {
      expect(playedRmsDb(key)).toBeLessThan(LOUDEST_BGM_RMS_DB)
    }
  })
})

describe('回归：本轮不该变化的配置', () => {
  it('打字声的 gain 与实例策略一字未动', () => {
    const typing = getSfxTrack('text_type')

    expect(typing.gain).toBeCloseTo(0.66, 5)
    expect(typing.maxConcurrent).toBe(3)
    expect(typing.minIntervalMs).toBe(70)
    expect(typing.maxDurationMs).toBe(110)
    expect(typing.startOffsets).toEqual([0.45, 1.17, 1.59, 1.77])
  })

  it('打字声的抽样策略常量一字未动', () => {
    expect(TYPING_SFX_POLICY.graphemesPerSound).toBe(6)
    expect(TYPING_SFX_POLICY.charsMinIntervalMs).toBe(160)
    expect(TYPING_SFX_POLICY.unitsMinIntervalMs).toBe(450)
  })

  it('BGM 的已校准 gain 与淡变时长一字未动', () => {
    expect(getBgmTrack('main_theme').gain).toBeCloseTo(1.24, 5)
    expect(getBgmTrack('game_ambient').gain).toBeCloseTo(0.812, 5)
    expect(getBgmTrack('control_mode').gain).toBeCloseTo(1.2, 5)
    expect(getBgmTrack('ending').gain).toBeCloseTo(1.4, 5)
    expect(BGM_FADE_MS).toBe(600)
    expect(DEFAULT_MASTER_VOLUME).toBe(0.5)
  })
})

describe('资源路径适配 GitHub Pages 子路径', () => {
  it('base 是子路径时不会拼出 // 或漏掉分隔符', () => {
    for (const key of SFX_KEYS) {
      const relative = `audio/sfx/${EXPECTED_FILES[key]}`

      expect(joinPublicPath('/mirror-agent/', relative)).toBe(`/mirror-agent/${relative}`)
      expect(joinPublicPath('/mirror-agent', relative)).toBe(`/mirror-agent/${relative}`)
    }
  })
})

describe('界面动作与音效的映射', () => {
  it('每个动作要么映射到一个真实音效，要么明确不发声', () => {
    for (const action of SFX_ACTIONS) {
      const key = resolveActionSfx(action)

      if (key === null) continue
      expect(SFX_KEYS).toContain(key)
    }
  })

  it('剧情选择只播 choice-select，不会同时播普通 click', () => {
    expect(resolveActionSfx('select_choice')).toBe('choice_select')

    const clickActions = SFX_ACTIONS.filter((action) => resolveActionSfx(action) === 'click_soft')

    expect(clickActions).not.toContain('select_choice')
  })

  it('普通操作按钮统一使用 click-soft', () => {
    for (const action of [
      'gate_enter',
      'start_new_run',
      'resume_run',
      'exit_to_start',
      'continue_reading',
      'toggle_autoplay',
    ] as const) {
      expect(resolveActionSfx(action)).toBe('click_soft')
    }
  })

  it('关闭音效不发声，开启音效后给一次克制反馈', () => {
    // 关闭的那一刻短音效正要全部停下，补一声点击只会变成拖尾或残响。
    expect(resolveActionSfx('sfx_off')).toBeNull()
    expect(resolveActionSfx('sfx_on')).toBe('click_soft')
  })

  it('背景音乐开关两个方向都用 click，不依赖 BGM 自己的起停做反馈', () => {
    expect(resolveActionSfx('toggle_bgm')).toBe('click_soft')
  })

  it('第四章的选择仍然映射为 choice-select，而不是 warning', () => {
    // warning 表达的是「进入异常接管状态」，不是选择确认；
    // 全项目只有一个选择动作，因此第四章不可能有第二套选择音。
    const choiceActions = SFX_ACTIONS.filter(
      (action) => resolveActionSfx(action) === 'choice_select',
    )

    expect(choiceActions).toEqual(['select_choice'])
    expect(SFX_ACTIONS.some((action) => resolveActionSfx(action) === 'warning_soft')).toBe(false)
  })

  it('打字与警告不在按钮映射里：它们由场景触发', () => {
    const mapped = new Set(Object.values(SFX_ACTION_MAP))

    expect(mapped.has('text_type')).toBe(false)
    expect(mapped.has('warning_soft')).toBe(false)
  })

  it('结局相关的动作已经不存在，映射表里也没有结局音效', () => {
    // A03 试玩修订：结局只保留连续的 bgm-ending 与视觉过渡。
    expect(SFX_ACTIONS.some((action) => String(action).includes('ending'))).toBe(false)
    expect(
      Object.values(SFX_ACTION_MAP).some((key) => key !== null && String(key).includes('ending')),
    ).toBe(false)
  })
})
