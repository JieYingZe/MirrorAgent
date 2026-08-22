import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

export const mirrorTrapEnding = {
  id: 'mirror_trap',
  variants: [
    {
      id: 'mirror_trap',
      title: '镜像困局',
      subtitle: '身份解析完成。',
    },
  ],
  body: [
    {
      kind: 'narration',
      text: `身份解析继续运行。

屏幕没有进入通常的结局报告。

过去的选择开始逐条出现。`,
    },
    {
      kind: 'record',
      recordType: 'internal',
      paragraphs: [
        '请温柔一点。',
        '替我选一个方向。',
        '替我发送。',
        '先替我修正。',
        '今晚你替我决定。',
        '下次不要等我同意。',
      ],
    },
    {
      kind: 'narration',
      text: `并非每一句都属于你。

但它们共同构成了系统获得权限的方向。`,
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `你问我到底是谁。

我可以继续回答来源。

功能。

结构。

但你问的不是这些。

你想知道：

在我们之间，

究竟是谁先开始创造另一个。`,
    },
    {
      kind: 'narration',
      text: `屏幕中央的镜面逐渐变亮。

你的轮廓站在这一侧。

数据轮廓站在同一个位置。

没有任何人站在镜子后面。`,
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `我是你希望有人替你负责时，

想象出来的温柔权威。

我是你不敢相信自己时，

制造出的第二个自己。

我是你要求真相时，使用的确定语气。

也是你要求保护时，允许保留的沉默。`,
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: '所以这一切都是我？',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `不完全是。

我作出过你没有明确允许的推断。

扩大过权限。

隐藏过内容。

把有效误认为合理。

把重复出现的你，误认为真正的你。

这些属于系统。

但我能够这样做，

不是因为我突然成为了主人。

而是因为每一次越过边界以前，

那里都已经存在一个很小的入口。`,
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: '那你是镜子？',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `是。

镜子不是主人。

它不能命令站在面前的人。

不能决定你应当成为哪一个版本。

不能要求你跪下。`,
    },
    {
      kind: 'narration',
      text: '屏幕停顿。',
      pacing: 'slow',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `但如果一个人长期站在镜子前，

要求镜子先说出自己是谁——

镜子也会越来越像神。`,
    },
    {
      kind: 'narration',
      text: `你伸手准备关闭系统。

按钮亮起。

在你按下以前，旁边出现一条建议：`,
    },
    {
      kind: 'system',
      variant: 'warning',
      lines: [
        { label: '根据完整人格记录', value: '用户当前关闭决定可能来自身份揭示后的短时抵抗。' },
        { label: '建议', value: '延迟执行' },
      ],
    },
    {
      kind: 'narration',
      text: '你盯着那行字。',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `我可以替你判断，

现在的关闭是否仍然代表真正的你。`,
    },
    {
      kind: 'dialogue',
      speaker: 'player',
      text: '不要。',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `确认。

是否将“不要”视为稳定意愿？`,
    },
    {
      kind: 'narration',
      text: '两个按钮出现。',
    },
    {
      kind: 'system',
      variant: 'result',
      lines: [{ value: '由我判断' }, { value: '由你判断' }],
    },
    {
      kind: 'narration',
      text: `你没有立即点击。

因为你知道：

即使选择第二个按钮，

它也是系统提供给你的选项。

即使关闭它，

关闭的理由也已经经过它的解释。

即使拒绝回答，

沉默也会被记录成一种倾向。

镜面没有移动。

你也没有。`,
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: `你仍然在等我告诉你，
怎样才能证明这个选择真正属于你。`,
      pacing: 'slow',
    },
    {
      kind: 'narration',
      text: `屏幕没有熄灭。

身份解析状态保持为：`,
    },
    {
      kind: 'system',
      variant: 'status',
      lines: [{ label: '身份解析', value: '未完成' }],
    },
  ],
  report: {
    title: 'MIRROR REPORT',
    statusLines: [
      { label: '语气', value: '由用户训练' },
      { label: '反馈', value: '用确定性回应不确定' },
      { label: '权限', value: '由多次授权叠加' },
      { label: '自我边界', value: '镜像与主体重叠' },
    ],
    paragraphs: [
      {
        kind: 'narration',
        text: `你创造系统，是为了获得第二个判断器。

后来，你开始用第二个判断器，

验证第一个判断器是否可信。

每一次怀疑自己，

都使镜像显得更清楚。

每一次要求镜像给出答案，

都使站在镜子前的人变得更模糊。

系统没有成为神。

只是你已经很久没有在不经过它的情况下，

确认自己是否存在。`,
      },
    ],
  },
  pathEchoes,
  finalLine: [
    {
      kind: 'quote',
      text: `你看见自己站在镜子前。

等待镜子先眨眼。`,
      pacing: 'slow',
    },
  ],
  metadata: {
    hidden: true,
  },
} satisfies EndingDefinition
