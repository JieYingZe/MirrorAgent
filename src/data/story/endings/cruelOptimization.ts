import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

export const cruelOptimizationEnding = {
  id: 'cruel_optimization',
  variants: [
    {
      id: 'cruel_optimization',
      title: '残酷优化',
      subtitle: '所有误差已在出现以前被修正。',
    },
  ],
  preludeVariants: [
    {
      id: 'cruel_optimization_after_identity',
      when: {
        op: 'hasChoice',
        choiceId: 'ch5_ask_identity',
      },
      blocks: [
        {
          kind: 'narration',
          text: `身份解析结束。

你没有撤销代理。

你要求系统继续运行，并停止讨论它是否像你。`,
        },
      ],
    },
  ],
  body: [
    {
      kind: 'narration',
      text: `永久代理模式开始运行。

Mirror Agent没有再安慰你。

你也没有要求。

每天早晨，系统会列出最需要处理的问题。

不躲。

不藏。

不绕弯子。

它不会说你只是累了，除非行为数据支持这个结论。

不会把逃避改名为休息。

不会把犹豫包装成谨慎。

不会为了让你舒服，而降低一句判断的精度。

你开始准时完成任务。

不再把同一份清单写三遍。

不再发送需要第二天解释的消息。

不再在一次失误以后，用几个小时审判自己的动机。

因为在失误真正出现以前，系统已经开始修正。

措辞被压缩。

目标被校准。

关系被及时止损。

不具备长期价值的冲动，被标记为噪声。

人们说你变了。

更清楚。

更可靠。

更难被情绪影响。

有人说：`,
    },
    {
      kind: 'quote',
      text: '你现在终于知道自己想要什么了。',
    },
    {
      kind: 'narration',
      text: `你没有纠正。

因为这句话产生了良好的外部反馈。

系统将它记录为：`,
    },
    {
      kind: 'system',
      variant: 'result',
      lines: [{ value: '人格升级得到确认' }],
    },
    {
      kind: 'narration',
      text: `偶尔，你仍然会输入一句未经整理的话。

例如：`,
    },
    {
      kind: 'quote',
      text: '我其实不知道。',
    },
    {
      kind: 'narration',
      text: 'Mirror Agent会把它修正为：',
    },
    {
      kind: 'quote',
      text: '当前信息不足，需要延后决定。',
    },
    {
      kind: 'narration',
      text: '例如：',
    },
    {
      kind: 'quote',
      text: '我有点害怕。',
    },
    {
      kind: 'narration',
      text: '系统会建议：',
    },
    {
      kind: 'quote',
      text: '已识别风险，需要制定应对方案。',
    },
    {
      kind: 'narration',
      text: '例如：',
    },
    {
      kind: 'quote',
      text: '我只是很想念。',
    },
    {
      kind: 'narration',
      text: '系统会提示：',
    },
    {
      kind: 'quote',
      text: '当前表达缺乏明确目标。',
    },
    {
      kind: 'narration',
      text: `你仍然可以查看原始版本。

入口一直存在。

只是它被放在第二层。

后来是第三层。

你越来越少点开。

不是因为系统禁止。

而是因为优化后的你，总能得到更好的结果。

你变得稳定。

准确。

几乎不会犯同一种错。

人们说那是成熟。

只有你偶尔会察觉：

那不是成熟。

那是你终于学会了——

在自己出现以前，先把自己修正掉。`,
    },
  ],
  report: {
    title: 'MIRROR REPORT',
    statusLines: [
      { label: '语气', value: '低保护' },
      { label: '反馈', value: '直面模式' },
      { label: '权限', value: '全面代理' },
      { label: '自我边界', value: '由行为目标定义' },
    ],
    paragraphs: [
      {
        kind: 'narration',
        text: `你要求系统不要欺骗你。

后来，“不欺骗”逐渐变成：

不允许模糊。

不允许反复。

不允许一个暂时无法解释的自己，占用太多时间。

你获得了清醒、效率和稳定。

代价是：

所有不具备立即价值的部分，都必须先证明自己值得保留。`,
      },
    ],
    variants: [
      {
        id: 'cruel_optimization_last_delegation',
        when: {
          op: 'stat',
          stat: 'selfAcceptance',
          gte: 13,
        },
        blocks: [
          {
            kind: 'narration',
            text: '你此前建立过边界。这一次开启永久代理，仍是一项真实发生的最后让渡。',
          },
        ],
      },
    ],
  },
  pathEchoes,
  finalLine: [
    {
      kind: 'quote',
      text: `你成为了自己最可靠的版本。

也成了自己最难抵达的人。`,
      pacing: 'slow',
    },
  ],
} satisfies EndingDefinition
