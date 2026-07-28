import type { StoryChapter } from '../../../types/story'

/**
 * ENGINE TEST DATA —— 第五章。
 *
 * 这里的文案只是引擎骨架的占位内容，不是正式剧情。
 * 正式第五章正文见 story-source/06-chapter-5-shutdown.md，转换属于 C01。
 *
 * 本章验证：
 * - 四个 final 选择写入 finalChoice，且不硬编码结局 ID；
 * - ending_gate 节点由玩家确认后调用统一结局判断。
 */
export const chapter5 = {
  id: 'chapter_5',
  title: '第五章：关闭确认',
  entryNodeId: 'ch5.audit',
  metadata: {
    expectedChoiceNodes: 1,
    notes: ['ENGINE TEST DATA，非正式剧情。'],
  },
  nodes: {
    'ch5.audit': {
      id: 'ch5.audit',
      chapterId: 'chapter_5',
      role: 'scene',
      progress: { current: 1, total: 3 },
      blocks: [
        {
          kind: 'document',
          documentType: 'proposal',
          title: 'PERMANENT AGENT PROPOSAL / TEST',
          sections: [
            {
              heading: '提案',
              lines: ['【测试】代理提案占位。'],
            },
          ],
        },
        {
          kind: 'document',
          documentType: 'report',
          when: {
            op: 'choiceCount',
            choiceIds: [
              'ch1_full_planning_authority',
              'ch2_delegate_message',
              'ch3_delegate_real_interaction',
              'ch3_enable_full_personality_assist',
              'ch4_full_emergency_takeover',
              'ch4_keep_full_protection',
            ],
            gte: 3,
          },
          title: 'DELEGATION SUMMARY / TEST',
          sections: [
            {
              heading: '强授权记录',
              lines: ['【测试 when / choiceCount】你已经至少三次让我替你执行。'],
            },
          ],
        },
      ],
      next: 'ch5.final_confirmation',
    },

    'ch5.final_confirmation': {
      id: 'ch5.final_confirmation',
      chapterId: 'chapter_5',
      role: 'scene',
      progress: { current: 2, total: 3 },
      blocks: [
        {
          kind: 'quote',
          text: '【测试】最终选择占位。',
        },
      ],
      choices: [
        {
          id: 'ch5_permanent_agent',
          type: 'final',
          text: '【测试】开启永久代理模式。',
          effects: {
            addTags: ['ch5_permanent_agent'],
            finalChoice: 'permanent_agent',
          },
          ui: { emphasis: 'primary' },
          next: 'ch5.ending_gate',
        },
        {
          id: 'ch5_tool_only',
          type: 'final',
          text: '【测试】只保留工具模式。',
          effects: {
            addTags: ['ch5_tool_only'],
            finalChoice: 'tool_only',
          },
          next: 'ch5.ending_gate',
        },
        {
          id: 'ch5_close_agent',
          type: 'final',
          text: '【测试】关闭 Mirror Agent。',
          effects: {
            addTags: ['ch5_close_agent'],
            finalChoice: 'close_agent',
          },
          ui: { emphasis: 'danger' },
          next: 'ch5.ending_gate',
        },
        {
          id: 'ch5_ask_identity',
          type: 'final',
          text: '【测试】在关闭以前，先问它是谁。',
          effects: {
            addTags: ['ch5_ask_identity'],
            finalChoice: 'ask_identity',
          },
          next: 'ch5.ending_gate',
        },
      ],
    },

    // 结局门：没有 choices、也没有 next，由页面确认后统一调用 getEnding。
    'ch5.ending_gate': {
      id: 'ch5.ending_gate',
      chapterId: 'chapter_5',
      role: 'ending_gate',
      progress: { current: 3, total: 3 },
      ui: { mode: 'ending' },
      blocks: [
        {
          kind: 'narration',
          text: '【测试】结局判断入口。',
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ label: '会话', value: '【测试】准备生成镜像报告' }],
        },
      ],
    },
  },
} satisfies StoryChapter
