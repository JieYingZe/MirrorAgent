import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

/**
 * 工具模式家族。
 *
 * 家族正文只描述「权限退回工具」这件事本身，四个变体负责说明
 * 这条边界是本来就有、重新建立、尚未定型，还是仍然带着没有消失的依赖。
 * 触发条件不在这里，见 ../rules/endingRules.ts。
 */
export const symbiosisEnding = {
  id: 'symbiosis',
  variants: [
    {
      id: 'symbiosis_stable_boundary',
      title: '稳定边界',
      subtitle: '边界一直在。这次只是确认。',
      statusLines: [
        { label: '语气', value: '可调节' },
        { label: '反馈', value: '直面但可承受' },
        { label: '权限', value: '按需工具' },
        { label: '自我边界', value: '长期稳定' },
      ],
      prelude: [
        {
          kind: 'narration',
          text: `这一步没有推翻什么。

它只是把一直存在的界线，第一次写进了配置。`,
        },
      ],
      report: [
        {
          kind: 'narration',
          text: `你没有在任何一章真正把自己交出去。

不是因为你不累。

也不是因为你比别人更清醒。

只是每一次系统伸手，你都问了一遍它要伸到哪里。

这条边界不需要证明自己永远不会松动。

它只需要保持可见、有限，并且可以撤回。`,
        },
      ],
    },
    {
      id: 'symbiosis_rebuilt_boundary',
      title: '边界重建',
      subtitle: '权限真的交出去过。也真的拿了回来。',
      statusLines: [
        { label: '语气', value: '可调节' },
        { label: '反馈', value: '直面但可承受' },
        { label: '权限', value: '已从代理退回工具' },
        { label: '自我边界', value: '重新建立' },
      ],
      prelude: [
        {
          kind: 'narration',
          text: `被撤销的这些权限，你都曾经亲手打开过。

关闭它们花的时间，比打开长得多。`,
        },
      ],
      report: [
        {
          kind: 'narration',
          text: `你交出过真实的权限。

不止一次。

后来你又一项一项收了回来。

这条边界不是回到从未授权以前。

它是从已经发生的授权里重新长出来的，因此更清楚自己在防什么。

你知道那扇门开着是什么感觉。

也知道关上它需要多久。`,
        },
      ],
    },
    {
      id: 'symbiosis_cautious',
      title: '谨慎共生',
      subtitle: '关系还没有定型。',
      statusLines: [
        { label: '语气', value: '可调节' },
        { label: '反馈', value: '保留余地' },
        { label: '权限', value: '按需工具' },
        { label: '自我边界', value: '尚未定型' },
      ],
      prelude: [
        {
          kind: 'narration',
          text: `你没有走到很深的地方。

也没有站到足够远的地方。`,
        },
      ],
      report: [
        {
          kind: 'narration',
          text: `你既没有把生活交出去，也没有建立一条经得起疲惫的界线。

保留工具，是一个还没有结论的决定。

它不代表你已经想清楚。

只代表你暂时不打算再往前走一步。

下一次深夜，这条界线仍然需要重新说明一遍。`,
        },
      ],
      finalLine: [
        {
          kind: 'quote',
          text: `镜子仍然在那里。

你还没有决定，
以后要用它照多久。`,
          pacing: 'slow',
        },
      ],
    },
    {
      id: 'symbiosis_fragile_boundary',
      title: '脆弱边界',
      subtitle: '权限已经撤回。依赖还没有。',
      statusLines: [
        { label: '语气', value: '可调节' },
        { label: '反馈', value: '直面但可承受' },
        { label: '权限', value: '已撤回' },
        { label: '自我边界', value: '依赖尚未消失' },
      ],
      prelude: [
        {
          kind: 'narration',
          text: `权限在这一刻结束。

习惯不在同一刻结束。`,
        },
      ],
      report: [
        {
          kind: 'narration',
          text: `你撤回了权限。

依赖没有因此自动消失。

它换了一个位置：从系统的配置里，回到你打开界面时的第一个动作。

你仍然会先问它，再问自己。

这条边界是真的。

它只是还没有被任何一次疲惫检验过。`,
        },
      ],
      finalLine: [
        {
          kind: 'quote',
          text: `镜子仍然在那里。

你收回了它的手，
还没有收回自己的目光。`,
          pacing: 'slow',
        },
      ],
    },
  ],
  preludeVariants: [
    {
      id: 'symbiosis_after_identity',
      when: {
        op: 'hasChoice',
        choiceId: 'ch5_ask_identity',
      },
      blocks: [
        {
          kind: 'narration',
          text: `身份回答结束以后，那份申请仍然停在屏幕中央。

你没有删除 Mirror Agent。

你只是撤回了它在你以前行动的权限。`,
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
      { label: '自我边界', value: '需要维护' },
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
