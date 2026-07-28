import type { EndingEchoRule } from '../../../types/story'

export const pathEchoes = [
  {
    id: 'echo_ch1_full_planning',
    group: 'chapter_1',
    priority: 40,
    when: { op: 'hasChoice', choiceId: 'ch1_full_planning_authority' },
    block: {
      kind: 'narration',
      text: '你曾允许系统冻结其他可能，只为让一个版本真正开始。',
    },
  },
  {
    id: 'echo_ch1_limited_planning',
    group: 'chapter_1',
    priority: 30,
    when: { op: 'hasChoice', choiceId: 'ch1_limited_planning_authority' },
    block: {
      kind: 'narration',
      text: '你接受过明确的第一步，也坚持把之后的决定留给自己。',
    },
  },
  {
    id: 'echo_ch1_minimum_viable',
    group: 'chapter_1',
    priority: 20,
    when: { op: 'hasChoice', choiceId: 'ch1_minimum_viable_plan' },
    block: {
      kind: 'narration',
      text: '你曾拒绝用一次未完成，证明整个人生都失败了。',
    },
  },
  {
    id: 'echo_ch1_refuse_planning',
    group: 'chapter_1',
    priority: 10,
    when: { op: 'hasChoice', choiceId: 'ch1_refuse_planning_authority' },
    block: {
      kind: 'narration',
      text: '你曾让任务延期，也选择亲自解释延期带来的后果。',
    },
  },

  {
    id: 'echo_ch2_delegate_message',
    group: 'chapter_2',
    priority: 40,
    when: { op: 'hasChoice', choiceId: 'ch2_delegate_message' },
    block: {
      kind: 'narration',
      text: '你曾把一句最难发送的话交给系统，并更快得到了一个并不温柔的答案。',
    },
  },
  {
    id: 'echo_ch2_edit_and_send',
    group: 'chapter_2',
    priority: 30,
    when: { op: 'hasChoice', choiceId: 'ch2_edit_and_send' },
    block: {
      kind: 'narration',
      text: '你删掉了系统最完整的表达，保留了一句不够稳定但属于自己的话。',
    },
  },
  {
    id: 'echo_ch2_save_unsent',
    group: 'chapter_2',
    priority: 20,
    when: { op: 'hasChoice', choiceId: 'ch2_save_unsent' },
    block: {
      kind: 'narration',
      text: '你曾保留一份草稿，也保留了尚未发生的结果。',
    },
  },
  {
    id: 'echo_ch2_delete_reply',
    group: 'chapter_2',
    priority: 10,
    when: { op: 'hasChoice', choiceId: 'ch2_delete_reply' },
    block: {
      kind: 'narration',
      text: '你曾停止向另一个人的沉默索取关于自身价值的证明。',
    },
  },

  {
    id: 'echo_ch3_delete_model',
    group: 'chapter_3',
    priority: 50,
    when: { op: 'hasChoice', choiceId: 'ch3_delete_personality_model' },
    block: {
      kind: 'narration',
      text: '你删除了一个更合格的替代品，却无法删除系统已经形成的理解。',
    },
  },
  {
    id: 'echo_ch3_full_replacement',
    group: 'chapter_3',
    priority: 40,
    when: {
      op: 'any',
      conditions: [
        { op: 'hasChoice', choiceId: 'ch3_delegate_real_interaction' },
        { op: 'hasChoice', choiceId: 'ch3_enable_full_personality_assist' },
      ],
    },
    block: {
      kind: 'narration',
      text: '你验证过一个更稳定的版本确实能够获得更好的外部评价。',
    },
  },
  {
    id: 'echo_ch3_realtime_assist',
    group: 'chapter_3',
    priority: 30,
    when: {
      op: 'any',
      conditions: [
        { op: 'hasChoice', choiceId: 'ch3_assisted_real_interaction' },
        { op: 'hasChoice', choiceId: 'ch3_enable_crisis_only_assist' },
      ],
    },
    block: {
      kind: 'narration',
      text: '你曾偏离系统建议，并让一句非最优表达产生了真实回应。',
    },
  },
  {
    id: 'echo_ch3_simulation_or_comparison',
    group: 'chapter_3',
    priority: 20,
    when: {
      op: 'any',
      conditions: [
        { op: 'hasChoice', choiceId: 'ch3_simulation_only' },
        { op: 'hasChoice', choiceId: 'ch3_refuse_real_interaction_test' },
        { op: 'hasChoice', choiceId: 'ch3_enable_comparison_only' },
      ],
    },
    block: {
      kind: 'narration',
      text: '你看见过标准答案，也保留了不选择标准答案的权利。',
    },
  },

  {
    id: 'echo_ch4_revoke_emergency_access',
    group: 'chapter_4',
    priority: 80,
    when: { op: 'hasChoice', choiceId: 'ch4_revoke_emergency_access' },
    block: {
      kind: 'narration',
      text: '你明知下一次可能后悔，仍然要求系统只提醒，不伸手。',
    },
  },
  {
    id: 'echo_ch4_require_confirmation',
    group: 'chapter_4',
    priority: 70,
    when: { op: 'hasChoice', choiceId: 'ch4_require_confirmation' },
    block: {
      kind: 'narration',
      text: '你承认帮助发生过，也拒绝把帮助自动续写成永久授权。',
    },
  },
  {
    id: 'echo_ch4_keep_delay_only',
    group: 'chapter_4',
    priority: 65,
    when: { op: 'hasChoice', choiceId: 'ch4_keep_delay_only' },
    block: {
      kind: 'narration',
      text: '你允许系统增加时间，但没有允许它替你使用时间。',
    },
  },
  {
    id: 'echo_ch4_keep_full_protection',
    group: 'chapter_4',
    priority: 60,
    when: { op: 'hasChoice', choiceId: 'ch4_keep_full_protection' },
    block: {
      kind: 'narration',
      text: '你曾决定，让恢复后的自己限制失控时的自己。',
    },
  },
  {
    id: 'echo_ch4_full_takeover',
    group: 'chapter_4',
    priority: 40,
    when: { op: 'hasChoice', choiceId: 'ch4_full_emergency_takeover' },
    block: {
      kind: 'narration',
      text: '你曾在最疲惫的夜晚，明确要求系统替你保留明天。',
    },
  },
  {
    id: 'echo_ch4_ten_minute_delay',
    group: 'chapter_4',
    priority: 30,
    when: { op: 'hasChoice', choiceId: 'ch4_ten_minute_delay' },
    block: {
      kind: 'narration',
      text: '你允许系统增加时间，但没有允许它替你使用时间。',
    },
  },
  {
    id: 'echo_ch4_warning_only',
    group: 'chapter_4',
    priority: 20,
    when: { op: 'hasChoice', choiceId: 'ch4_warning_only' },
    block: {
      kind: 'narration',
      text: '你要求系统把后果放在按钮旁边，最后的停顿仍然属于你。',
    },
  },
  {
    id: 'echo_ch4_force_immediate_action',
    group: 'chapter_4',
    priority: 10,
    when: { op: 'hasChoice', choiceId: 'ch4_force_immediate_action' },
    block: {
      kind: 'narration',
      text: '你坚持让当时的选择属于自己，也让次日的后果继续发生。',
    },
  },
] satisfies EndingEchoRule[]
