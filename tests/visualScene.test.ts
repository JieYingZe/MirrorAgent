import { describe, expect, it } from 'vitest'
import { chapterMetaList } from '../src/data/story'
import { getStoryNode } from '../src/utils/story'
import { IMAGE_SCENE_KEYS, isImageSceneKey, resolveSceneKey } from '../src/utils/visualScene'

/**
 * 视觉场景解析（V02）。
 *
 * 这里只测「什么时候换背景」这一个判断点：解析函数是纯函数，
 * 不 import 图片资源，因此测试不依赖打包器处理 webp。
 */

describe('resolveSceneKey', () => {
  it('开始页固定落在 start', () => {
    expect(resolveSceneKey('start')).toBe('start')
    // 传入无关的 backgroundKey 也不影响开始页。
    expect(resolveSceneKey('start', 'control')).toBe('start')
  })

  it('结局页固定落在 ending', () => {
    expect(resolveSceneKey('ending')).toBe('ending')
  })

  it('错误页只用渐变兜底', () => {
    expect(resolveSceneKey('error')).toBe('fallback')
    expect(resolveSceneKey('error', 'efficiency')).toBe('fallback')
  })

  it('剧情页消费章节级 backgroundKey', () => {
    expect(resolveSceneKey('game', 'prologue')).toBe('prologue')
    expect(resolveSceneKey('game', 'efficiency')).toBe('efficiency')
    expect(resolveSceneKey('game', 'relationship')).toBe('relationship')
    expect(resolveSceneKey('game', 'perfect_self')).toBe('perfect_self')
    expect(resolveSceneKey('game', 'control')).toBe('control')
    expect(resolveSceneKey('game', 'ending')).toBe('ending')
  })

  it('未知或缺失的 backgroundKey 退回渐变，不显示破图', () => {
    expect(resolveSceneKey('game', 'not_a_scene')).toBe('fallback')
    expect(resolveSceneKey('game', undefined)).toBe('fallback')
    expect(resolveSceneKey('game', '')).toBe('fallback')
  })

  it('manifest 里每个章节的 backgroundKey 都有对应场景', () => {
    for (const chapter of chapterMetaList) {
      expect(isImageSceneKey(chapter.backgroundKey)).toBe(true)
      expect(resolveSceneKey('game', chapter.backgroundKey)).toBe(chapter.backgroundKey)
    }
  })

  it('开始页与序章之间要换图：start → prologue', () => {
    const prologue = chapterMetaList.find((chapter) => chapter.id === 'prologue')

    expect(prologue).toBeDefined()
    expect(prologue?.backgroundKey).toBe('prologue')
    expect(resolveSceneKey('game', prologue?.backgroundKey)).toBe('prologue')
    expect(resolveSceneKey('game', prologue?.backgroundKey)).not.toBe(resolveSceneKey('start'))
  })

  it('序章与第一章之间要换图：prologue → efficiency', () => {
    const prologue = chapterMetaList.find((chapter) => chapter.id === 'prologue')
    const chapter1 = chapterMetaList.find((chapter) => chapter.id === 'chapter_1')

    expect(resolveSceneKey('game', prologue?.backgroundKey)).toBe('prologue')
    expect(resolveSceneKey('game', chapter1?.backgroundKey)).toBe('efficiency')
  })

  it('从序章存档恢复时直接解析为 prologue，不经过 start', () => {
    // 恢复流程只有一个输入：存档里的 currentNodeId → 节点 → chapterId → 章节。
    const prologue = chapterMetaList.find((chapter) => chapter.id === 'prologue')
    const node = getStoryNode('prologue.initialization')

    expect(node?.chapterId).toBe('prologue')
    expect(resolveSceneKey('game', prologue?.backgroundKey)).toBe('prologue')
  })

  it('第五章与结局页之间不换图', () => {
    const chapter5 = chapterMetaList.find((chapter) => chapter.id === 'chapter_5')

    expect(chapter5).toBeDefined()
    expect(resolveSceneKey('game', chapter5?.backgroundKey)).toBe(resolveSceneKey('ending'))
  })

  it('六个章节的场景两两不同，只有第五章与结局共用 ending', () => {
    const keys = chapterMetaList.map((chapter) => chapter.backgroundKey)

    expect(keys).toEqual(['prologue', 'efficiency', 'relationship', 'perfect_self', 'control', 'ending'])
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('一次完整通关共出现七个视觉场景', () => {
    const walkthrough = [
      resolveSceneKey('start'),
      ...chapterMetaList.map((chapter) => resolveSceneKey('game', chapter.backgroundKey)),
      resolveSceneKey('ending'),
    ]

    expect(walkthrough).toEqual([
      'start',
      'prologue',
      'efficiency',
      'relationship',
      'perfect_self',
      'control',
      'ending',
      'ending',
    ])
    // 第五章与结局页共用 ending，所以唯一场景是 7 个。
    expect(new Set(walkthrough).size).toBe(7)
  })

  it('场景键集合与已知取值一致', () => {
    expect([...IMAGE_SCENE_KEYS]).toEqual([
      'start',
      'prologue',
      'efficiency',
      'relationship',
      'perfect_self',
      'control',
      'ending',
    ])
  })
})
