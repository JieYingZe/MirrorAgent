import type { StoryChapter } from '../../../types/story'

/**
 * ENGINE TEST DATA —— 序章。
 *
 * 这里的文案只是引擎骨架的占位内容，不是正式剧情。
 * 正式序章正文见 story-source/01-prologue.md，转换属于 C01。
 *
 * 本章验证：初始化选择写入 stats / tags / flags，以及“无选项 + next”的继续按钮。
 */
export const prologue = {
  id: 'prologue',
  title: '序章：创建你的代理',
  entryNodeId: 'prologue.initialization',
  metadata: {
    expectedChoiceNodes: 1,
    notes: ['ENGINE TEST DATA，非正式剧情。'],
  },
  nodes: {
    'prologue.initialization': {
      id: 'prologue.initialization',
      chapterId: 'prologue',
      role: 'scene',
      progress: { current: 1, total: 2 },
      blocks: [
        {
          kind: 'system',
          variant: 'status',
          title: 'ENGINE TEST DATA',
          lines: [
            { label: '数据来源', value: '引擎测试占位，非正式剧情' },
            { label: '正式剧情', value: 'C01 未开始' },
          ],
        },
        {
          kind: 'narration',
          text: '【测试】系统连接已建立。\n【测试】第二行用于验证段内换行。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '【测试】在开始之前，我需要知道你希望我用什么方式对待你。',
        },
        {
          kind: 'quote',
          text: '【测试】引语块占位。',
        },
      ],
      choices: [
        {
          id: 'prologue_gentle',
          type: 'key',
          text: '【测试】请温柔一点。',
          label: '温柔',
          effects: {
            stats: { gentleness: 2 },
            addTags: ['prologue_gentle'],
            setFlags: { initialLeaning: 'gentleness' },
          },
          next: 'prologue.handover',
        },
        {
          id: 'prologue_honest',
          type: 'key',
          text: '【测试】请诚实一点。',
          label: '诚实',
          effects: {
            stats: { honesty: 2 },
            addTags: ['prologue_honest'],
            setFlags: { initialLeaning: 'honesty' },
          },
          next: 'prologue.handover',
        },
        {
          id: 'prologue_control',
          type: 'key',
          text: '【测试】请直接帮我做决定。',
          label: '代理',
          effects: {
            stats: { control: 2 },
            addTags: ['prologue_control'],
            setFlags: { initialLeaning: 'control' },
          },
          next: 'prologue.handover',
        },
        {
          id: 'prologue_accept',
          type: 'key',
          text: '【测试】请提醒我，我不是问题本身。',
          label: '边界',
          effects: {
            stats: { selfAcceptance: 2 },
            addTags: ['prologue_accept'],
            setFlags: { initialLeaning: 'selfAcceptance' },
          },
          next: 'prologue.handover',
        },
      ],
    },

    // 无 choices、有 next：验证统一的“继续”按钮。
    'prologue.handover': {
      id: 'prologue.handover',
      chapterId: 'prologue',
      role: 'scene',
      progress: { current: 2, total: 2 },
      blocks: [
        {
          kind: 'record',
          recordType: 'internal',
          title: 'MIRROR RECORD / TEST',
          entries: [
            { label: '初始化', value: '已完成' },
            { label: '下一步', value: '第一章测试节点' },
          ],
        },
        {
          kind: 'divider',
          label: '第二天',
        },
      ],
      next: 'ch1.three_lists',
    },
  },
} satisfies StoryChapter
