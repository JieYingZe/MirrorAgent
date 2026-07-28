import type { StoryManifest } from '../../types/story'

/**
 * 全局剧情清单：只保存章节级信息，不保存正文。
 *
 * 一个视觉章节可以包含多个剧情节点，页面顶部显示的是这里的章节标题，
 * 而不是节点 ID。backgroundKey / musicKey 只是资源键，接入留到 V02。
 */
export const storyManifest = {
  schemaVersion: 2,
  startNodeId: 'prologue.initialization',
  chapters: [
    {
      id: 'prologue',
      order: 0,
      title: '序章：创建你的代理',
      shortTitle: '创建你的代理',
      entryNodeId: 'prologue.initialization',
      backgroundKey: 'start',
      musicKey: 'main_theme',
    },
    {
      id: 'chapter_1',
      order: 1,
      title: '第一章：效率焦虑',
      shortTitle: '效率焦虑',
      entryNodeId: 'ch1.three_lists',
      backgroundKey: 'efficiency',
      musicKey: 'game_ambient',
    },
    {
      id: 'chapter_2',
      order: 2,
      title: '第二章：关系回声',
      shortTitle: '关系回声',
      entryNodeId: 'ch2.opening',
      backgroundKey: 'relationship',
      musicKey: 'game_ambient',
    },
    {
      id: 'chapter_3',
      order: 3,
      title: '第三章：完美版本',
      shortTitle: '完美版本',
      entryNodeId: 'ch3.opening',
      backgroundKey: 'perfect_self',
      musicKey: 'game_ambient',
    },
    {
      id: 'chapter_4',
      order: 4,
      title: '第四章：失控日志',
      shortTitle: '失控日志',
      entryNodeId: 'ch4.incident',
      backgroundKey: 'control',
      musicKey: 'tension',
    },
    {
      id: 'chapter_5',
      order: 5,
      title: '第五章：关闭确认',
      shortTitle: '关闭确认',
      entryNodeId: 'ch5.audit',
      backgroundKey: 'ending',
      musicKey: 'ending_theme',
    },
  ],
} satisfies StoryManifest
