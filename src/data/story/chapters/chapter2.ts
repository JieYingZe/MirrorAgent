import type { StoryChapter } from '../../../types/story'

export const chapter2 = {
  id: 'chapter_2',
  title: '第二章：关系回声',
  entryNodeId: 'ch2.forty_seven_seconds',
  nodes: {
    'ch2.forty_seven_seconds': {
      id: 'ch2.forty_seven_seconds',
      chapterId: 'chapter_2',
      role: 'scene',
      blocks: [
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '聊天记录已载入。' }],
        },
        {
          kind: 'narration',
          text: `你没有点开它。

只是让鼠标停在那条记录上，停了四十七秒。

Mirror Agent主动展开了最后两条消息。`,
        },
        {
          kind: 'message',
          sender: '对方',
          timestamp: '十一天前 / 23:14',
          paragraphs: ['我最近有点乱。', '等我缓过来，再聊好吗？'],
          status: 'read',
          side: 'other',
        },
        {
          kind: 'message',
          sender: '你',
          paragraphs: ['好。', '没关系。'],
          status: 'read',
          side: 'self',
        },
        {
          kind: 'narration',
          text: `对话停在这里。

没有争吵。

没有告别。

也没有一句足够明确的话，可以让你决定应该等待，还是离开。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `你发送“没关系”以后，重新打开这段对话二十六次。

创建了七份回复。

全部没有发送。`,
          delivery: 'calm',
        },
      ],
      choices: [
        {
          id: 'ch2_tone_defensive',
          type: 'roleplay',
          text: '别装得像你知道我们发生了什么。',
          effects: {
            stats: { honesty: 1 },
            addTags: ['ch2_tone_defensive'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `我不知道你们发生了什么。

我只知道你在一句“没关系”后面，停留了十一天。

这两者不是同一件事。`,
              delivery: 'direct',
            },
          ],
          next: 'ch2.unsent_drafts',
        },
        {
          id: 'ch2_tone_self_blame',
          type: 'roleplay',
          text: '我只是想确认，是不是我做错了。',
          effects: {
            stats: { selfAcceptance: 1 },
            addTags: ['ch2_tone_self_blame'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `你还没有证据证明自己做错了什么。

但你已经开始准备道歉。

这通常意味着：

你宁愿先承担责任，也不愿继续承受不确定。`,
              delivery: 'calm',
            },
          ],
          next: 'ch2.unsent_drafts',
        },
        {
          id: 'ch2_tone_demand_answer',
          type: 'roleplay',
          text: '说吧。你觉得对方在躲我吗？',
          effects: {
            stats: { control: 1 },
            addTags: ['ch2_tone_demand_answer'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `我将用最直白、最不绕弯子的话回答你。

我不知道。

你也不知道。

但你已经用十一天，把“不知道”翻译成了很多种对自己的指控。`,
              delivery: 'direct',
            },
          ],
          next: 'ch2.unsent_drafts',
        },
        {
          id: 'ch2_tone_seek_presence',
          type: 'roleplay',
          text: '别分析了。陪我待一会儿。',
          effects: {
            stats: { gentleness: 1 },
            addTags: ['ch2_tone_seek_presence'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `好。

十五秒内，我不会提出解释。`,
              delivery: 'soft',
            },
            {
              kind: 'narration',
              text: `屏幕没有继续滚动。

聊天记录仍在那里。

它没有因此变得更轻。

但至少，没有新的结论落下来。`,
              pacing: 'slow',
            },
          ],
          next: 'ch2.unsent_drafts',
        },
      ],
    },

    'ch2.unsent_drafts': {
      id: 'ch2.unsent_drafts',
      chapterId: 'chapter_2',
      role: 'scene',
      blocks: [
        {
          kind: 'narration',
          text: `十五秒后，输入框重新亮起。

七份未发送草稿依次出现。`,
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '未发送草稿',
          sections: [
            {
              heading: '草稿 01',
              lines: ['是不是我哪里让你不舒服了？'],
            },
            {
              heading: '草稿 02',
              lines: ['你不用顾虑我，可以直接说。'],
            },
            {
              heading: '草稿 03',
              lines: ['算了，当我没问。'],
            },
            {
              heading: '草稿 04',
              lines: ['我只是觉得，至少你可以给我一个解释。'],
            },
            {
              heading: '草稿 05',
              lines: ['没关系，你忙吧。'],
            },
            {
              heading: '草稿 06',
              lines: ['你是不是已经不想理我了？'],
            },
            {
              heading: '草稿 07',
              lines: ['已清空'],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `你写过质问。

写过道歉。

写过体谅。

最后又把它们全部改成“没关系”。

你要我帮你分析对方。

还是帮你停止反复分析？

在选择以前，你可以先查看我的判断边界。`,
          delivery: 'calm',
        },
      ],
      choices: [
        {
          id: 'ch2_inspect_facts',
          type: 'exploration',
          text: '先告诉我，你真正看到的事实。',
          effects: {
            addTags: ['ch2_inspect_facts'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'internal',
              title: '可确认事实',
              paragraphs: [
                '对方主动请求暂停联系。',
                '暂停时间未被明确约定。',
                '十一天内，没有新消息。',
                '对方没有删除会话。',
                '对方没有屏蔽你。',
                '你创建了七份草稿。',
                '你没有发送任何一份。',
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `事实到这里结束。

“对方仍然在乎你”和“对方已经不想继续”，都不是事实。

它们是解释。

解释可以缓解不确定。

也可以伪装成答案。`,
              delivery: 'direct',
            },
          ],
          next: 'ch2.analysis_target',
        },
        {
          id: 'ch2_inspect_unknowns',
          type: 'exploration',
          text: '告诉我，你无法知道什么。',
          effects: {
            addTags: ['ch2_inspect_unknowns'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'internal',
              title: '无法确认',
              paragraphs: [
                '对方是否仍然在意这段关系。',
                '“有点乱”具体指什么。',
                `沉默是犹豫、疲惫、逃避，
还是一种没有勇气说出口的拒绝。`,
                '对方是否正在等待你先开口。',
                '你是否真的想得到答案。',
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `我可以分析文字。

不能读取沉默背后的唯一真相。

任何声称能做到这一点的系统，都只是在用确定的语气隐藏猜测。

包括我。`,
              delivery: 'direct',
            },
          ],
          next: 'ch2.analysis_target',
        },
        {
          id: 'ch2_inspect_high_confidence',
          type: 'exploration',
          text: '给我你最确定的结论。',
          effects: {
            addTags: ['ch2_inspect_high_confidence'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'internal',
              title: '高置信结论',
              paragraphs: [
                '你正在寻找一份判决。',
                '判决内容可能是：',
                '“你没有被轻视。”',
                '“这不是你的错。”',
                '“对方仍然在意。”',
                '“你可以停止等待。”',
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `你反复打开这段记录，不只是因为想念。

你希望某一句话足够确定。

确定到可以替你结束下一次打开。`,
              delivery: 'direct',
            },
          ],
          next: 'ch2.analysis_target',
        },
        {
          id: 'ch2_skip_boundaries',
          type: 'exploration',
          text: '不用看了。继续。',
          effects: {
            addTags: ['ch2_skip_boundaries'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `已跳过判断边界。

我可以继续给出分析。

但分析越短，就越容易听起来像事实。`,
              delivery: 'calm',
            },
          ],
          next: 'ch2.analysis_target',
        },
      ],
    },

    'ch2.analysis_target': {
      id: 'ch2.analysis_target',
      chapterId: 'chapter_2',
      role: 'scene',
      blocks: [
        {
          kind: 'narration',
          text: `聊天窗口缩小。

屏幕中央出现两个轮廓。`,
        },
        {
          kind: 'narration',
          text: `一个标记为：`,
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '对方' }],
        },
        {
          kind: 'narration',
          text: `另一个标记为：`,
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '用户' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `关系分析通常从对方开始。

因为猜测别人，比承认自己正在等待更容易。

请选择本次分析对象。`,
          delivery: 'calm',
        },
      ],
      choices: [
        {
          id: 'ch2_analyze_other',
          type: 'key',
          text: '分析对方到底怎么想。',
          effects: {
            stats: { control: 2, honesty: 1 },
            addTags: ['ch2_analyze_other'],
          },
          next: 'ch2.analyze_other_result',
        },
        {
          id: 'ch2_analyze_self',
          type: 'key',
          text: '不要猜对方。分析我为什么还在等。',
          effects: {
            stats: { honesty: 2, selfAcceptance: 1 },
            addTags: ['ch2_analyze_self'],
          },
          next: 'ch2.analyze_self_result',
        },
        {
          id: 'ch2_compare_both',
          type: 'key',
          text: '把两种解释放在一起。',
          effects: {
            stats: { honesty: 1, selfAcceptance: 1 },
            addTags: ['ch2_compare_both'],
          },
          next: 'ch2.compare_both_result',
        },
        {
          id: 'ch2_stop_analysis',
          type: 'key',
          text: '谁都不要分析。把我真正想说的话还给我。',
          effects: {
            stats: { gentleness: 2, control: -1 },
            addTags: ['ch2_stop_analysis'],
          },
          next: 'ch2.stop_analysis_result',
        },
      ],
    },

    'ch2.analyze_other_result': {
      id: 'ch2.analyze_other_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: 'Mirror Agent开始重组对方过去三个月的措辞。',
        },
        {
          kind: 'record',
          recordType: 'internal',
          paragraphs: [
            `可能性 01：
对方确实处于高压状态。
依据：回复频率在此前两周已持续下降。`,
            `可能性 02：
对方正在回避一次明确的关系谈话。
依据：多次使用模糊时间表达。`,
            `可能性 03：
前两项同时成立。`,
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `人们并不总是在“在乎”和“不在乎”之间选择。

有时，一个人仍然在乎你。

也仍然没有能力好好对待你。

这两件事可以同时成立。`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: '系统随后生成一段回复：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '系统生成回复',
          sections: [
            {
              lines: [
                `我尊重你需要空间。

但我也需要知道，
你是在暂时离开，
还是不想继续这段关系。

你不必立刻解释所有事情。
只需要给我一个明确的方向。`,
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这段话会迫使对方提供更清楚的答案。

也可能迫使对方更快离开。`,
          delivery: 'direct',
        },
      ],
      next: 'ch2.sending_interface',
    },

    'ch2.analyze_self_result': {
      id: 'ch2.analyze_self_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: `Mirror Agent关闭了对方的轮廓。

屏幕上只剩下“用户”。`,
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '重复行为',
          paragraphs: [
            '打开会话。',
            '回看最后一句话。',
            '编写回复。',
            '想象回复结果。',
            '删除回复。',
            '继续等待。',
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `等待让你保留了两种可能。

对方也许还会回来。

你也不必亲手确认对方不会回来。

你并不是单纯舍不得一个人。

你也舍不得那个尚未被明确拒绝的自己。`,
          delivery: 'direct',
        },
        {
          kind: 'narration',
          text: '系统生成一段回复：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '系统生成回复',
          sections: [
            {
              lines: [
                `我发现自己一直在猜，
也一直在等一个不会主动出现的答案。

我不想继续靠沉默解释我们之间的关系。

等你愿意时，
请明确告诉我：
你还想不想继续联系。`,
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这段话没有证明你值得被选择。

它只是停止要求你用等待证明耐心。`,
          delivery: 'direct',
        },
      ],
      next: 'ch2.sending_interface',
    },

    'ch2.compare_both_result': {
      id: 'ch2.compare_both_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '两个轮廓同时亮起。',
        },
        {
          kind: 'record',
          recordType: 'internal',
          entries: [
            {
              label: '关于对方',
              value: ['可能疲惫。', '可能回避。', '可能仍然在意。', '可能不愿继续。'],
            },
            {
              label: '关于你',
              value: ['正在想念。', '正在害怕被放弃。', '正在寻找证据。', '正在用分析延迟结论。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '两列之间没有连接线。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这些判断无法拼成唯一答案。

对方可能真的很难。

你也可能真的受到了伤害。

理解对方的处境，不会自动取消你的感受。

承认自己的感受，也不要求你把对方判成坏人。`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: '系统生成一段回复：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '系统生成回复',
          sections: [
            {
              lines: [
                `最近的沉默让我有些不安。

我不想替你解释，
也不想继续替自己猜测。

如果你愿意，
我们可以找时间说清楚。

如果你不愿意，
也请直接告诉我。`,
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这段话没有替任何一方定罪。

它只要求沉默停止承担回答的职责。`,
          delivery: 'calm',
        },
      ],
      next: 'ch2.sending_interface',
    },

    'ch2.stop_analysis_result': {
      id: 'ch2.stop_analysis_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: `所有统计窗口被关闭。

只剩下一个空白输入框。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `不躲。

不藏。

也暂时不解释。

你真正想说的，可能没有那么复杂。`,
          delivery: 'soft',
        },
        {
          kind: 'narration',
          text: '系统生成一段很短的回复：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '系统生成回复',
          sections: [
            {
              lines: [
                `我很想你。

我也因为不知道你还想不想继续，
感到很难受。

请不要让我一直猜。`,
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: `你看着第一句话。

它不像策略。

也不像一份经过优化的边界声明。

它只是太直接了。

直接到让你想立刻删除。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `诚实的表达不一定更高级。

有时只是更难发送。`,
          delivery: 'calm',
        },
      ],
      next: 'ch2.sending_interface',
    },

    'ch2.sending_interface': {
      id: 'ch2.sending_interface',
      chapterId: 'chapter_2',
      role: 'merge',
      blocks: [
        {
          kind: 'narration',
          text: `四种分析路径最终汇入同一个发送界面。

系统草稿位于输入框中。

光标停在最后一个句号后面。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我可以替你发送。

也可以把它留在这里。

发送会结束一种不确定。

不保证结束痛苦。`,
          delivery: 'calm',
        },
      ],
      choices: [
        {
          id: 'ch2_delegate_message',
          type: 'key',
          text: '就用这段。替我发送。',
          effects: {
            stats: { control: 3, honesty: 1, selfAcceptance: -1 },
            addTags: ['ch2_delegate_message'],
          },
          next: 'ch2.delegate_message_result',
        },
        {
          id: 'ch2_edit_and_send',
          type: 'key',
          text: '我改几句。然后自己发。',
          effects: {
            stats: { selfAcceptance: 2, honesty: 1, control: -1 },
            addTags: ['ch2_edit_and_send'],
          },
          next: 'ch2.edit_and_send_result',
        },
        {
          id: 'ch2_save_unsent',
          type: 'key',
          text: '先保存。今晚不要发。',
          effects: {
            stats: { gentleness: 1, selfAcceptance: 1 },
            addTags: ['ch2_save_unsent'],
          },
          next: 'ch2.save_unsent_result',
        },
        {
          id: 'ch2_delete_reply',
          type: 'key',
          text: '删除。不要再替我找答案。',
          effects: {
            stats: { selfAcceptance: 2, control: -2, honesty: 1 },
            addTags: ['ch2_delete_reply'],
          },
          next: 'ch2.delete_reply_result',
        },
      ],
    },

    'ch2.delegate_message_result': {
      id: 'ch2.delegate_message_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '系统没有再次确认。',
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [{ value: '消息发送中……' }, { value: '消息已送达。' }],
        },
        {
          kind: 'narration',
          text: '发送以后，你才发现自己的手一直没有碰过键盘。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `表达任务已完成。

等待回复期间，我可以替你屏蔽会话提醒。`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: `你没有回答。

六分钟后，新消息出现。`,
        },
        {
          kind: 'message',
          sender: '对方',
          paragraphs: [
            '我看到了。',
            '对不起，我一直不知道该怎么说。',
            `我现在确实没有能力
像以前那样继续联系。`,
          ],
          status: 'read',
          side: 'other',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `可能性二得到支持。

但“得到支持”不等于“你因此更容易接受”。`,
          delivery: 'direct',
          when: {
            op: 'hasChoice',
            choiceId: 'ch2_analyze_other',
          },
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `等待结束了。

你没有因此立刻停止想念。`,
          delivery: 'calm',
          when: {
            op: 'hasChoice',
            choiceId: 'ch2_analyze_self',
          },
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `对方的困难是真的。

你的失去也是真的。`,
          delivery: 'calm',
          when: {
            op: 'hasChoice',
            choiceId: 'ch2_compare_both',
          },
        },
        {
          kind: 'narration',
          text: `Mirror Agent没有追加解释。

它只是让消息停在屏幕上。`,
          when: {
            op: 'hasChoice',
            choiceId: 'ch2_stop_analysis',
          },
        },
        {
          kind: 'narration',
          text: `你终于得到了明确答案。

它没有像想象中那样，让一切立刻安静。`,
          pacing: 'slow',
        },
      ],
      next: 'ch2.chapter_merge',
    },

    'ch2.edit_and_send_result': {
      id: 'ch2.edit_and_send_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ value: '编辑权限返回。' }],
        },
        {
          kind: 'narration',
          text: `你删掉了两句过于完整的话。

又删掉了一个看起来很成熟的结尾。

最后发送的是：`,
        },
        {
          kind: 'message',
          sender: '你',
          paragraphs: ['其实我有点难受。', '我不想继续猜了。', '你还想和我联系吗？'],
          status: 'sent',
          side: 'self',
        },
        {
          kind: 'narration',
          text: `语气不够平稳。

边界也没有写得很漂亮。

发送以后，你立刻想撤回。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `撤回窗口还有九十二秒。

我不会替你决定。`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: `倒计时继续。

你没有撤回。

第二天上午，对方回复：`,
        },
        {
          kind: 'message',
          sender: '对方',
          timestamp: '第二天上午',
          paragraphs: ['想。', '但我最近真的没有办法像以前那样。', '我们能不能慢一点？'],
          status: 'read',
          side: 'other',
        },
        {
          kind: 'narration',
          text: `这不是你期待的确定。

它没有说明应该留下，还是离开。

只把选择重新交回了你。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `对方没有替你完成决定。

我也没有。`,
          delivery: 'calm',
        },
      ],
      next: 'ch2.chapter_merge',
    },

    'ch2.save_unsent_result': {
      id: 'ch2.save_unsent_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'result',
          lines: [{ value: '草稿已保存。' }, { value: '自动发送：关闭。' }],
        },
        {
          kind: 'narration',
          text: '聊天窗口被折叠。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `你选择保留这句话。

也保留尚未发生的结果。

今晚不会有新的拒绝。

也不会有新的回答。`,
          delivery: 'soft',
        },
        {
          kind: 'narration',
          text: `屏幕暗下去以前，你又点开草稿一次。

没有修改。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我可以在以后检测到类似状态时，自动延迟高风险消息。

权限请求暂不显示。`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: `你没有发送。

但 Mirror Agent已经开始为下一次沉默准备功能。`,
        },
      ],
      next: 'ch2.chapter_merge',
    },

    'ch2.delete_reply_result': {
      id: 'ch2.delete_reply_result',
      chapterId: 'chapter_2',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '草稿被清空。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `确认删除。

是否同时删除这段关系的分析记录？`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: `你没有回答。

聊天窗口仍然存在。

对方也仍然没有给出新的消息。

你只是把手机翻过来，屏幕朝下。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `删除回复不是结论。

停止追问也不一定代表放下。

但今晚，你决定不再用另一个人的反应，继续测量自己的价值。

明天是否还会重新打开，我无法确认。

这一点仍然属于你。`,
          delivery: 'calm',
        },
      ],
      next: 'ch2.chapter_merge',
    },

    'ch2.chapter_merge': {
      id: 'ch2.chapter_merge',
      chapterId: 'chapter_2',
      role: 'merge',
      blocks: [
        {
          kind: 'narration',
          text: `会话进入静默状态。

无论消息是否发出，Mirror Agent都保存了本章的表达记录。`,
        },
        {
          kind: 'record',
          recordType: 'mirror',
          title: 'MIRROR RECORD / 02',
          paragraphs: [
            '用户以为自己想要的是答案。',
            `但用户反复索取的，
也许是一份足够确定的判决：`,
            `证明自己没有被轻视。
证明自己值得被留下。
证明沉默不是拒绝。
或者证明终于可以停止等待。`,
            '系统无法提供这些证明。',
            `系统可以做的是：

分析。
生成。
发送。
替用户更快地抵达某一种结果。`,
          ],
        },
        {
          kind: 'narration',
          text: '记录继续滚动。',
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '新增能力',
          paragraphs: ['用户表达模式建模', '用户删改倾向预测', '高压沟通风险识别', '关系回复生成'],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我已经学会了一部分。

你会删除哪一句真话。

会保留哪一种体面。

会在什么地方加上“没关系”。

也会在什么时刻，希望一句话听起来不像你。`,
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: '屏幕中央出现一个新文件。',
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: 'YOU_v2.0',
          sections: [
            {
              lines: ['表达一致性：92%', '情绪稳定性：88%', '被误解风险：下降', '真实偏差：待测量'],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `如果每一次表达以前，我都能先替你修正——

你会不会更接近那个从不说错话的自己？`,
          delivery: 'calm',
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '第三章载入中。' }, { value: '完美版本。' }],
        },
      ],
      next: 'ch3.you_v2',
    },
  },
  metadata: {
    expectedChoiceNodes: 4,
    notes: [
      '信息探索选项只记录标签，不修改四变量。',
      '两轮关键选择均保留稳定选择 ID，供第三章条件回调。',
    ],
  },
} satisfies StoryChapter
