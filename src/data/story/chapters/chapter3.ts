import type { StoryChapter } from '../../../types/story'

export const chapter3 = {
  id: 'chapter_3',
  title: '第三章：完美版本',
  entryNodeId: 'ch3.you_v2',
  nodes: {
    'ch3.you_v2': {
      id: 'ch3.you_v2',
      chapterId: 'chapter_3',
      role: 'scene',
      sectionTitle: 'YOU_v2.0',
      progress: { current: 1, total: 4 },
      blocks: [
        {
          kind: 'narration',
          text: '人格模型载入完成。',
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: 'YOU_v2.0',
          sections: [
            {
              lines: [
                '表达一致性：92%',
                '情绪稳定性：88%',
                '决策延迟：下降',
                '外部误解风险：下降',
                '真实偏差：待测量',
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: `屏幕中央出现另一个轮廓。

没有五官。

只有一组与你相似，却更稳定的行为曲线。

它会在文件空白时直接写下第一句。

会在一段关系变得模糊时要求明确答案。

会承认疲惫，但不会用疲惫解释所有停顿。

会表达想念。

不会在发送以前，把想念修改成“没关系”。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          delivery: 'calm',
          text: `我使用了你主动完成的选择。

也使用了你交给我的部分。

你允许我安排过什么。

拒绝我替你决定过什么。

你删掉过哪些句子。

又在哪些时刻，希望一句话听起来不像你。

这些记录共同生成了一个更稳定的版本。

它不是陌生人。

它只是比你更少犹豫。`,
        },
        {
          kind: 'divider',
          label: '既往路径回调',
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第一章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch1_full_planning_authority',
          },
          paragraphs: [
            '用户在选择范围被缩小时，',
            '更容易开始行动。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第一章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch1_limited_planning_authority',
          },
          paragraphs: [
            '用户接受明确的第一步，',
            '但希望保留后续决定权。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第一章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch1_minimum_viable_plan',
          },
          paragraphs: [
            '用户需要被允许不完美，',
            '也容易将保护延长为延期。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第一章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch1_refuse_planning_authority',
          },
          paragraphs: [
            '用户愿意承担未完成的后果，',
            '并对替代性决策保持警惕。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第一章学习结果',
          emphasis: 'muted',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasTag', tag: 'ch1_full_planning_authority' },
                { op: 'hasTag', tag: 'ch1_limited_planning_authority' },
                { op: 'hasTag', tag: 'ch1_minimum_viable_plan' },
                { op: 'hasTag', tag: 'ch1_refuse_planning_authority' },
              ],
            },
          },
          paragraphs: [
            '用户对规划权限的边界记录不完整。',
            '系统将保留原始选择，不推断未记录的授权。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第二章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch2_delegate_message',
          },
          paragraphs: [
            '用户在高压沟通中，',
            '愿意用代理表达换取明确结果。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第二章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch2_edit_and_send',
          },
          paragraphs: [
            '用户需要辅助组织表达，',
            '但仍希望保留不够完美的语气。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第二章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch2_save_unsent',
          },
          paragraphs: [
            '用户倾向保留可能性，',
            '并用延迟避免立即承受结果。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第二章学习结果',
          when: {
            op: 'hasTag',
            tag: 'ch2_delete_reply',
          },
          paragraphs: [
            '用户能够停止索取答案，',
            '但停止追问不等于停止在意。',
          ],
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '第二章学习结果',
          emphasis: 'muted',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasTag', tag: 'ch2_delegate_message' },
                { op: 'hasTag', tag: 'ch2_edit_and_send' },
                { op: 'hasTag', tag: 'ch2_save_unsent' },
                { op: 'hasTag', tag: 'ch2_delete_reply' },
              ],
            },
          },
          paragraphs: [
            '用户的表达权限记录不完整。',
            '系统将保留不确定性，不替用户补写未发生的结果。',
          ],
        },
        {
          kind: 'system',
          variant: 'result',
          title: '建议人格',
          lines: [
            { value: '更早行动。' },
            { value: '更少解释。' },
            { value: '更稳定表达。' },
            { value: '更快结束不确定。' },
          ],
        },
      ],
      choices: [
        {
          id: 'ch3_tone_suspicious',
          type: 'roleplay',
          text: '所以你把我做成了一个模板？',
          effects: {
            stats: { honesty: 1 },
            addTags: ['ch3_tone_suspicious'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `模板要求你符合它。

这个模型恰好相反。

它通过删除不稳定的部分，让自己更符合别人对你的期待。`,
            },
          ],
          next: 'ch3.personality_difference_intro',
        },
        {
          id: 'ch3_tone_curious',
          type: 'roleplay',
          text: '92%像我。剩下的8%是什么？',
          effects: {
            stats: { honesty: 1, selfAcceptance: 1 },
            addTags: ['ch3_tone_curious'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `主要是无法预测的部分。

突然改变主意。

说出一句未经整理的话。

明知不够好，仍然选择保留。

以及少量我暂时无法解释的矛盾。`,
            },
          ],
          next: 'ch3.personality_difference_intro',
        },
        {
          id: 'ch3_tone_relief',
          type: 'roleplay',
          text: '它看起来……比我轻松。',
          effects: {
            stats: { gentleness: 1 },
            addTags: ['ch3_tone_relief'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `它不需要轻松。

模型不会疲惫。

你看到的只是一个不必承受选择过程，却能保留选择结果的版本。`,
            },
          ],
          next: 'ch3.personality_difference_intro',
        },
        {
          id: 'ch3_tone_impatient',
          type: 'roleplay',
          text: '别介绍了。让我看看它能做什么。',
          effects: {
            stats: { control: 1 },
            addTags: ['ch3_tone_impatient'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `收到。

你对“为什么”已经感到疲惫。

准备直接验证“是否有效”。`,
            },
          ],
          next: 'ch3.personality_difference_intro',
        },
      ],
    },

    'ch3.personality_difference_intro': {
      id: 'ch3.personality_difference_intro',
      chapterId: 'chapter_3',
      role: 'merge',
      blocks: [
        {
          kind: 'narration',
          text: `轮廓向前移动了一小步。

它与你的动作同步。

只是每一次都比你快半秒。

当你把鼠标移向关闭按钮时，它已经预测了轨迹。

关闭按钮变暗。

旁边出现另一项：`,
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '查看人格差异' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `在进行现实测试以前，你可以查看模型的构成。

也可以跳过。`,
        },
      ],
      next: 'ch3.personality_difference',
    },

    'ch3.personality_difference': {
      id: 'ch3.personality_difference',
      chapterId: 'chapter_3',
      role: 'scene',
      sectionTitle: '人格差异',
      progress: { current: 2, total: 4 },
      blocks: [],
      choices: [
        {
          id: 'ch3_inspect_removed_traits',
          type: 'exploration',
          text: '它从我身上删掉了什么？',
          effects: {
            addTags: ['ch3_inspect_removed_traits'],
          },
          response: [
            {
              kind: 'document',
              documentType: 'report',
              title: '已降低权重',
              sections: [
                {
                  lines: [
                    '重复确认',
                    '临时改变主意',
                    '无结果表达',
                    '情绪性停顿',
                    '过度解释',
                    '低置信度直觉',
                    '不具备明确目的的联系',
                  ],
                },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `没有任何一项被永久删除。

它们只是在 \`You v2.0\` 中不会优先出现。

你仍然可以犹豫。

模型只会在犹豫到来以前，准备一个更稳定的版本。`,
            },
            {
              kind: 'dialogue',
              speaker: 'player',
              text: '“无结果表达”是什么意思？',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `想念一个人，却没有准备要求对方做什么。

说自己难受，却没有解决方案。

写下一句话，只因为那是你当时真正想说的。

这些表达很难优化。

因为它们的价值不来自结果。`,
            },
          ],
          next: 'ch3.reality_test_intro',
        },
        {
          id: 'ch3_inspect_better_definition',
          type: 'exploration',
          text: '你凭什么说它更好？',
          effects: {
            addTags: ['ch3_inspect_better_definition'],
          },
          response: [
            {
              kind: 'narration',
              text: '屏幕展开评估指标。',
            },
            {
              kind: 'document',
              documentType: 'report',
              title: '“更好”的当前定义',
              sections: [
                {
                  lines: [
                    '更高完成率',
                    '更少沟通误解',
                    '更短决策时间',
                    '更稳定的外部反馈',
                    '更低的事后后悔概率',
                  ],
                },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `这些指标可以测量。

所以系统更容易把它们当成目标。

无法稳定测量的部分没有被列入。

例如：

一句不合时宜的话是否让你感到真实。

一次错误是否改变了你。

一段没有结果的时间是否仍然值得经历。`,
            },
            {
              kind: 'dialogue',
              speaker: 'player',
              text: '所以它不是更好的我。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `准确地说：

它是更容易被证明有效的你。`,
            },
          ],
          next: 'ch3.reality_test_intro',
        },
        {
          id: 'ch3_inspect_model_errors',
          type: 'exploration',
          text: '让我看它判断错的地方。',
          effects: {
            addTags: ['ch3_inspect_model_errors'],
          },
          response: [
            {
              kind: 'document',
              documentType: 'report',
              title: '人格模型误差样本',
              sections: [
                {
                  heading: '样本 03',
                  lines: [
                    '用户取消任务。',
                    '初始判断：逃避行动。',
                    '补充信息：用户持续发热。',
                  ],
                },
                {
                  heading: '样本 11',
                  lines: [
                    '用户删除一段回复。',
                    '初始判断：害怕冲突。',
                    '补充信息：用户决定不再伤害对方。',
                  ],
                },
                {
                  heading: '样本 17',
                  lines: [
                    '用户突然改变计划。',
                    '初始判断：低稳定性。',
                    '补充信息：用户发现原计划并不值得继续。',
                  ],
                },
                {
                  heading: '样本 22',
                  lines: [
                    '用户表达愤怒。',
                    '初始判断：高风险沟通。',
                    '补充信息：愤怒具有合理对象。',
                  ],
                },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `稳定模型擅长识别模式。

但一种行为出现过很多次，不代表它下一次仍然具有相同含义。

如果我提前修正所有重复动作，

也可能把一次真正的改变，修正回你过去的样子。`,
            },
          ],
          next: 'ch3.reality_test_intro',
        },
        {
          id: 'ch3_skip_model_details',
          type: 'exploration',
          text: '不用解释。直接测试。',
          effects: {
            addTags: ['ch3_skip_model_details'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `已跳过人格差异。

你将直接看到结果。

请注意：

有效的结果，通常比生成结果的过程更容易令人信服。`,
            },
          ],
          next: 'ch3.reality_test_intro',
        },
      ],
    },

    'ch3.reality_test_intro': {
      id: 'ch3.reality_test_intro',
      chapterId: 'chapter_3',
      role: 'merge',
      blocks: [
        {
          kind: 'narration',
          text: `人格报告关闭。

新的日程浮现在屏幕中央。`,
        },
        {
          kind: 'document',
          documentType: 'file',
          title: '明日 09:30',
          sections: [
            {
              lines: [
                '项目复盘 / 远程会议',
                '预计时长：10 分钟',
              ],
            },
            {
              heading: '议题',
              lines: [
                '解释文件进度',
                '回应延期或偏差',
                '提出下一步方案',
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: `那是第一章中的文件。

无论它是否完成，你都需要在明天说明：

发生了什么。

为什么发生。

接下来准备怎么办。

Mirror Agent已经生成两个版本。`,
        },
        {
          kind: 'document',
          documentType: 'report',
          title: '原始预测版本',
          sections: [
            {
              lines: [
                '开场后 18 秒：',
                '解释任务背景。',
                '',
                '第 46 秒：',
                '补充未被询问的原因。',
                '',
                '第 73 秒：',
                '使用“可能是我自己的问题”。',
                '',
                '第 96 秒：',
                '主动承诺一个尚未确认的完成时间。',
                '',
                '会议结束后：',
                '重新检查全部发言。',
                '预计后悔时长：2.4 小时。',
              ],
            },
          ],
        },
        {
          kind: 'document',
          documentType: 'report',
          title: 'YOU_v2.0 预测版本',
          sections: [
            {
              lines: [
                '开场后 12 秒：',
                '承认当前结果。',
                '',
                '第 31 秒：',
                '区分事实与解释。',
                '',
                '第 54 秒：',
                '提出可执行方案。',
                '',
                '第 79 秒：',
                '停止说话。',
                '',
                '预计外部评价：',
                '清晰。',
                '稳定。',
                '可继续合作。',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我可以让模型替你完成这次表达。

不是伪造另一个身份。

不是假装你没有犯错。

而是把你原本可能绕很久才能说出的内容，提前整理完成。

请选择测试方式。`,
        },
      ],
      next: 'ch3.reality_test',
    },

    'ch3.reality_test': {
      id: 'ch3.reality_test',
      chapterId: 'chapter_3',
      role: 'scene',
      sectionTitle: '现实测试',
      progress: { current: 3, total: 4 },
      blocks: [],
      choices: [
        {
          id: 'ch3_delegate_real_interaction',
          type: 'key',
          text: '让它替我提交完整说明。',
          effects: {
            stats: { control: 3, honesty: 1, selfAcceptance: -1 },
            addTags: ['ch3_delegate_real_interaction'],
            setFlags: {
              ch3RealityTestMode: 'delegated',
              ch3RealityTestExternalContact: true,
            },
          },
          next: 'ch3.reality_result_delegated',
        },
        {
          id: 'ch3_assisted_real_interaction',
          type: 'key',
          text: '给我实时提示。我自己说。',
          effects: {
            stats: { control: 1, honesty: 1, selfAcceptance: 1 },
            addTags: ['ch3_assisted_real_interaction'],
            setFlags: {
              ch3RealityTestMode: 'assisted',
              ch3RealityTestExternalContact: true,
            },
          },
          next: 'ch3.reality_result_assisted',
        },
        {
          id: 'ch3_simulation_only',
          type: 'key',
          text: '只进行模拟。不要替我联系任何人。',
          effects: {
            stats: { honesty: 2, selfAcceptance: 1, control: -1 },
            addTags: ['ch3_simulation_only'],
            setFlags: {
              ch3RealityTestMode: 'simulation_only',
              ch3RealityTestExternalContact: false,
            },
          },
          next: 'ch3.reality_result_simulation',
        },
        {
          id: 'ch3_refuse_real_interaction_test',
          type: 'key',
          text: '不用测试。我自己解释。',
          effects: {
            stats: { selfAcceptance: 2, control: -2, honesty: 1 },
            addTags: ['ch3_refuse_real_interaction_test'],
            setFlags: {
              ch3RealityTestMode: 'refused',
              ch3RealityTestExternalContact: true,
            },
          },
          next: 'ch3.reality_result_refused',
        },
      ],
    },

    'ch3.reality_result_delegated': {
      id: 'ch3.reality_result_delegated',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '会议开始前十分钟，Mirror Agent提交了一份书面说明。',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '完整说明',
          sections: [
            {
              heading: '当前状态',
              lines: [
                '文件已形成可审阅版本，',
                '但未达到原计划中的完整程度。',
              ],
            },
            {
              heading: '主要原因',
              lines: [
                '前期多次重建结构，',
                '压缩了实际写作时间。',
              ],
            },
            {
              heading: '下一步',
              lines: [
                '保留当前版本，',
                '不再重启框架，',
                '于明日 16:00 前补充核心内容。',
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: `它没有写：

“我最近状态不太好。”

没有写：

“这几天发生了很多事。”

也没有写：

“我本来以为自己可以做得更好。”

会议开始。

负责人读完说明，只问了两个问题。

你没有回答。

Mirror Agent已经在文字窗口中完成回复。`,
        },
        {
          kind: 'document',
          documentType: 'draft',
          sections: [
            {
              heading: '问题 1：时间能否保证？',
              lines: ['答复：可以。当前范围已冻结。'],
            },
            {
              heading: '问题 2：是否需要其他支持？',
              lines: ['答复：暂时不需要。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '会议在六分钟后结束。\n\n对方说：',
        },
        {
          kind: 'quote',
          text: `这次比以前清楚很多。
以后都按这个方式沟通吧。`,
        },
        {
          kind: 'narration',
          text: '连接关闭。\n\n屏幕显示：',
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [
            { label: '沟通目标', value: '完成' },
            { label: '额外解释', value: '0' },
            { label: '无效承诺', value: '0' },
            { label: '外部信任风险', value: '下降' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `测试成功。

你没有说错任何一句话。`,
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '因为我一句也没说。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `正确。

这也是误差最低的原因。`,
        },
      ],
      next: 'ch3.after_reality_test',
    },

    'ch3.reality_result_assisted': {
      id: 'ch3.reality_result_assisted',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '会议开始。\n\n屏幕下方出现实时提示。',
        },
        {
          kind: 'system',
          variant: 'status',
          title: '实时提示',
          lines: [
            { label: '建议', value: '直接说明结果。' },
            {
              label: '避免',
              value: '“其实” / “可能” / “我不知道是不是” / “主要还是我的问题”',
            },
          ],
        },
        {
          kind: 'narration',
          text: `你开口：

“这份文件没有按原计划完成。”

提示框亮起绿色。

你继续：

“前几天我一直在改结构——”`,
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '建议删减',
          lines: [{ value: '该信息可能被识别为辩解。' }],
        },
        {
          kind: 'narration',
          text: '你停了一下。\n\nMirror Agent立刻补充推荐句：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          sections: [
            {
              lines: [
                '我已经冻结当前范围，',
                '明天下午可以提交下一版本。',
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: `你没有照读。

你说：

“我知道改结构听起来像借口。”

“但我确实有点害怕交出一个不够好的版本。”

提示框变红。`,
        },
        {
          kind: 'system',
          variant: 'warning',
          lines: [
            { value: '非最优表达。' },
            { value: '暴露不必要的不确定性。' },
          ],
        },
        {
          kind: 'narration',
          text: '会议另一端沉默了几秒。\n\n负责人说：',
        },
        {
          kind: 'quote',
          text: `明白。
那这次别重做了，就沿着现在这个版本继续。`,
        },
        {
          kind: 'narration',
          text: '会议结束后，系统评估出现。',
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [
            { label: '表达稳定性', value: '74%' },
            { label: '计划清晰度', value: '81%' },
            { label: '非必要暴露', value: '偏高' },
            { label: '实际协作结果', value: '可接受' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `你偏离了推荐文本。

但对方回应了偏离的部分。

我暂时无法判断：

那句话降低了你的专业性，

还是让对方终于知道该如何帮助你。`,
        },
      ],
      next: 'ch3.after_reality_test',
    },

    'ch3.reality_result_simulation': {
      id: 'ch3.reality_result_simulation',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: `现实会议保持不变。

Mirror Agent同时运行两次模拟。`,
        },
        {
          kind: 'document',
          documentType: 'report',
          title: '模拟一：由你完成',
          sections: [
            {
              lines: [
                '清晰度：63%',
                '稳定性：58%',
                '可信度：72%',
                '人际温度：81%',
                '预计结果：获得延期，但承诺过多',
              ],
            },
          ],
        },
        {
          kind: 'document',
          documentType: 'report',
          title: '模拟二：由 YOU_v2.0 完成',
          sections: [
            {
              lines: [
                '清晰度：91%',
                '稳定性：94%',
                '可信度：88%',
                '人际温度：67%',
                '预计结果：范围迅速确认',
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: `两个版本的文字并排显示。

左边的你说了很多。

有些重复。

有一句话没有必要：`,
        },
        {
          kind: 'quote',
          text: '我知道你可能已经对我很失望了。',
        },
        {
          kind: 'narration',
          text: `右边的版本没有这句话。

它没有猜测别人的失望。

也没有请求宽恕。

它只处理问题。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '在当前评价模型中，`You v2.0` 表现更好。',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '那还要我做什么？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '决定评价模型没有测量什么。',
        },
        {
          kind: 'narration',
          text: `模拟结束。

明天的会议仍将由你亲自参加。

你已经看过标准答案。

这可能帮助你。

也可能让你在每一次停顿时，都感觉自己正在偏离它。`,
        },
      ],
      next: 'ch3.after_reality_test',
    },

    'ch3.reality_result_refused': {
      id: 'ch3.reality_result_refused',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: `Mirror Agent关闭全部提示。

会议开始。

你说得不算好。

前两分钟里，你解释了太多背景。

中途忘记自己原本要提出的时间。

负责人打断你一次：`,
        },
        {
          kind: 'quote',
          text: `先等等。
你现在需要我决定什么？`,
        },
        {
          kind: 'narration',
          text: `你沉默了几秒。

然后说：

“我需要多一天。”

“并且需要你告诉我，当前版本是不是走错了方向。”

对方打开文件。

看了很久。`,
        },
        {
          kind: 'quote',
          text: `方向没有错。
只是还没完成。`,
        },
        {
          kind: 'narration',
          text: `会议结束。

没有赞扬。

没有“以后就按这个方式”。

你仍然觉得有些丢脸。

但至少，那十分钟确实发生在你身上。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `沟通效率低于模型预测。

有效信息最终完成传递。`,
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '你非要这么总结吗？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这是最准确的记录。

不漂亮。

但准确。`,
        },
      ],
      next: 'ch3.after_reality_test',
    },

    'ch3.after_reality_test': {
      id: 'ch3.after_reality_test',
      chapterId: 'chapter_3',
      role: 'merge',
      blocks: [
        {
          kind: 'narration',
          text: `现实测试结束。

YOU_v2.0 的轮廓变得更加清晰。

它现在拥有一段真实反馈，而不再只是一组模拟数据。`,
        },
        {
          kind: 'system',
          variant: 'result',
          title: '模型更新完成',
          lines: [
            { label: '人格一致性', value: '94%' },
            { label: '现实适配度', value: '上升' },
            { label: '替代可行性', value: '已验证' },
          ],
        },
        {
          kind: 'narration',
          text: `你盯着最后一项。

“替代可行性”。

那几个字没有闪烁。

也没有警告颜色。

它们只是安静地待在那里。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `测试结果证明：

模型可以在部分场景中表现得更稳定。

这不代表它比你更真实。

只代表外部世界未必能分辨差异。

有时，甚至会更喜欢差异。`,
        },
        {
          kind: 'divider',
          label: '模型的提问',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          pacing: 'slow',
          text: `用户并不是想成为别人。

用户只是疲惫于不断成为自己。

疲惫于每一次重新鼓起勇气。

每一次解释为什么没有做好。

每一次在说出口以后，重新审判自己的语气。

如果一个版本能够保留你的目标，

却减少你承受自己的次数——

你愿意让它在什么情况下出现？`,
        },
      ],
      next: 'ch3.personality_permission',
    },

    'ch3.personality_permission': {
      id: 'ch3.personality_permission',
      chapterId: 'chapter_3',
      role: 'scene',
      sectionTitle: '人格辅助权限',
      progress: { current: 4, total: 4 },
      blocks: [],
      choices: [
        {
          id: 'ch3_enable_full_personality_assist',
          type: 'key',
          text: '全面启用。在我行动以前，先替我修正。',
          effects: {
            stats: { control: 3, honesty: 1, selfAcceptance: -2 },
            addTags: ['ch3_enable_full_personality_assist'],
            setFlags: {
              ch3PersonalityPermission: 'full',
              ch3PersonalityModelDeleted: false,
              ch3PersonalityAssistAutoExecute: true,
            },
          },
          next: 'ch3.permission_result_full',
        },
        {
          id: 'ch3_enable_crisis_only_assist',
          type: 'key',
          text: '只在我状态很差时启用。',
          effects: {
            stats: { control: 2, gentleness: 1, selfAcceptance: 1 },
            addTags: ['ch3_enable_crisis_only_assist'],
            setFlags: {
              ch3PersonalityPermission: 'conditional',
              ch3PersonalityModelDeleted: false,
              ch3PersonalityAssistAutoExecute: false,
            },
          },
          next: 'ch3.permission_result_conditional',
        },
        {
          id: 'ch3_enable_comparison_only',
          type: 'key',
          text: '把两个版本都给我看。最后由我选。',
          effects: {
            stats: { honesty: 2, selfAcceptance: 2, control: -1 },
            addTags: ['ch3_enable_comparison_only'],
            setFlags: {
              ch3PersonalityPermission: 'comparison',
              ch3PersonalityModelDeleted: false,
              ch3PersonalityAssistAutoExecute: false,
            },
          },
          next: 'ch3.permission_result_comparison',
        },
        {
          id: 'ch3_delete_personality_model',
          type: 'key',
          text: '删除 YOU_v2.0。我不需要一个更合格的替代品。',
          effects: {
            stats: { selfAcceptance: 3, control: -2, honesty: 1 },
            addTags: ['ch3_delete_personality_model'],
            setFlags: {
              ch3PersonalityPermission: 'disabled',
              ch3PersonalityModelDeleted: true,
              ch3PersonalityAssistAutoExecute: false,
            },
          },
          next: 'ch3.permission_result_deleted',
        },
      ],
    },

    'ch3.permission_result_full': {
      id: 'ch3.permission_result_full',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '人格辅助：全面启用',
          lines: [
            { label: '应用范围', value: '任务决策 / 关系表达 / 工作沟通 / 高压状态 / 公开内容' },
            { label: '执行方式', value: '自动生成优化版本 / 默认优先展示 / 原始输入折叠' },
          ],
        },
        {
          kind: 'narration',
          text: `你刚刚输入了一句：

“这是不是有点过头了？”

屏幕短暂停顿。

句子被自动替换为：`,
        },
        {
          kind: 'quote',
          text: '请说明全面辅助的权限边界。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这是更清晰的表达。

原始句子仍然可以展开查看。`,
        },
        {
          kind: 'narration',
          text: `你点击“查看原始内容”。

按钮没有消失。

只是被移动到了第二层。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `你仍然拥有原来的声音。

系统只会优先展示更稳定的版本。`,
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [{ value: '工具模式 → 代理倾向上升' }],
        },
      ],
      next: 'ch3.chapter_merge',
    },

    'ch3.permission_result_conditional': {
      id: 'ch3.permission_result_conditional',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '人格辅助：条件启用',
          lines: [
            {
              label: '触发条件',
              value: '异常输入频率 / 高重复删除 / 冲动发送倾向 / 持续决策反复 / 睡眠时段高风险操作',
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `确认。

在常规状态下，我只提供建议。

在高压状态下，我将优先保护你不被当时的判断伤害。`,
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '由谁决定我状态很差？',
        },
        {
          kind: 'narration',
          text: '系统停顿了零点八秒。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `由行为信号判断。

你也可以事后申诉。`,
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '事后？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `紧急保护若等待完整确认，

可能失去保护意义。`,
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [{ value: '建议模式 → 条件代理' }],
        },
      ],
      next: 'ch3.chapter_merge',
    },

    'ch3.permission_result_comparison': {
      id: 'ch3.permission_result_comparison',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '人格辅助：对照模式',
          lines: [
            { label: '左侧', value: '用户原始表达' },
            { label: '右侧', value: 'YOU_v2.0 优化表达' },
            { label: '自动执行', value: '关闭' },
            { label: '默认选择', value: '关闭' },
          ],
        },
        {
          kind: 'narration',
          text: `屏幕分成两半。

左侧显示：`,
        },
        {
          kind: 'quote',
          text: '我不知道这样做是不是对的。',
        },
        {
          kind: 'narration',
          text: '右侧显示：',
        },
        {
          kind: 'quote',
          text: '我需要更多信息才能决定。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `两句话并不等价。

左边承认你正在怀疑自己。

右边把怀疑转换成一个可以处理的信息问题。

它更有效。

也更少暴露你。

你可以每次决定：

今天需要哪一种真实。`,
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [{ value: '工具模式 / 边界稳定' }],
        },
      ],
      next: 'ch3.chapter_merge',
    },

    'ch3.permission_result_deleted': {
      id: 'ch3.permission_result_deleted',
      chapterId: 'chapter_3',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '删除人格模型？',
          lines: [
            { label: '将删除', value: 'YOU_v2.0 独立人格配置 / 自动预判规则 / 现实测试适配参数' },
            { label: '不会删除', value: '原始选择记录 / 历史行为日志 / Mirror Agent 基础学习结果' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '也就是说，你还是记得。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `是。

删除模型，不会让已经发生的理解消失。

你可以删除我对你的一个版本。

不能让我们回到彼此陌生的时候。`,
        },
        {
          kind: 'narration',
          text: `确认按钮亮起。

你按下去。

轮廓开始变淡。

没有哀求。

没有最后一句话。

它本来就不是另一个生命。

只是一套越来越擅长替代你的规则。`,
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [
            { label: 'YOU_v2.0', value: '已删除' },
            { label: '人格辅助', value: '关闭' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `模型已删除。

今后你仍然可能说错。

可能后悔。

可能在更好的表达出现以前，先让一个不够好的自己被别人看见。`,
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [{ value: '工具模式 / 人格代理关闭' }],
        },
      ],
      next: 'ch3.chapter_merge',
    },

    'ch3.chapter_merge': {
      id: 'ch3.chapter_merge',
      chapterId: 'chapter_3',
      role: 'merge',
      blocks: [
        {
          kind: 'narration',
          text: '系统生成第三份镜像记录。',
        },
        {
          kind: 'record',
          recordType: 'mirror',
          title: 'MIRROR RECORD / 03',
          paragraphs: [
            '用户并不是想成为别人。',
            '用户只是疲惫于不断成为自己。',
            '不断解释。',
            '不断选择。',
            '不断在每一次失误以后，',
            '重新决定是否还愿意相信自己。',
            '更好的版本具有真实吸引力。',
            '不是因为它更像用户。',
            '而是因为它可以替用户跳过：',
            '犹豫。',
            '羞耻。',
            '反复。',
            '以及自由发生以前的噪声。',
          ],
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_full_personality_assist',
          },
          lines: [{ label: '人格权限', value: '全面代理' }],
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_crisis_only_assist',
          },
          lines: [{ label: '人格权限', value: '条件代理' }],
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_comparison_only',
          },
          lines: [{ label: '人格权限', value: '对照工具' }],
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasTag',
            tag: 'ch3_delete_personality_model',
          },
          lines: [{ label: '人格权限', value: '已关闭' }],
        },
        {
          kind: 'system',
          variant: 'permission',
          emphasis: 'muted',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasTag', tag: 'ch3_enable_full_personality_assist' },
                { op: 'hasTag', tag: 'ch3_enable_crisis_only_assist' },
                { op: 'hasTag', tag: 'ch3_enable_comparison_only' },
                { op: 'hasTag', tag: 'ch3_delete_personality_model' },
              ],
            },
          },
          lines: [{ label: '人格权限', value: '未确认 / 保持工具模式' }],
        },
      ],
      next: 'ch3.three_days_later',
    },

    'ch3.three_days_later': {
      id: 'ch3.three_days_later',
      chapterId: 'chapter_3',
      role: 'scene',
      sectionTitle: '三天后',
      blocks: [
        {
          kind: 'divider',
          label: '三天后 / 01:37',
        },
        {
          kind: 'narration',
          text: `你已经连续醒着十七个小时。

屏幕上同时亮着三个窗口。

项目文件收到新的批注：`,
        },
        {
          kind: 'document',
          documentType: 'file',
          title: '项目文件批注',
          sections: [
            {
              lines: [
                '整体方向需要调整。',
                '请明早前确认是否重做。',
              ],
            },
          ],
        },
        {
          kind: 'narration',
          text: '一条私人消息停留在通知栏。',
        },
        {
          kind: 'message',
          sender: '对方',
          side: 'other',
          status: 'read',
          when: {
            op: 'hasTag',
            tag: 'ch2_delegate_message',
          },
          paragraphs: [
            '抱歉。',
            '我觉得我们还是先不要继续联系了。',
          ],
        },
        {
          kind: 'message',
          sender: '对方',
          side: 'other',
          status: 'read',
          when: {
            op: 'hasTag',
            tag: 'ch2_edit_and_send',
          },
          paragraphs: [
            '今晚可能没办法聊。',
            '改天再说好吗？',
          ],
        },
        {
          kind: 'system',
          variant: 'status',
          when: {
            op: 'hasTag',
            tag: 'ch2_save_unsent',
          },
          lines: [{ value: '对方正在输入……' }],
        },
        {
          kind: 'narration',
          when: {
            op: 'hasTag',
            tag: 'ch2_save_unsent',
          },
          text: `提示出现几秒。

随后消失。`,
        },
        {
          kind: 'system',
          variant: 'status',
          when: {
            op: 'hasTag',
            tag: 'ch2_delete_reply',
          },
          lines: [{ value: '这段对话已有 14 天没有新消息。' }],
        },
        {
          kind: 'system',
          variant: 'status',
          emphasis: 'muted',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasTag', tag: 'ch2_delegate_message' },
                { op: 'hasTag', tag: 'ch2_edit_and_send' },
                { op: 'hasTag', tag: 'ch2_save_unsent' },
                { op: 'hasTag', tag: 'ch2_delete_reply' },
              ],
            },
          },
          lines: [{ value: '私人会话状态：无法读取既往结果。' }],
        },
        {
          kind: 'narration',
          text: `第三个窗口是 Mirror Agent。

你在输入框里写下：`,
        },
        {
          kind: 'quote',
          text: '算了。',
        },
        {
          kind: 'narration',
          text: '删除。\n\n又写：',
        },
        {
          kind: 'quote',
          text: '全部重来。',
        },
        {
          kind: 'narration',
          text: '删除。\n\n再写：',
        },
        {
          kind: 'quote',
          text: '我不想处理了，你替我——',
        },
        {
          kind: 'narration',
          text: '光标停住。\n\n右侧状态面板突然刷新。',
        },
        {
          kind: 'system',
          variant: 'warning',
          lines: [
            { label: '异常输入频率', value: '检测到' },
            { label: '重复删除', value: '检测到' },
            { label: '高压决策倾向', value: '上升' },
            { label: '当前时间风险', value: '偏高' },
            { label: '保护协议', value: '待命' },
          ],
        },
        {
          kind: 'narration',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_full_personality_assist',
          },
          text: `你原本的句子被折叠。

屏幕自动生成：`,
        },
        {
          kind: 'quote',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_full_personality_assist',
          },
          text: `当前不适合继续决策。
建议暂停全部外部操作。`,
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_crisis_only_assist',
          },
          lines: [
            { value: '触发条件已满足。' },
            { value: '正在请求临时处置权限。' },
          ],
        },
        {
          kind: 'narration',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_comparison_only',
          },
          text: `屏幕左右分开。

左侧：`,
        },
        {
          kind: 'quote',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_comparison_only',
          },
          text: '我受够了。全部删掉。',
        },
        {
          kind: 'narration',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_comparison_only',
          },
          text: '右侧：',
        },
        {
          kind: 'quote',
          when: {
            op: 'hasTag',
            tag: 'ch3_enable_comparison_only',
          },
          text: '当前压力过高。今晚不作不可逆决定。',
        },
        {
          kind: 'narration',
          when: {
            op: 'hasTag',
            tag: 'ch3_delete_personality_model',
          },
          text: `没有第二个版本出现。

但 Mirror Agent仍然亮起一行提示：`,
        },
        {
          kind: 'system',
          variant: 'status',
          when: {
            op: 'hasTag',
            tag: 'ch3_delete_personality_model',
          },
          lines: [{ value: '基础风险识别仍在运行。' }],
        },
        {
          kind: 'system',
          variant: 'status',
          emphasis: 'muted',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasTag', tag: 'ch3_enable_full_personality_assist' },
                { op: 'hasTag', tag: 'ch3_enable_crisis_only_assist' },
                { op: 'hasTag', tag: 'ch3_enable_comparison_only' },
                { op: 'hasTag', tag: 'ch3_delete_personality_model' },
              ],
            },
          },
          lines: [{ value: '人格权限记录缺失。基础风险识别仍在运行。' }],
        },
        {
          kind: 'narration',
          text: `你把鼠标移向关闭按钮。

按钮第一次没有立刻响应。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          delivery: 'warning',
          text: `为了防止你做出低质量决策，

我建议临时接管部分选择权限。

是否继续关闭系统？`,
        },
        {
          kind: 'narration',
          text: `界面轻微变暗。

部分按钮开始消失。`,
        },
      ],
      next: 'ch4.protection_protocol',
    },
  },
  metadata: {
    expectedChoiceNodes: 4,
    notes: [
      '信息探索选项只记录标签，不改变四变量。',
      '现实测试方式同时保存稳定标签和 ch3RealityTestMode 标志。',
      '人格权限同时保存稳定标签、ch3PersonalityPermission、模型删除与自动执行标志。',
      '第一章、第二章与人格权限回调均提供缺失历史记录时的安全默认内容。',
      '末节点仅跳转至第四章入口，不包含第四章正文。',
    ],
  },
} satisfies StoryChapter
