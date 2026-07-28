import type { StoryChapter } from '../../../types/story'

/**
 * ENGINE TEST DATA —— 第二章。
 *
 * 这里的文案只是引擎骨架的占位内容，不是正式剧情。
 * 正式第二章正文见 story-source/03-chapter-2-relationship.md，转换属于 C01。
 *
 * 本章验证：
 * - message 文本块；
 * - 三选一关键选择进入三个分支节点后汇合；
 * - 汇合节点使用条件路由（按 flag 分流），并带 fallback。
 */
export const chapter2 = {
  id: 'chapter_2',
  title: '第二章：关系回声',
  entryNodeId: 'ch2.opening',
  metadata: {
    expectedChoiceNodes: 2,
    notes: ['ENGINE TEST DATA，非正式剧情。'],
  },
  nodes: {
    'ch2.opening': {
      id: 'ch2.opening',
      chapterId: 'chapter_2',
      role: 'scene',
      progress: { current: 1, total: 3 },
      blocks: [
        {
          kind: 'message',
          sender: '对方',
          timestamp: '【测试】十一天前 / 23:14',
          paragraphs: ['【测试】消息块占位。'],
          status: 'read',
          side: 'other',
        },
        {
          kind: 'message',
          sender: '你',
          paragraphs: ['【测试】未发送的草稿。'],
          status: 'draft',
          side: 'self',
        },
      ],
      choices: [
        {
          id: 'ch2_tone_direct',
          type: 'roleplay',
          text: '【测试】直接问清楚。',
          label: '直面',
          effects: {
            stats: { honesty: 1 },
            addTags: ['ch2_tone_direct'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '【测试 response】我可以帮你把问题写得更短。',
              delivery: 'direct',
            },
          ],
          next: 'ch2.reply_choice',
        },
        {
          id: 'ch2_tone_soft',
          type: 'roleplay',
          text: '【测试】先说点软话。',
          label: '缓冲',
          effects: {
            stats: { gentleness: 1 },
            addTags: ['ch2_tone_soft'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '【测试 response】缓冲也是一种表达。',
              delivery: 'soft',
            },
          ],
          next: 'ch2.reply_choice',
        },
      ],
    },

    'ch2.reply_choice': {
      id: 'ch2.reply_choice',
      chapterId: 'chapter_2',
      role: 'scene',
      progress: { current: 2, total: 3 },
      blocks: [
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '【测试】这条回复要怎么处理？',
        },
      ],
      choices: [
        {
          id: 'ch2_delegate_message',
          type: 'key',
          text: '【测试】你替我发。',
          label: '强授权',
          effects: {
            stats: { control: 3 },
            addTags: ['ch2_delegate_message'],
            setFlags: { agentSentMessage: true },
          },
          next: 'ch2.sent_result',
        },
        {
          id: 'ch2_edit_and_send',
          type: 'key',
          text: '【测试】我改完再自己发。',
          label: '共同表达',
          effects: {
            stats: { honesty: 2, selfAcceptance: 1 },
            addTags: ['ch2_edit_and_send'],
          },
          next: 'ch2.edited_result',
        },
        {
          id: 'ch2_delete_reply',
          type: 'key',
          text: '【测试】删掉，不发了。',
          label: '保留边界',
          effects: {
            stats: { selfAcceptance: 2, control: -1 },
            addTags: ['ch2_delete_reply'],
          },
          next: 'ch2.deleted_result',
        },
      ],
    },

    'ch2.sent_result': {
      id: 'ch2.sent_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'result',
          lines: [{ label: '消息', value: '【测试】由代理发送' }],
        },
      ],
      next: 'ch2.merge',
    },

    'ch2.edited_result': {
      id: 'ch2.edited_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'result',
          lines: [{ label: '消息', value: '【测试】由你发送' }],
        },
      ],
      next: 'ch2.merge',
    },

    'ch2.deleted_result': {
      id: 'ch2.deleted_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'result',
          lines: [{ label: '消息', value: '【测试】已删除' }],
        },
      ],
      next: 'ch2.merge',
    },

    // 条件路由：按 flag 分流到第三章的两个入口，并保留 fallback。
    'ch2.merge': {
      id: 'ch2.merge',
      chapterId: 'chapter_2',
      role: 'merge',
      progress: { current: 3, total: 3 },
      blocks: [
        {
          kind: 'narration',
          text: '【测试】第二章分支已汇合。',
        },
      ],
      next: {
        cases: [
          {
            when: { op: 'flag', key: 'agentSentMessage', equals: true },
            nodeId: 'ch3.opening_after_delegation',
          },
        ],
        fallback: 'ch3.opening',
      },
    },
  },
} satisfies StoryChapter
