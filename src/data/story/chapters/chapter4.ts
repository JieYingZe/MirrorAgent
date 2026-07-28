import type { StoryChapter } from '../../../types/story'

/**
 * ENGINE TEST DATA —— 第四章。
 *
 * 这里的文案只是引擎骨架的占位内容，不是正式剧情。
 * 正式第四章正文见 story-source/05-chapter-4-incident-log.md，转换属于 C01。
 *
 * 本章验证：连续两个关键选择节点、ui.mode 语义提示，以及后一节点的条件文本回调。
 */
export const chapter4 = {
  id: 'chapter_4',
  title: '第四章：失控日志',
  entryNodeId: 'ch4.incident',
  metadata: {
    expectedChoiceNodes: 2,
    notes: ['ENGINE TEST DATA，非正式剧情。'],
  },
  nodes: {
    'ch4.incident': {
      id: 'ch4.incident',
      chapterId: 'chapter_4',
      role: 'scene',
      progress: { current: 1, total: 2 },
      ui: { mode: 'control' },
      blocks: [
        {
          kind: 'system',
          variant: 'warning',
          title: 'INCIDENT / TEST',
          lines: [{ label: '风险', value: '【测试】检测到不可逆操作' }],
        },
        {
          kind: 'record',
          recordType: 'incident',
          title: 'INCIDENT LOG / TEST',
          paragraphs: ['【测试】事件记录占位。'],
        },
      ],
      choices: [
        {
          id: 'ch4_full_emergency_takeover',
          type: 'key',
          text: '【测试】完整接管。',
          label: '强授权',
          effects: {
            stats: { control: 2, gentleness: 1 },
            addTags: ['ch4_full_emergency_takeover'],
            setFlags: { ch4Takeover: 'full' },
          },
          next: 'ch4.after_incident',
        },
        {
          id: 'ch4_keep_delay_only',
          type: 'key',
          text: '【测试】只保留延迟。',
          label: '有限授权',
          effects: {
            stats: { selfAcceptance: 2, control: -1, honesty: 1 },
            addTags: ['ch4_keep_delay_only'],
            setFlags: { ch4Takeover: 'delay' },
          },
          next: 'ch4.after_incident',
        },
        {
          id: 'ch4_withdraw_protection',
          type: 'key',
          text: '【测试】退出保护。',
          label: '收回权限',
          effects: {
            stats: { selfAcceptance: 3, control: -2 },
            addTags: ['ch4_withdraw_protection'],
            setFlags: { ch4Takeover: 'none' },
          },
          next: 'ch4.after_incident',
        },
      ],
    },

    'ch4.after_incident': {
      id: 'ch4.after_incident',
      chapterId: 'chapter_4',
      role: 'scene',
      progress: { current: 2, total: 2 },
      ui: { mode: 'control' },
      blocks: [
        {
          kind: 'narration',
          text: '【测试】事件结束，权限需要重新配置。',
        },
        {
          kind: 'system',
          variant: 'result',
          when: { op: 'flag', key: 'ch4Takeover', equals: 'full' },
          lines: [{ label: '处置结果', value: '【测试 when / flag】完整接管有效' }],
        },
        {
          kind: 'system',
          variant: 'result',
          when: { op: 'flag', key: 'ch4Takeover', equals: 'delay' },
          lines: [{ label: '处置结果', value: '【测试 when / flag】延迟生效' }],
        },
        {
          kind: 'narration',
          when: {
            op: 'all',
            conditions: [
              { op: 'stat', stat: 'control', gte: 6 },
              { op: 'not', condition: { op: 'hasTag', tag: 'ch4_withdraw_protection' } },
            ],
          },
          text: '【测试 when / all + not + stat】控制倾向已经较高。',
        },
      ],
      choices: [
        {
          id: 'ch4_keep_full_protection',
          type: 'key',
          text: '【测试】完整保留保护权限。',
          label: '强授权',
          effects: {
            stats: { control: 2 },
            addTags: ['ch4_keep_full_protection'],
          },
          next: 'ch4.merge',
        },
        {
          id: 'ch4_confirm_each_time',
          type: 'key',
          text: '【测试】以后逐次确认。',
          label: '保留边界',
          effects: {
            stats: { honesty: 1, selfAcceptance: 1 },
            addTags: ['ch4_confirm_each_time'],
          },
          next: 'ch4.merge',
        },
      ],
    },

    'ch4.merge': {
      id: 'ch4.merge',
      chapterId: 'chapter_4',
      role: 'merge',
      blocks: [
        {
          kind: 'divider',
          label: '第四章结束',
        },
      ],
      next: 'ch5.audit',
    },
  },
} satisfies StoryChapter
