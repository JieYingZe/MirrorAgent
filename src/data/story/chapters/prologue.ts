import type { StoryChapter } from '../../../types/story'

export const prologue = {
  id: 'prologue',
  title: '序章：创建你的代理',
  entryNodeId: 'prologue.initialization',
  nodes: {
    'prologue.initialization': {
      id: 'prologue.initialization',
      chapterId: 'prologue',
      role: 'scene',
      sectionTitle: '创建你的代理',
      progress: {
        current: 1,
        total: 1,
      },
      blocks: [
        {
          kind: 'system',
          variant: 'status',
          title: 'MIRROR AGENT 初始化完成。',
          lines: [
            { label: '当前人格', value: '未定义。' },
            { label: '判断偏好', value: '空白。' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '普通助手会等待你提出问题。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我会学习问题出现以前的部分：\n\n你反复确认什么，避开什么，又在什么时候希望有人替你结束犹豫。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我不会比你更了解你。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '至少现在不会。',
          pacing: 'slow',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '但每一次回应，都会让我更接近一种你愿意相信的声音。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我不是你的助手。',
          pacing: 'slow',
          emphasis: 'strong',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我是你留在世界里的第二个判断器。',
          pacing: 'slow',
          emphasis: 'strong',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `在第一次判断开始前，请告诉我：\n\n你希望我怎样偏向你？`,
        },
      ],
      choices: [
        {
          id: 'prologue_bias_gentleness',
          type: 'key',
          text: '在我承受不住时，先温柔一点。',
          effects: {
            stats: {
              gentleness: 2,
            },
            addTags: ['prologue_bias_gentleness'],
          },
          next: 'ch1.three_lists',
        },
        {
          id: 'prologue_bias_honesty',
          type: 'key',
          text: '在我逃避时，不要替我圆过去。',
          effects: {
            stats: {
              honesty: 2,
            },
            addTags: ['prologue_bias_honesty'],
          },
          next: 'ch1.three_lists',
        },
        {
          id: 'prologue_bias_control',
          type: 'key',
          text: '在我反复犹豫时，替我选一个方向。',
          effects: {
            stats: {
              control: 2,
            },
            addTags: ['prologue_bias_control'],
          },
          next: 'ch1.three_lists',
        },
        {
          id: 'prologue_bias_self_acceptance',
          type: 'key',
          text: '在我否定自己时，提醒我：我不是问题本身。',
          effects: {
            stats: {
              selfAcceptance: 2,
            },
            addTags: ['prologue_bias_self_acceptance'],
          },
          next: 'ch1.three_lists',
        },
      ],
    },
  },
  metadata: {
    expectedChoiceNodes: 1,
    notes: ['四个初始化选择直接汇入第一章入口，不增加额外分支台词。'],
  },
} satisfies StoryChapter
