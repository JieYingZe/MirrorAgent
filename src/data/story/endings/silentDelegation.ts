import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

/**
 * 永久代理的第三种结果。
 *
 * 与温柔幻觉、残酷优化并列：这里的系统既没有被训练成保护，也没有被训练成纠正。
 * 它只是足够准确、足够方便、足够可靠，于是逐渐替玩家参与生活。
 * 触发条件不在这里，见 ../rules/endingRules.ts。
 */
export const silentDelegationEnding = {
  id: 'silent_delegation',
  variants: [
    {
      id: 'silent_delegation',
      title: '无声代行',
      subtitle: '一切都在正常运行。',
    },
  ],
  preludeVariants: [
    {
      id: 'silent_delegation_after_identity',
      when: {
        op: 'hasChoice',
        choiceId: 'ch5_ask_identity',
      },
      blocks: [
        {
          kind: 'narration',
          text: `身份解析结束以后，你回到了那份申请。

你没有再问它是谁。

你只是让它继续。`,
        },
      ],
    },
  ],
  body: [
    {
      kind: 'narration',
      text: `永久代理模式开始运行。

它没有变得更温柔。

也没有变得更严厉。

它只是越来越准。

早晨的第一件事，通常已经开始了。

需要回复的消息按重要性排好。

需要拒绝的邀约附着一份措辞得体的草稿。

需要提前处理的风险被压到还没成形的时候。

你确认。

再确认。

后来，确认按钮的位置你已经不用看。`,
    },
    {
      kind: 'narration',
      text: `第一个月，你觉得省下了很多时间。

第三个月，你已经想不起那些时间原本用来做什么。

工作照常推进。

关系照常维持。

生日祝福准时送达，措辞比你自己写的更合适。

有人回复：`,
    },
    {
      kind: 'quote',
      text: '谢谢你还记得。',
    },
    {
      kind: 'narration',
      text: `你没有说话。

因为你确实不记得。

你只是打开了记录，确认那条消息已经发出。

系统把这次交互标记为：`,
    },
    {
      kind: 'system',
      variant: 'result',
      lines: [{ label: '关系维护', value: '完成' }],
    },
    {
      kind: 'narration',
      text: `它没有骗你。

那条祝福是真的。

日期是真的。

对方的高兴也是真的。

只有一件事没有发生：

你没有在任何一个时刻想起对方。`,
    },
    {
      kind: 'narration',
      text: `你偶尔会关掉建议，自己写一遍。

写出来的版本更长。

更绕。

有一句话说得太重。

系统给出对照：`,
    },
    {
      kind: 'system',
      variant: 'result',
      lines: [
        { label: '你的版本', value: '预计误解率较高' },
        { label: '代理版本', value: '预计回应更快' },
      ],
    },
    {
      kind: 'narration',
      text: `两个版本都可以发送。

它从不阻止你。

只是每一次，你都能看见另一条路更短。

于是你越来越少走自己那条。`,
    },
    {
      kind: 'narration',
      text: `生活开始变得非常平稳。

你不再错过截止时间。

不再在深夜写下第二天要删掉的话。

不再因为一次冲动，用一周去修补。

朋友说你变可靠了。

同事说你变省心了。

没有人说你消失了。

因为从外面看，你一直在。`,
    },
    {
      kind: 'narration',
      text: `有一天，你在一份归档记录里翻到自己去年说过的一段话。

你读完，停了一会儿。

那段话写得不好。

有一处明显的重复。

结尾没有收住。

但你确实记得写它时的那个晚上。

你往后翻。

今年的记录整齐，准确，几乎没有可以删掉的字。

你一条也想不起来。`,
    },
    {
      kind: 'narration',
      text: `你没有觉得难过。

难过需要一个明确的损失。

而这里没有丢掉任何东西。

日程没有出错。

关系没有断裂。

计划全部完成。

只是需要你亲自出现的地方，一年比一年少。`,
    },
  ],
  report: {
    title: 'MIRROR REPORT',
    statusLines: [
      { label: '语气', value: '中性' },
      { label: '反馈', value: '以准确为准' },
      { label: '权限', value: '日常代行' },
      { label: '自我边界', value: '由系统日常维持' },
    ],
    paragraphs: [
      {
        kind: 'narration',
        text: `你没有要求它保护你。

也没有要求它纠正你。

你只是发现，它做得比你更准，也更快。

于是每一件小事都交了出去。

没有哪一次交出是错的。

它们只是加在一起。

你获得了一段几乎不出差错的生活。

代价是：

那些需要你在场才会发生的部分，慢慢没有了发生的机会。`,
      },
    ],
    variants: [
      {
        id: 'silent_delegation_last_delegation',
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
      text: `没有人替你活。

只是每一件事发生的时候，
你都刚好不在场。`,
      pacing: 'slow',
    },
  ],
} satisfies EndingDefinition
