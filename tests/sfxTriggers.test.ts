import { describe, expect, it } from 'vitest'
import {
  CONTROL_WARNING_NODE_ID,
  createOneShotGate,
  shouldPlayControlWarning,
  stepOneShotGate,
} from '../src/utils/audio/sfxTriggers'
import { CHAPTER_BGM_TRACKS, NODE_BGM_OVERRIDES } from '../src/utils/audio/bgmScene'
import { SFX_KEYS } from '../src/data/audioTracks'
import { nodeIndex, storyChapters } from '../src/data/story'

/**
 * 一次性场景音效的触发判定（A03）。
 *
 * 第四章警告与结局揭示都是「进入场景时响一次」。这里用一个只认上升沿的闸门
 * 回放整轮游戏：节点序列、rerender、重新开始、从存档恢复全部走同一套纯函数，
 * 不需要渲染组件，也不依赖真实播放。
 */

/** 模拟一段渲染序列：每一项是这次渲染时 active 的值，返回触发了几次。 */
function countFires(actives: readonly boolean[]): number {
  let gate = createOneShotGate()
  let fires = 0

  for (const active of actives) {
    const result = stepOneShotGate(gate, active)

    gate = result.gate
    if (result.fire) fires += 1
  }

  return fires
}

/** 按节点序列回放第四章警告，`restoredNodeId` 表示本次会话是从哪里恢复的。 */
function warningFiresFor(nodeIds: readonly string[], restoredNodeId: string | null): number {
  return countFires(nodeIds.map((nodeId) => shouldPlayControlWarning(nodeId, restoredNodeId)))
}

const chapter4NodeIds = (() => {
  const chapter = storyChapters.find((item) => item.id === 'chapter_4')

  if (!chapter) throw new Error('找不到第四章')

  return Object.values(chapter.nodes).map((node) => node.id)
})()

describe('第四章警告：节点判定', () => {
  it('入口节点在剧情数据里真实存在', () => {
    expect(nodeIndex.has(CONTROL_WARNING_NODE_ID)).toBe(true)
    expect(nodeIndex.get(CONTROL_WARNING_NODE_ID)?.chapterId).toBe('chapter_4')
  })

  it('与 control_mode BGM 的切入边界是同一个节点', () => {
    // 警告音与失控模式 BGM 在同一刻开始，玩家听到的是一次完整的场景切换。
    expect(CHAPTER_BGM_TRACKS.chapter_4).toBe('control_mode')
    expect(NODE_BGM_OVERRIDES[CONTROL_WARNING_NODE_ID]).toBeUndefined()
  })

  it('只有入口节点算「进入警告场景」', () => {
    expect(shouldPlayControlWarning(CONTROL_WARNING_NODE_ID, null)).toBe(true)

    for (const nodeId of chapter4NodeIds) {
      if (nodeId === CONTROL_WARNING_NODE_ID) continue
      expect(shouldPlayControlWarning(nodeId, null)).toBe(false)
    }
  })

  it('第三章与第五章的节点都不触发', () => {
    for (const chapterId of ['chapter_3', 'chapter_5']) {
      const chapter = storyChapters.find((item) => item.id === chapterId)

      if (!chapter) throw new Error(`找不到章节：${chapterId}`)

      for (const node of Object.values(chapter.nodes)) {
        expect(shouldPlayControlWarning(node.id, null)).toBe(false)
      }
    }
  })
})

describe('第四章警告：一次性语义', () => {
  it('同一个节点的重复 rerender 不重复播放', () => {
    // 状态面板更新、打字揭示、自动播放切换都会让 App 重新渲染。
    const renders = new Array(30).fill(CONTROL_WARNING_NODE_ID)

    expect(warningFiresFor(renders, null)).toBe(1)
  })

  it('Strict Mode 式的重复 effect 执行只触发一次', () => {
    // 同一次挂载里 effect 跑两遍，闸门存在 ref 里，第二次看到的是「已经响过」。
    expect(countFires([true, true])).toBe(1)
  })

  it('同一 control 场景内的后续普通节点不重复播放', () => {
    const walk = [CONTROL_WARNING_NODE_ID, CONTROL_WARNING_NODE_ID, ...chapter4NodeIds]

    expect(warningFiresFor(walk, null)).toBe(1)
  })

  it('进入第五章后这一场景的一次性语义结束', () => {
    const chapter5 = storyChapters.find((item) => item.id === 'chapter_5')

    if (!chapter5) throw new Error('找不到第五章')

    const walk = [
      CONTROL_WARNING_NODE_ID,
      ...chapter4NodeIds,
      ...Object.values(chapter5.nodes).map((node) => node.id),
    ]

    expect(warningFiresFor(walk, null)).toBe(1)
  })

  it('重新初始化后再次真实进入第四章可以重新播放', () => {
    // 一轮：进第四章 → 走完 → 重新初始化回序章 → 第二轮再次进第四章。
    const walk = [
      CONTROL_WARNING_NODE_ID,
      'ch4.immediate_action',
      'prologue.initialization',
      'ch1.three_lists',
      CONTROL_WARNING_NODE_ID,
    ]

    expect(warningFiresFor(walk, null)).toBe(2)
  })
})

describe('第四章警告：从存档恢复', () => {
  it('刷新后恢复到入口节点时不播放', () => {
    // 恢复存档的玩家并没有「进入」警告场景，他本来就在里面；
    // 何况在这个节点上每刷新一次就惊一次，属于重复惊扰。
    expect(shouldPlayControlWarning(CONTROL_WARNING_NODE_ID, CONTROL_WARNING_NODE_ID)).toBe(false)
    expect(warningFiresFor(new Array(10).fill(CONTROL_WARNING_NODE_ID), CONTROL_WARNING_NODE_ID)).toBe(0)
  })

  it('恢复到第四章其他节点后不会倒回来补一次警告', () => {
    const walk = ['ch4.incident_merge', 'ch4.audit_conclusion', 'ch5.permanent_request']

    expect(warningFiresFor(walk, 'ch4.incident_merge')).toBe(0)
  })

  it('恢复到第三章后正常走进第四章时照常播放一次', () => {
    const walk = ['ch3.three_days_later', CONTROL_WARNING_NODE_ID, CONTROL_WARNING_NODE_ID]

    expect(warningFiresFor(walk, 'ch3.three_days_later')).toBe(1)
  })
})

/*
  A03 试玩修订：取消结局揭示音效。

  素材偏欢快，与结局的沉重／释然／困惑不符。结局现在只保留一直在播的
  bgm-ending 与页面自身的视觉过渡，运行时不再有任何结局相关的 SFX 触发。
*/
describe('结局页不再有任何 SFX 触发', () => {
  it('运行时音效清单里没有结局揭示', () => {
    expect(SFX_KEYS as string[]).not.toContain('ending_reveal')
    expect(SFX_KEYS.every((key) => !String(key).includes('ending'))).toBe(true)
  })

  it('一次完整通关只剩第四章入口一个一次性场景音效', () => {
    /*
      回放一整轮的场景序列：第三章 → 第四章入口 → 第四章内部 → 第五章 → 结局页。
      结局页在这里用 null 表示（不是剧情节点），它不参与任何场景判定，
      因此整轮下来一次性音效只会触发一次 —— 就是第四章那一声 warning。
    */
    const chapter5 = storyChapters.find((item) => item.id === 'chapter_5')

    if (!chapter5) throw new Error('找不到第五章')

    const walk: Array<string | null> = [
      'ch3.three_days_later',
      CONTROL_WARNING_NODE_ID,
      ...chapter4NodeIds,
      ...Object.values(chapter5.nodes).map((node) => node.id),
      // 结局页：反复 rerender、展开报告、路径回声更新都不产生任何场景。
      null,
      null,
      null,
      null,
    ]

    const fires = countFires(
      walk.map((nodeId) => (nodeId === null ? false : shouldPlayControlWarning(nodeId, null))),
    )

    expect(fires).toBe(1)
  })

  it('从已完成存档恢复到结局页同样不触发任何场景音效', () => {
    // 结局页没有剧情节点，场景判定恒为 false，闸门永远不会被点着。
    expect(countFires([false, false, false, false])).toBe(0)
  })
})

describe('一次性闸门本身', () => {
  it('active 为 false 时保持装填状态，不会反复重建', () => {
    const gate = createOneShotGate()
    const first = stepOneShotGate(gate, false)

    // 没触发过就一直是同一个对象，不制造无谓的引用变化。
    expect(first.gate).toBe(gate)
    expect(first.fire).toBe(false)
  })

  it('触发后离开场景会重新装填，再进入可以再响一次', () => {
    expect(countFires([true, true, false, false, true, true])).toBe(2)
  })
})
