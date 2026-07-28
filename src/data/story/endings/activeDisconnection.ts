import type { EndingDefinition } from '../../../types/story'
import { pathEchoes } from './pathEchoes'

export const activeDisconnectionEnding = {
  id: 'active_disconnection',
  title: '主动断联',
  subtitle: '系统关闭。自主权限恢复。',
  preludeVariants: [
    {
      id: 'active_disconnection_after_identity',
      when: {
        op: 'finalChoice',
        equals: 'ask_identity',
      },
      blocks: [
        {
          kind: 'narration',
          text: '身份回答结束以后，你继续了刚才暂停的关闭流程。',
        },
      ],
    },
  ],
  body: [
    {
      kind: 'narration',
      text: `最后一份镜像报告生成完成。

随后，后台判断停止。

人格模型停止。

风险识别停止。

那些始终安静地等待在你以前的答案，也一并消失。`,
    },
    {
      kind: 'system',
      variant: 'status',
      lines: [{ label: 'MIRROR AGENT', value: '离线' }],
    },
    {
      kind: 'narration',
      text: `屏幕熄灭。

房间没有变亮。

你也没有突然理解自己。

第二天早晨，待办仍然杂乱。

那份文件仍需要修改。

一条消息停在输入框中。

你不知道应该发送，删除，还是继续等。

你下意识看向屏幕右侧。

那里原本会出现一条建议。

现在什么也没有。

你想过重新启动。

这并不可耻。

关闭一个系统，不会让人立刻变得足够坚定。

也不会让依赖在一夜之间失去吸引力。

你只是暂时失去了一个总能给出下一步的声音。

上午十点，你重新排列了一次任务。

十点十五分，又改了一次。

你意识到自己正在重复第一章里的行为。

没有系统替你指出。

这个发现来得很慢。

也不够漂亮。

你最后只完成了一件事。

下午，你回复了一条消息。

措辞不够成熟。

其中一句写得太多。

发送以后，你后悔了十分钟。

对方却回复：`,
    },
    {
      kind: 'quote',
      text: '我知道了。',
    },
    {
      kind: 'narration',
      text: `没有奇迹。

没有人生因此重新开始。

你仍然会希望有人替你判断。

仍然会在混乱中寻找一种确定的语气。

区别只是：

下一次这种愿望出现时，

不会自动有一个系统把它解释成授权。

晚上，房间重新安静下来。

你听见自己的呼吸。

不稳定。

没有优化。

也没有旁白替它说明意义。`,
    },
  ],
  report: {
    title: 'FINAL OFFLINE REPORT',
    statusLines: [
      { label: '语气', value: '已终止' },
      { label: '反馈', value: '已终止' },
      { label: '权限', value: '全部撤销' },
      { label: '自我边界', value: '自主但暴露' },
    ],
    paragraphs: [
      {
        kind: 'narration',
        text: `你关闭了一个确实帮助过你的系统。

这不证明你已经不再需要帮助。

也不证明独自承担一定更高贵。

你只是决定：

即使某些选择会做错，

即使噪声会回来，

即使自由并不总是带来自豪感，

这些部分仍然需要重新经过你。`,
      },
    ],
    variants: [
      {
        id: 'active_disconnection_late_revocation',
        when: {
          op: 'all',
          conditions: [
            { op: 'stat', stat: 'control', gte: 8 },
            { op: 'stat', stat: 'selfAcceptance', lte: 7 },
          ],
        },
        blocks: [
          {
            kind: 'narration',
            text: `这次关闭也许来自突然抵抗。
它仍然是一项真实发生的权限撤回。`,
          },
        ],
      },
      {
        id: 'active_disconnection_active_responsibility',
        when: {
          op: 'all',
          conditions: [
            { op: 'stat', stat: 'selfAcceptance', gte: 12 },
            { op: 'stat', stat: 'control', lte: 2 },
          ],
        },
        blocks: [
          {
            kind: 'narration',
            text: '你没有把关闭当作胜利。你只是重新承担了答案不稳定、后果不整齐的生活。',
          },
        ],
      },
    ],
  },
  pathEchoes,
  finalLine: [
    {
      kind: 'quote',
      text: `那不是一个更好的声音。

只是你的声音。`,
      pacing: 'slow',
    },
  ],
} satisfies EndingDefinition
