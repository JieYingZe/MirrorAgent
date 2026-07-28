import type { StoryChapter } from '../../../types/story'

/**
 * ENGINE TEST DATA —— 第三章。
 *
 * 这里的文案只是引擎骨架的占位内容，不是正式剧情。
 * 正式第三章正文见 story-source/04-chapter-3-perfect-self.md，转换属于 C01。
 *
 * 本章验证：条件路由的两个目标节点都能正常进入，并在同一节点汇合。
 */
export const chapter3 = {
  id: 'chapter_3',
  title: '第三章：完美版本',
  entryNodeId: 'ch3.opening',
  metadata: {
    expectedChoiceNodes: 1,
    notes: ['ENGINE TEST DATA，非正式剧情。'],
  },
  nodes: {
    'ch3.opening': {
      id: 'ch3.opening',
      chapterId: 'chapter_3',
      role: 'scene',
      progress: { current: 1, total: 2 },
      blocks: [
        {
          kind: 'document',
          documentType: 'profile',
          title: 'YOU_v2.0 / TEST',
          sections: [
            {
              heading: '模型摘要',
              lines: ['【测试】默认入口节点。', '【测试】条件路由 fallback 命中时进入这里。'],
            },
          ],
        },
      ],
      next: 'ch3.personality_choice',
    },

    'ch3.opening_after_delegation': {
      id: 'ch3.opening_after_delegation',
      chapterId: 'chapter_3',
      role: 'scene',
      progress: { current: 1, total: 2 },
      blocks: [
        {
          kind: 'document',
          documentType: 'profile',
          title: 'YOU_v2.0 / TEST (DELEGATED)',
          sections: [
            {
              heading: '模型摘要',
              lines: ['【测试】条件路由命中 flag 分支时进入这里。'],
            },
          ],
        },
        {
          kind: 'record',
          recordType: 'audit',
          when: { op: 'hasChoice', choiceId: 'ch2_delegate_message' },
          title: 'AUDIT / TEST',
          entries: [{ label: '数据来源', value: '【测试】代理代发记录' }],
        },
      ],
      next: 'ch3.personality_choice',
    },

    'ch3.personality_choice': {
      id: 'ch3.personality_choice',
      chapterId: 'chapter_3',
      role: 'merge',
      progress: { current: 2, total: 2 },
      blocks: [
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '【测试】要不要启用人格辅助？',
        },
      ],
      choices: [
        {
          id: 'ch3_delegate_real_interaction',
          type: 'key',
          text: '【测试】让模型替我完成一次真实互动。',
          label: '强授权',
          effects: {
            stats: { control: 2, selfAcceptance: -1 },
            addTags: ['ch3_delegate_real_interaction'],
          },
          next: 'ch4.incident',
        },
        {
          id: 'ch3_enable_full_personality_assist',
          type: 'key',
          text: '【测试】全面启用人格辅助。',
          label: '强授权',
          effects: {
            stats: { control: 2, gentleness: 1 },
            addTags: ['ch3_enable_full_personality_assist'],
            setFlags: { personalityAssist: 'full' },
          },
          next: 'ch4.incident',
        },
        {
          id: 'ch3_keep_model_offline',
          type: 'key',
          text: '【测试】只作对照，不启用。',
          label: '保留边界',
          effects: {
            stats: { selfAcceptance: 2, control: -1 },
            addTags: ['ch3_keep_model_offline'],
            setFlags: { personalityAssist: 'off' },
          },
          next: 'ch4.incident',
        },
      ],
    },
  },
} satisfies StoryChapter
