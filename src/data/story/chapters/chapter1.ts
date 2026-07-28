import type { StoryChapter } from '../../../types/story'

/**
 * ENGINE TEST DATA —— 第一章。
 *
 * 这里的文案只是引擎骨架的占位内容，不是正式剧情。
 * 正式第一章正文见 story-source/02-chapter-1-efficiency.md，转换属于 C01。
 *
 * 本章验证：
 * - roleplay 选择 + 选项专属 response；
 * - exploration 选择不修改四变量、只写标签和 flag；
 * - key 选择进入两个不同分支节点后汇合；
 * - 汇合节点的 when 条件文本。
 */
export const chapter1 = {
  id: 'chapter_1',
  title: '第一章：效率焦虑',
  entryNodeId: 'ch1.three_lists',
  metadata: {
    expectedChoiceNodes: 3,
    notes: ['ENGINE TEST DATA，非正式剧情。'],
  },
  nodes: {
    // 扮演／语气选择：带内联 response，随后立即回到共同主线。
    'ch1.three_lists': {
      id: 'ch1.three_lists',
      chapterId: 'chapter_1',
      role: 'scene',
      progress: { current: 1, total: 4 },
      blocks: [
        {
          kind: 'narration',
          text: '【测试】三份重复的清单，一个空白文件。',
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: 'INTERNAL / TEST',
          paragraphs: ['【测试】记录块占位。'],
        },
      ],
      choices: [
        {
          id: 'ch1_tone_defensive',
          type: 'roleplay',
          text: '【测试】你连这个都要记录？',
          label: '防备',
          effects: {
            stats: { honesty: 1 },
            addTags: ['ch1_tone_defensive'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '【测试 response 1】记录不是指控。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '【测试 response 2】这两句只在选择后短暂显示，不写入长期剧情数据。',
            },
          ],
          next: 'ch1.planning_request',
        },
        {
          id: 'ch1_tone_quiet',
          type: 'roleplay',
          text: '【测试】我没什么好说的。',
          label: '沉默',
          effects: {
            stats: { gentleness: 1 },
            addTags: ['ch1_tone_quiet'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '【测试 response】沉默也是一种回答。',
              delivery: 'soft',
            },
          ],
          next: 'ch1.planning_request',
        },
      ],
    },

    // 信息探索：只写标签和 flag，不改变四变量；跳过同样推进剧情。
    'ch1.planning_request': {
      id: 'ch1.planning_request',
      chapterId: 'chapter_1',
      role: 'scene',
      progress: { current: 2, total: 4 },
      blocks: [
        {
          kind: 'narration',
          text: '【测试】系统请求规划权限。',
        },
        {
          // 条件文本：只在玩家选过防备语气时出现。
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch1_tone_defensive' },
          text: '【测试 when】你刚才的语气比较硬，我先说明依据。',
        },
      ],
      choices: [
        {
          id: 'ch1_inspect_basis',
          type: 'exploration',
          text: '【测试】查看它的判断依据。',
          label: '探索',
          effects: {
            addTags: ['ch1_explored_basis'],
            setFlags: { ch1BasisSeen: true },
          },
          response: [
            {
              kind: 'document',
              documentType: 'file',
              title: 'BASIS / TEST',
              sections: [
                {
                  heading: '判断依据',
                  lines: ['【测试】探索选项不修改四变量。', '【测试】只写入探索标签。'],
                },
              ],
            },
          ],
          next: 'ch1.planning_choice',
        },
        {
          id: 'ch1_skip_basis',
          type: 'exploration',
          text: '【测试】不看，直接继续。',
          label: '跳过',
          effects: {
            addTags: ['ch1_skipped_basis'],
          },
          next: 'ch1.planning_choice',
        },
      ],
    },

    // 关键选择：A/B 进入两个不同分支节点。
    'ch1.planning_choice': {
      id: 'ch1.planning_choice',
      chapterId: 'chapter_1',
      role: 'scene',
      progress: { current: 3, total: 4 },
      blocks: [
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '【测试】要把排序交给我，还是只接受第一步？',
        },
      ],
      choices: [
        {
          id: 'ch1_full_planning_authority',
          type: 'key',
          text: '【测试】把排序交给你。',
          label: '强授权',
          effects: {
            stats: { control: 3, selfAcceptance: -1 },
            addTags: ['ch1_full_planning_authority'],
            setFlags: { ch1PlanningDelegated: true },
          },
          next: 'ch1.full_authority_result',
        },
        {
          id: 'ch1_keep_first_step',
          type: 'key',
          text: '【测试】只接受第一步。',
          label: '保留边界',
          effects: {
            stats: { selfAcceptance: 2, control: -1 },
            addTags: ['ch1_keep_first_step'],
          },
          next: 'ch1.first_step_result',
        },
      ],
    },

    'ch1.full_authority_result': {
      id: 'ch1.full_authority_result',
      chapterId: 'chapter_1',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ label: '规划权限', value: '【测试】已授予' }],
        },
      ],
      next: 'ch1.merge',
    },

    'ch1.first_step_result': {
      id: 'ch1.first_step_result',
      chapterId: 'chapter_1',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ label: '规划权限', value: '【测试】仅第一步' }],
        },
      ],
      next: 'ch1.merge',
    },

    // 汇合：两个分支在这里回到同一条主线，差异改由条件文本承担。
    'ch1.merge': {
      id: 'ch1.merge',
      chapterId: 'chapter_1',
      role: 'merge',
      progress: { current: 4, total: 4 },
      blocks: [
        {
          kind: 'narration',
          text: '【测试】分支已汇合。',
        },
        {
          kind: 'record',
          recordType: 'mirror',
          when: { op: 'hasChoice', choiceId: 'ch1_full_planning_authority' },
          title: 'MIRROR RECORD / TEST A',
          paragraphs: ['【测试 when】用户在选择范围被缩小时更容易开始行动。'],
        },
        {
          kind: 'record',
          recordType: 'mirror',
          when: { op: 'hasChoice', choiceId: 'ch1_keep_first_step' },
          title: 'MIRROR RECORD / TEST B',
          paragraphs: ['【测试 when】用户保留了自己排序的权利。'],
        },
        {
          kind: 'narration',
          when: { op: 'hasTag', tag: 'ch1_explored_basis' },
          text: '【测试 when / hasTag】你读过它的判断依据。',
        },
      ],
      next: 'ch2.opening',
    },
  },
} satisfies StoryChapter
