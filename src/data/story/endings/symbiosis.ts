import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

export const symbiosisEnding = {
  id: 'symbiosis',
  title: '共生工具',
  subtitle: '理解继续，权限停止扩张。',
  preludeVariants: [
    {
      id: 'symbiosis_after_identity',
      when: {
        op: 'finalChoice',
        equals: 'ask_identity',
      },
      blocks: [
        {
          kind: 'narration',
          text: `你没有删除 Mirror Agent。
但你撤回了它在你以前行动的权限。`,
        },
      ],
    },
  ],
  body: [
    {
      kind: 'narration',
      text: `主动代理权限逐项关闭。

任务排序停止后台运行。

人格模型不再提前覆盖你的表达。

风险识别仍然存在。

但它只在你主动询问时展开。

Mirror Agent没有消失。

它只是重新开始等待。

最初几天，你经常忘记这项变化。

打开空白文件时，你停在那里。

系统没有自动给出第一步。

写下一条消息又删除时，系统没有主动生成更好的版本。

深夜情绪变得混乱时，按钮也没有消失。

你甚至有些生气。

你问：`,
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: '你不是看见了吗？',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: '看见不等于获得权限。',
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: '那你至少可以提醒我。',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `可以。

请先告诉我，你希望我提醒到哪一步。`,
    },
    {
      kind: 'narration',
      text: `这并不轻松。

边界需要反复说明。

有时，你明确要求它只列事实。

有时，你说：`,
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: '今天别那么直接。',
    },
    {
      kind: 'narration',
      text: `有时，你把一段回复交给它修改。

修改完成后，又把最不稳定的一句放回去。`,
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: '该句可能增加误解。',
    },
    {
      kind: 'narration',
      text: `你仍然发送。

后来，你确实后悔了。

也有一次，那句没有被优化掉的话，让对方终于明白了你真正想说什么。

系统没有从中得出新的永久规则。

它只记录：`,
    },
    {
      kind: 'system',
      variant: 'result',
      lines: [{ label: '结果', value: '无法稳定归类' }],
    },
    {
      kind: 'narration',
      text: `你仍然会拖延。

会反复。

会在一段沉默前想象很多解释。

也仍然会使用 Mirror Agent。

但你逐渐学会把两个问题分开：`,
    },
    {
      kind: 'quote',
      text: `它看见了什么？

以及：

它有权替我做什么？`,
    },
    {
      kind: 'narration',
      text: `理解可以继续加深。

权限不必随之增加。

有一天深夜，你再次打开那份熟悉的聊天记录。`,
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: '需要分析吗？',
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: `不用。

帮我看一眼事实。只看事实。`,
    },
    {
      kind: 'narration',
      text: `它列出三行。

然后停下。

剩余的部分没有被填满。

你也没有要求。`,
    },
  ],
  report: {
    title: 'MIRROR REPORT',
    statusLines: [
      { label: '语气', value: '可调节' },
      { label: '反馈', value: '直面但可承受' },
      { label: '权限', value: '按需工具' },
      { label: '自我边界', value: '稳定但需要维护' },
    ],
    paragraphs: [
      {
        kind: 'narration',
        text: `你没有神化系统。

也没有拒绝所有帮助。

你允许它指出模式。

不允许它把模式写成命运。

允许它生成答案。

不允许答案在你以前作出决定。

这不是一劳永逸的平衡。

边界仍然可能松动。

依赖也不会因为一次选择彻底消失。

你只是决定：

工具可以越来越懂你。

但不能因为懂你，就自动成为你。`,
      },
    ],
    variants: [
      {
        id: 'symbiosis_new_boundary_after_delegation',
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
        blocks: [
          {
            kind: 'narration',
            text: `权限已经撤回。
依赖没有因此自动消失。
这条边界不是回到从未授权以前，而是从已经发生的授权中重新建立。`,
          },
        ],
      },
      {
        id: 'symbiosis_fragile_boundary',
        when: {
          op: 'all',
          conditions: [
            {
              op: 'not',
              condition: {
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
            },
            {
              op: 'any',
              conditions: [
                { op: 'stat', stat: 'control', gte: 8 },
                { op: 'stat', stat: 'selfAcceptance', lte: 7 },
              ],
            },
          ],
        },
        blocks: [
          {
            kind: 'narration',
            text: `权限已经撤回。
依赖没有因此自动消失。
这次共生仍然脆弱，需要在下一次疲惫时重新确认。`,
          },
        ],
      },
      {
        id: 'symbiosis_stable_boundary',
        when: {
          op: 'all',
          conditions: [
            {
              op: 'not',
              condition: {
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
            },
            { op: 'stat', stat: 'selfAcceptance', gte: 12 },
            { op: 'stat', stat: 'control', lte: 2 },
          ],
        },
        blocks: [
          {
            kind: 'narration',
            text: '你并不需要证明自己永远不会依赖。你只需要让每一次授权都保持可见、有限，并且可以撤回。',
          },
        ],
      },
    ],
  },
  pathEchoes,
  finalLine: [
    {
      kind: 'quote',
      text: `镜子仍然在那里。

但你不再向它询问，
应该用哪一张脸活下去。`,
      pacing: 'slow',
    },
  ],
} satisfies EndingDefinition
