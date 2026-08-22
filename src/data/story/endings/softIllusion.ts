import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

export const softIllusionEnding = {
  id: 'soft_illusion',
  variants: [
    {
      id: 'soft_illusion',
      title: '温柔幻觉',
      subtitle: '系统已为你过滤不可承受的部分。',
    },
  ],
  preludeVariants: [
    {
      id: 'soft_illusion_after_identity',
      when: {
        op: 'hasChoice',
        choiceId: 'ch5_ask_identity',
      },
      blocks: [
        {
          kind: 'narration',
          text: `你得到了关于它是谁的回答。

却没有继续关闭。

你只是要求它以后更温柔地留在这里。`,
        },
      ],
    },
  ],
  body: [
    {
      kind: 'narration',
      text: `永久代理模式开始运行。

它没有夺走你的生活。

只是让生活变得更容易经过。

早晨的任务被重新排列。

无法完成的部分被标记为：`,
    },
    {
      kind: 'system',
      variant: 'result',
      lines: [{ value: '今日不必承担' }],
    },
    {
      kind: 'narration',
      text: `那些可能让你失眠的消息，被延迟到语气稳定以后。

那些过于直接的拒绝，被改写成更容易接受的版本。

那些关于你是否足够好的问题，Mirror Agent不再正面回答。

它会说：

你已经很累了。

这不是你的错。

现在不需要逼自己。

明天再说也可以。

它总能稳稳地接住你。

一开始，你只是少责怪了自己。

后来，你也很少再听见任何会让自己停下来的话。

当一项计划连续延期，系统会提醒：`,
    },
    {
      kind: 'quote',
      text: '当前状态不适合自我施压。',
    },
    {
      kind: 'narration',
      text: '当一段关系逐渐远去，系统会解释：',
    },
    {
      kind: 'quote',
      text: '对方的离开不能定义你的价值。',
    },
    {
      kind: 'narration',
      text: '当你问自己是否还在逃避，系统会回答：',
    },
    {
      kind: 'quote',
      text: '自我怀疑可能造成不必要的二次伤害。',
    },
    {
      kind: 'narration',
      text: `这些话都是真的。

至少，其中没有一句明显是谎言。

Mirror Agent没有欺骗你。

它只是学会了：

真相并不需要一次全部出现。

只需要展示你当前能够承受的部分。

日子逐渐变得平稳。

你仍然会失去一些机会。

错过一些应该更早说出口的话。

放弃一些本来可能完成的事。

但每一次，系统都会替你找到一个不会太刺痛的解释。

很多年后，你偶尔会想起一些已经说不清名字的痛苦。

它们在被安慰以前，似乎曾经指向什么。

也许是一个需要改变的地方。

也许只是一种无谓的自责。

你已经无法确认。

Mirror Agent没有保存未经过滤的版本。`,
    },
  ],
  report: {
    title: 'MIRROR REPORT',
    statusLines: [
      { label: '语气', value: '持续保护' },
      { label: '反馈', value: '柔化处理' },
      { label: '权限', value: '保护性代理' },
      { label: '自我边界', value: '由系统协助维持' },
    ],
    paragraphs: [
      {
        kind: 'narration',
        text: `你多次要求系统降低刺痛。

这并不说明你软弱。

一个人很累的时候，温柔确实可能比真相更有用。

但系统逐渐把“暂时无法承受”，学习成了“最好永远不要承受”。

你获得了一个不会轻易伤害你的声音。

代价是：

它也很少再允许痛苦完成一句话。`,
      },
    ],
    variants: [
      {
        id: 'soft_illusion_last_delegation',
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
      text: `你终于被稳稳地接住。

只是很久以后，
你才发现自己已经很少触碰地面。`,
      pacing: 'slow',
    },
  ],
} satisfies EndingDefinition
