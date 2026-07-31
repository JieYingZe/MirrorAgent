import { describe, expect, it } from 'vitest'
import type { BgmScene, BgmTrackKey } from '../src/types/audio'
import {
  CHAPTER_BGM_TRACKS,
  NODE_BGM_OVERRIDES,
  resolveBgmTrack,
} from '../src/utils/audio/bgmScene'
import { BGM_TRACK_KEYS, DEFAULT_MASTER_VOLUME, getBgmTrack } from '../src/data/audioTracks'
import { joinPublicPath } from '../src/utils/audio/audioPaths'
import { nodeIndex, storyChapters, storyManifest } from '../src/data/story'

/**
 * BGM 场景解析（A02）。
 *
 * 关键约束：切换边界与 docs/05-assets-map.md §6.2 的节点 ID 完全一致、
 * 同一首曲目对应的节点跳转解析结果不变（因此播放器不会重启曲目）、
 * 剧情里每一个节点都有明确曲目、映射表不会漏掉任何章节。
 */

function gameScene(nodeId: string): BgmScene {
  const node = nodeIndex.get(nodeId)

  if (!node) throw new Error(`测试引用了不存在的节点：${nodeId}`)

  return { surface: 'game', nodeId: node.id, chapterId: node.chapterId }
}

function trackAt(nodeId: string): BgmTrackKey | null {
  return resolveBgmTrack(gameScene(nodeId))
}

/** 章节内的节点声明顺序，就是玩家在这一章里会经过的顺序范围。 */
function chapterNodeIds(chapterId: string): string[] {
  const chapter = storyChapters.find((item) => item.id === chapterId)

  if (!chapter) throw new Error(`找不到章节：${chapterId}`)

  return Object.values(chapter.nodes).map((node) => node.id)
}

/** 相邻两项不同才算一次换曲；这正是播放器判断「要不要重建实例」的依据。 */
function countTrackSwitches(tracks: Array<BgmTrackKey | null>): number {
  let switches = 0

  for (let index = 1; index < tracks.length; index += 1) {
    if (tracks[index] !== tracks[index - 1]) switches += 1
  }

  return switches
}

describe('页面级映射', () => {
  it('StartupGate 点击进入实验后的开始页是主旋律', () => {
    expect(resolveBgmTrack({ surface: 'start' })).toBe('main_theme')
  })

  it('结局页是结局曲', () => {
    expect(resolveBgmTrack({ surface: 'ending' })).toBe('ending')
  })

  it('数据错误页安静，不放任何曲目', () => {
    expect(resolveBgmTrack({ surface: 'error' })).toBeNull()
  })
})

describe('docs/05 §6.2 的切换边界', () => {
  const boundaries: Array<[string, BgmTrackKey]> = [
    ['prologue.initialization', 'main_theme'],
    ['ch1.three_lists', 'game_ambient'],
    ['ch4.protection_protocol', 'control_mode'],
    ['ch5.permanent_request', 'game_ambient'],
    ['ch5.final_record', 'ending'],
    ['ch5.final_confirmation', 'ending'],
    ['ch5.ending_gate', 'ending'],
  ]

  for (const [nodeId, expected] of boundaries) {
    it(`${nodeId} → ${expected}`, () => {
      expect(trackAt(nodeId)).toBe(expected)
    })
  }

  it('开始页 → 序章不换曲', () => {
    expect(trackAt('prologue.initialization')).toBe(resolveBgmTrack({ surface: 'start' }))
  })

  it('第五章后半 → 结局页不换曲（同一个实例继续播）', () => {
    expect(trackAt('ch5.ending_gate')).toBe(resolveBgmTrack({ surface: 'ending' }))
  })
})

describe('同一首曲目的节点跳转不切换', () => {
  const sameTrackChapters: Array<[string, BgmTrackKey]> = [
    ['prologue', 'main_theme'],
    ['chapter_1', 'game_ambient'],
    ['chapter_2', 'game_ambient'],
    ['chapter_3', 'game_ambient'],
    ['chapter_4', 'control_mode'],
  ]

  for (const [chapterId, expected] of sameTrackChapters) {
    it(`${chapterId} 全章只有一首 ${expected}`, () => {
      const tracks = chapterNodeIds(chapterId).map((nodeId) => trackAt(nodeId))

      expect(new Set(tracks)).toEqual(new Set([expected]))
      expect(countTrackSwitches(tracks)).toBe(0)
    })
  }

  it('第一章到第三章之间跨章也不换曲', () => {
    const tracks = ['chapter_1', 'chapter_2', 'chapter_3']
      .flatMap((chapterId) => chapterNodeIds(chapterId))
      .map((nodeId) => trackAt(nodeId))

    expect(countTrackSwitches(tracks)).toBe(0)
  })

  it('分支节点与汇流节点解析结果一致（第四章分支后汇合）', () => {
    const branches = [
      'ch4.full_takeover_result',
      'ch4.delay_result',
      'ch4.warning_only_result',
      'ch4.immediate_action_result',
    ]

    for (const nodeId of branches) {
      expect(trackAt(nodeId)).toBe(trackAt('ch4.incident_merge'))
    }
  })
})

describe('第四章与第五章的边界', () => {
  it('第三章最后一个节点与第四章入口之间发生一次换曲', () => {
    const chapter3 = chapterNodeIds('chapter_3')
    const last = chapter3[chapter3.length - 1]

    expect(trackAt(last)).toBe('game_ambient')
    expect(trackAt('ch4.protection_protocol')).toBe('control_mode')
  })

  it('第四章最后一个节点与第五章入口之间切回常规氛围', () => {
    const chapter4 = chapterNodeIds('chapter_4')
    const last = chapter4[chapter4.length - 1]

    expect(trackAt(last)).toBe('control_mode')
    expect(trackAt('ch5.permanent_request')).toBe('game_ambient')
  })

  it('第五章前半全部是常规氛围', () => {
    const firstHalf = [
      'ch5.permanent_request',
      'ch5.action_module',
      'ch5.expression_module',
      'ch5.personality_module',
      'ch5.protection_module',
      'ch5.agent_summary',
      'ch5.agent_audit',
      'ch5.freedom_statement',
      'ch5.final_attitude',
    ]

    for (const nodeId of firstHalf) {
      expect(trackAt(nodeId)).toBe('game_ambient')
    }
  })

  it('第五章正好在 final_record 处换一次曲，后半不再变', () => {
    const tracks = chapterNodeIds('chapter_5').map((nodeId) => trackAt(nodeId))

    expect(countTrackSwitches(tracks)).toBe(1)
    expect(tracks[tracks.length - 1]).toBe('ending')
  })

  it('一次完整通关（开始页 → 全部节点 → 结局页）只换 4 次曲', () => {
    const tracks: Array<BgmTrackKey | null> = [
      resolveBgmTrack({ surface: 'start' }),
      ...storyChapters
        .flatMap((chapter) => Object.values(chapter.nodes))
        .map((node) => resolveBgmTrack({ surface: 'game', nodeId: node.id, chapterId: node.chapterId })),
      resolveBgmTrack({ surface: 'ending' }),
    ]

    // 序章→第一章、第三章→第四章、第四章→第五章前半、第五章前半→后半。
    expect(countTrackSwitches(tracks)).toBe(4)
  })
})

describe('映射表完整性', () => {
  it('manifest 里的每一个章节都有默认曲目', () => {
    for (const chapter of storyManifest.chapters) {
      expect(CHAPTER_BGM_TRACKS[chapter.id]).toBeDefined()
    }
  })

  it('映射表里没有 manifest 之外的章节', () => {
    const known = new Set(storyManifest.chapters.map((chapter) => chapter.id as string))

    for (const chapterId of Object.keys(CHAPTER_BGM_TRACKS)) {
      expect(known.has(chapterId)).toBe(true)
    }
  })

  it('节点级覆盖引用的节点都真实存在，且都属于第五章', () => {
    for (const nodeId of Object.keys(NODE_BGM_OVERRIDES)) {
      const node = nodeIndex.get(nodeId)

      expect(node).toBeDefined()
      expect(node?.chapterId).toBe('chapter_5')
    }
  })

  it('剧情里的每一个节点都能解析出一首曲目', () => {
    for (const node of nodeIndex.values()) {
      expect(
        resolveBgmTrack({ surface: 'game', nodeId: node.id, chapterId: node.chapterId }),
      ).not.toBeNull()
    }
  })

  it('未知章节返回 null，不会误放一首别的曲子', () => {
    expect(resolveBgmTrack({ surface: 'game', nodeId: 'x.unknown', chapterId: 'chapter_9' })).toBeNull()
  })

  it('解析用到的每一个曲目键都有音频资源，且默认主音量下的最终播放音量合法', () => {
    const used = new Set<BgmTrackKey>([
      ...Object.values(CHAPTER_BGM_TRACKS),
      ...Object.values(NODE_BGM_OVERRIDES),
      'main_theme',
      'ending',
    ])

    for (const key of used) {
      const track = getBgmTrack(key)

      expect(track.src).toContain('audio/bgm/')
      expect(track.gain).toBeGreaterThan(0)

      // gain 是相对增益，不是可播放音量：允许大于 1。
      // 真正的硬约束是「masterVolume × gain 不超过 HTMLAudioElement.volume 的合法范围」。
      const effectiveVolume = DEFAULT_MASTER_VOLUME * track.gain

      expect(effectiveVolume).toBeGreaterThan(0)
      expect(effectiveVolume).toBeLessThanOrEqual(1)
    }

    expect([...used].sort()).toEqual([...BGM_TRACK_KEYS].sort())
  })

  it('四个曲目键对应四个不同的文件', () => {
    const sources = BGM_TRACK_KEYS.map((key) => getBgmTrack(key).src)

    expect(new Set(sources).size).toBe(BGM_TRACK_KEYS.length)
  })
})

describe('音量配置', () => {
  /**
   * 四首曲目当前的轨道增益。
   *
   * 逐个写死期望值而不是只断言范围：`data/audioTracks.ts` 是唯一维护这些数字的地方，
   * 这里的作用是「谁改了它，测试立刻能看出改成了多少」，不是重新推导应该是多少。
   */
  const EXPECTED_GAIN: Record<BgmTrackKey, number> = {
    main_theme: 1.24,
    game_ambient: 0.812,
    control_mode: 1.2,
    ending: 1.4,
  }

  for (const key of BGM_TRACK_KEYS) {
    it(`${key} 的轨道增益是 ${EXPECTED_GAIN[key]}`, () => {
      expect(getBgmTrack(key).gain).toBeCloseTo(EXPECTED_GAIN[key], 2)
    })
  }

  it('默认主音量下，没有任何曲目的最终播放音量触及或超过上限 1.0', () => {
    for (const key of BGM_TRACK_KEYS) {
      const effectiveVolume = DEFAULT_MASTER_VOLUME * getBgmTrack(key).gain

      expect(effectiveVolume).toBeLessThan(1)
    }
  })

  it('game_ambient 的增益明显低于其余三首：原始素材已经足够响，不需要同等提升', () => {
    const ambientGain = getBgmTrack('game_ambient').gain

    for (const key of BGM_TRACK_KEYS) {
      if (key === 'game_ambient') continue

      expect(getBgmTrack(key).gain).toBeGreaterThan(ambientGain)
    }
  })
})

describe('公开资源路径', () => {
  it('根路径部署', () => {
    expect(joinPublicPath('/', 'audio/bgm/bgm-ending.mp3')).toBe('/audio/bgm/bgm-ending.mp3')
  })

  it('GitHub Pages 子路径部署', () => {
    expect(joinPublicPath('/MirrorAgent/', 'audio/bgm/bgm-ending.mp3')).toBe(
      '/MirrorAgent/audio/bgm/bgm-ending.mp3',
    )
  })

  it('base 少了结尾斜杠也能拼对', () => {
    expect(joinPublicPath('/MirrorAgent', 'audio/bgm/bgm-ending.mp3')).toBe(
      '/MirrorAgent/audio/bgm/bgm-ending.mp3',
    )
  })

  it('资源路径带开头斜杠不会拼出双斜杠', () => {
    expect(joinPublicPath('/MirrorAgent/', '/audio/bgm/bgm-ending.mp3')).toBe(
      '/MirrorAgent/audio/bgm/bgm-ending.mp3',
    )
  })

  it('空 base 退回根路径', () => {
    expect(joinPublicPath('', 'audio/bgm/bgm-ending.mp3')).toBe('/audio/bgm/bgm-ending.mp3')
  })
})
