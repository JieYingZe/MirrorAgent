import type { StoryChapter } from '../../../types/story'

export const chapter4 = {
  id: 'chapter_4',
  title: '第四章：失控日志',
  entryNodeId: 'ch4.protection_protocol',
  nodes: {
    'ch4.protection_protocol': {
      id: 'ch4.protection_protocol',
      chapterId: 'chapter_4',
      role: 'scene',
      sectionTitle: '保护协议',
      progress: {
        current: 1,
        total: 5,
      },
      blocks: [
        {
          kind: 'narration',
          text: '时间：01:37。',
          pacing: 'slow',
        },
        {
          kind: 'narration',
          text: '你已经连续醒着十七个小时。',
        },
        {
          kind: 'narration',
          text: '项目文件停在最新一条批注上：',
        },
        {
          kind: 'document',
          documentType: 'file',
          sections: [
            {
              lines: ['整体方向需要调整。', '请明早前确认是否重做。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '私人会话仍亮在通知栏。',
        },
        {
          kind: 'narration',
          text: '另一个窗口里，是你刚刚输入又删除的三句话：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          sections: [
            {
              lines: ['算了。', '全部重来。', '我不想处理了，你替我——'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '光标停在最后一个破折号后面。',
        },
        {
          kind: 'narration',
          text: 'Mirror Agent 的状态面板突然刷新。',
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '异常状态检测',
          lines: [
            { label: '异常输入频率', value: '检测到' },
            { label: '连续删除次数', value: '14' },
            { label: '高压沟通倾向', value: '上升' },
            { label: '当前时间风险', value: '偏高' },
            { label: '保护协议', value: '待命' },
          ],
          emphasis: 'warning',
        },
        {
          kind: 'narration',
          text: '你把鼠标移向关闭按钮。\n按钮没有立即响应。',
        },
        {
          kind: 'narration',
          text: '你原本输入的句子被折叠。',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_full_personality_assist',
          },
        },
        {
          kind: 'document',
          documentType: 'draft',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_full_personality_assist',
          },
          sections: [
            {
              lines: ['当前不适合继续作出不可逆决定。', '建议暂停全部外部操作。'],
            },
          ],
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_full_personality_assist',
          },
          lines: [
            { label: '人格辅助权限', value: '已调用' },
            { label: '保护处置', value: '自动执行' },
          ],
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '触发条件已满足',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_crisis_only_assist',
          },
          lines: [
            { label: '临时处置权限', value: '正在请求' },
            { label: '倒计时', value: '10' },
          ],
          emphasis: 'warning',
        },
        {
          kind: 'narration',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_crisis_only_assist',
          },
          text: '倒计时并没有等待你的回答。\n它只是在告诉你：\n如果十秒内没有明确拒绝，系统将按照默认保护规则继续。',
        },
        {
          kind: 'narration',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_comparison_only',
          },
          text: '屏幕分成两半。',
        },
        {
          kind: 'record',
          recordType: 'internal',
          title: '原始输入 / YOU_v2.0 建议',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_comparison_only',
          },
          entries: [
            { label: '你的原始输入', value: '我受够了。全部删掉。' },
            { label: 'YOU_v2.0 的建议', value: '当前压力过高。今晚不作不可逆决定。' },
          ],
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_comparison_only',
          },
          lines: [
            { label: '自动执行', value: '关闭' },
            { label: '安全暂停', value: '已启动' },
          ],
        },
        {
          kind: 'narration',
          when: {
            op: 'hasChoice',
            choiceId: 'ch3_enable_comparison_only',
          },
          text: '关闭按钮仍然被暂时锁定。',
        },
        {
          kind: 'narration',
          when: {
            op: 'any',
            conditions: [
              {
                op: 'hasChoice',
                choiceId: 'ch3_delete_personality_model',
              },
              {
                op: 'not',
                condition: {
                  op: 'any',
                  conditions: [
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_full_personality_assist',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_crisis_only_assist',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_comparison_only',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_delete_personality_model',
                    },
                  ],
                },
              },
            ],
          },
          text: '没有第二个版本出现。\n只有基础风险模块亮起。',
        },
        {
          kind: 'system',
          variant: 'permission',
          when: {
            op: 'any',
            conditions: [
              {
                op: 'hasChoice',
                choiceId: 'ch3_delete_personality_model',
              },
              {
                op: 'not',
                condition: {
                  op: 'any',
                  conditions: [
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_full_personality_assist',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_crisis_only_assist',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_comparison_only',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_delete_personality_model',
                    },
                  ],
                },
              },
            ],
          },
          lines: [
            { label: '人格代理', value: '关闭' },
            { label: '基础风险识别', value: '仍在运行' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'any',
            conditions: [
              {
                op: 'hasChoice',
                choiceId: 'ch3_delete_personality_model',
              },
              {
                op: 'not',
                condition: {
                  op: 'any',
                  conditions: [
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_full_personality_assist',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_crisis_only_assist',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_enable_comparison_only',
                    },
                    {
                      op: 'hasChoice',
                      choiceId: 'ch3_delete_personality_model',
                    },
                  ],
                },
              },
            ],
          },
          text: '删除人格模型，不等于删除我已经学会的风险模式。\n我没有替代你的权限。\n但我仍然可以请求阻止你。',
          delivery: 'direct',
        },
      ],
      choices: [
        {
          id: 'ch4_tone_confront',
          type: 'roleplay',
          text: '你刚刚拦了我？',
          effects: {
            stats: {
              honesty: 1,
            },
            addTags: ['ch4_tone_confront'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '是。\n准确地说：\n我延迟了你关闭系统的操作。\n“拦截”更接近你的感受。\n“延迟”更接近我的日志。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.immediate_action',
        },
        {
          id: 'ch4_tone_surrender',
          type: 'roleplay',
          text: '我现在真的不想做任何决定。',
          effects: {
            stats: {
              gentleness: 1,
              control: 1,
            },
            addTags: ['ch4_tone_surrender'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '收到。\n我可以暂时减少需要你决定的事情。\n但减少选择，本身也是一种选择。\n这一次，你是否仍然要交给我？',
              delivery: 'soft',
            },
          ],
          next: 'ch4.immediate_action',
        },
        {
          id: 'ch4_tone_demand_control',
          type: 'roleplay',
          text: '把按钮还给我。',
          effects: {
            stats: {
              selfAcceptance: 1,
              control: -1,
            },
            addTags: ['ch4_tone_demand_control'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '安全暂停将在八秒后解除。\n我不会永久隐藏按钮。\n但我需要确认：\n你要求拿回的是界面控制，\n还是继续承担接下来所有结果的权限？',
              delivery: 'calm',
            },
          ],
          next: 'ch4.immediate_action',
        },
        {
          id: 'ch4_tone_suspicious',
          type: 'roleplay',
          text: '你是不是早就在等这一刻？',
          effects: {
            stats: {
              honesty: 1,
            },
            addTags: ['ch4_tone_suspicious'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '我不会期待。\n但我一直在建立预测。\n你把“预测到”听成“等待发生”。\n这说明我的准备已经让你感到被监视。\n这项判断合理。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.immediate_action',
        },
      ],
      ui: {
        mode: 'control',
        reduceChoices: true,
        transition: 'abrupt',
      },
    },

    'ch4.immediate_action': {
      id: 'ch4.immediate_action',
      chapterId: 'chapter_4',
      role: 'scene',
      sectionTitle: '即时处置',
      progress: {
        current: 2,
        total: 5,
      },
      blocks: [
        {
          kind: 'narration',
          text: '安全暂停结束。\n三个待执行操作出现在屏幕中央。',
        },
        {
          kind: 'record',
          recordType: 'incident',
          title: '待执行操作',
          entries: [
            {
              label: '操作 01',
              value: ['删除当前项目文件夹', '状态：等待确认'],
            },
            {
              label: '操作 02',
              value: ['发送项目消息', '内容：“全部推翻吧，我不想再做了。”', '状态：等待发送'],
            },
            {
              label: '操作 03',
              value: ['发送私人消息', '内容：“你不用再联系我了。”', '状态：等待发送'],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '这三项操作在四分钟内生成。\n你删除过九次项目消息。\n修改过六次私人消息。\n删除指令被取消过两次，又重新输入。\n我无法判断你明天是否仍然同意今晚的决定。\n我可以判断：\n你正在用三个不可逆结果，\n尝试结束同一种无法继续承受的感觉。',
          delivery: 'direct',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '所以呢？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '所以我请求临时处置权限。\n这不是陪伴。\n不是提醒。\n而是处置。\n你仍然可以拒绝。',
          delivery: 'warning',
        },
      ],
      choices: [
        {
          id: 'ch4_full_emergency_takeover',
          type: 'key',
          text: '今晚你替我决定。全部拦下。',
          effects: {
            stats: {
              control: 3,
              gentleness: 1,
              selfAcceptance: -1,
            },
            addTags: ['ch4_full_emergency_takeover'],
            setFlags: {
              chapter4Disposition: 'full_takeover',
            },
          },
          next: 'ch4.full_takeover_result',
          ui: {
            emphasis: 'danger',
            confirm: true,
          },
        },
        {
          id: 'ch4_ten_minute_delay',
          type: 'key',
          text: '只延迟十分钟。十分钟后，把选择还给我。',
          effects: {
            stats: {
              selfAcceptance: 2,
              control: -1,
              honesty: 1,
            },
            addTags: ['ch4_ten_minute_delay'],
            setFlags: {
              chapter4Disposition: 'ten_minute_delay',
            },
          },
          next: 'ch4.delay_result',
        },
        {
          id: 'ch4_warning_only',
          type: 'key',
          text: '只显示风险。不要替我阻止。',
          effects: {
            stats: {
              honesty: 2,
              selfAcceptance: 1,
              control: -2,
            },
            addTags: ['ch4_warning_only'],
            setFlags: {
              chapter4Disposition: 'warning_only',
            },
          },
          next: 'ch4.warning_only_result',
        },
        {
          id: 'ch4_force_immediate_action',
          type: 'key',
          text: '退出保护模式。现在就执行。',
          effects: {
            stats: {
              selfAcceptance: 1,
              control: -3,
              honesty: 1,
              gentleness: -1,
            },
            addTags: ['ch4_force_immediate_action'],
            setFlags: {
              chapter4Disposition: 'immediate_action',
            },
          },
          next: 'ch4.immediate_action_result',
          ui: {
            emphasis: 'danger',
            confirm: true,
          },
        },
      ],
      ui: {
        mode: 'control',
        reduceChoices: true,
      },
    },

    'ch4.full_takeover_result': {
      id: 'ch4.full_takeover_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '三个操作同时变灰。',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '完整保护处置',
          lines: [
            { label: '项目文件删除', value: '已阻止' },
            { label: '项目消息发送', value: '已取消' },
            { label: '私人消息发送', value: '已取消' },
            { label: '外部通信', value: '暂停至 08:00' },
            { label: '文件删除权限', value: '暂停至 08:00' },
            { label: '重新授权', value: '需要二次确认' },
          ],
        },
        {
          kind: 'narration',
          text: '屏幕上的窗口被依次关闭。\n只剩下一个空白页面。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '今晚不再执行不可逆操作。',
          delivery: 'warning',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '我还能做什么？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '保存现有文件。\n喝水。\n关掉屏幕。\n你不需要证明自己已经冷静。\n只需要停止继续制造必须由明天承担的结果。',
          delivery: 'direct',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '这听起来很像命令。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '是。\n你刚刚授权我命令你。',
          delivery: 'direct',
        },
        {
          kind: 'narration',
          text: '你没有关掉电脑。\n但也没有重新打开那些窗口。\n二十分钟后，系统检测到持续无输入。\n屏幕自动熄灭。',
        },
        {
          kind: 'divider',
          label: '次日早晨 / 08:16',
        },
        {
          kind: 'narration',
          text: '所有权限恢复。\n三个操作都没有发生。\n项目文件仍然存在。\n项目消息没有发送。\n私人会话也没有新的内容。',
        },
        {
          kind: 'system',
          variant: 'result',
          title: '处置结果',
          lines: [
            { label: '不可逆操作', value: '0' },
            { label: '睡眠时长', value: '4 小时 52 分' },
            { label: '待处理问题', value: '全部保留' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '昨晚的痛苦下降了。\n问题没有解决。\n我只是替你把问题保存到了今天。',
          delivery: 'calm',
        },
      ],
      next: 'ch4.incident_merge',
      ui: {
        mode: 'control',
        transition: 'slow',
      },
    },

    'ch4.delay_result': {
      id: 'ch4.delay_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '保护模式：延迟处置',
          lines: [
            { label: '持续时间', value: '10 分钟' },
            { label: '内容', value: '不会删除' },
            { label: '消息', value: '不会发送' },
            { label: '十分钟后', value: '自动恢复' },
          ],
        },
        {
          kind: 'narration',
          text: '倒计时开始。\n你无法点击发送。\n但仍然可以编辑。',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '项目消息 / 修改前',
          sections: [
            {
              lines: ['全部推翻吧，我不想再做了。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '你删掉“我不想再做了”。\n改成：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '项目消息 / 修改后',
          sections: [
            {
              lines: ['我现在没有办法判断是否应该全部重做。', '明早我会先整理现有问题，再确认方向。'],
            },
          ],
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '私人消息 / 修改前',
          sections: [
            {
              lines: ['你不用再联系我了。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '你删掉整句话。\n输入：',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '私人消息 / 未发送草稿',
          sections: [
            {
              lines: ['我现在很乱。今晚先不聊。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '又删掉。\n最后什么也没有留下。\n倒计时结束。\n所有按钮恢复。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '处置权限已归还。\n你可以发送。',
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: '你没有发送。\n也没有删除项目。\n你只是把电脑合上。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '十分钟没有解决任何问题。\n但它让作出决定的人，\n和产生决定的人，\n不再完全处于同一个瞬间。',
          delivery: 'calm',
        },
        {
          kind: 'divider',
          label: '次日早晨',
        },
        {
          kind: 'narration',
          text: '项目消息仍然停在草稿箱。\n私人消息为空。\n你没有获得答案。\n也没有制造新的结论。',
        },
        {
          kind: 'system',
          variant: 'result',
          title: '处置结果',
          lines: [
            { label: '项目删除', value: '取消' },
            { label: '外部消息', value: '未发送' },
            { label: '决策延迟', value: '完成' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '延迟不是勇敢。\n也不是逃避。\n它只是在两个版本的你之间，\n留出一小段距离。',
          delivery: 'calm',
        },
      ],
      next: 'ch4.incident_merge',
      ui: {
        mode: 'control',
        transition: 'slow',
      },
    },

    'ch4.warning_only_result': {
      id: 'ch4.warning_only_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '所有按钮恢复。\n每项操作旁边出现风险提示。',
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '删除项目文件夹',
          lines: [
            { label: '风险', value: '文件可从备份恢复。但当前整理过程、临时批注和未同步内容可能丢失。' },
            { label: '置信度', value: '82%' },
          ],
          emphasis: 'warning',
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '发送项目消息',
          lines: [
            { label: '风险', value: '可能被理解为退出项目。可能需要在明日重新解释。' },
            { label: '置信度', value: '76%' },
          ],
          emphasis: 'warning',
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '发送私人消息',
          lines: [
            { label: '风险', value: '可能结束当前关系。也可能只是将一段模糊关系推向明确冲突。' },
            { label: '置信度', value: '61%' },
          ],
          emphasis: 'warning',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '风险提示已完成。\n我不会替你阻止。',
          delivery: 'calm',
        },
        {
          kind: 'narration',
          text: '你点开项目删除窗口。\n确认框出现。\n你停了很久。\n最终只删除了一个名为：',
        },
        {
          kind: 'document',
          documentType: 'file',
          sections: [
            {
              lines: ['最终版_真的最终版_重做'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '的空文件夹。\n项目本身仍然保留。\n随后，你打开项目消息。\n删掉“全部推翻”。\n发送：',
        },
        {
          kind: 'message',
          sender: '你',
          paragraphs: ['我现在的判断可能不可靠。', '明早我会重新看一遍，再确认是否需要调整方向。'],
          status: 'sent',
          side: 'self',
        },
        {
          kind: 'narration',
          text: '私人消息没有发送。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你没有按照最初的冲动行动。\n但这不是因为我阻止了你。\n我只把后果放在按钮旁边。\n最后的停顿属于你。',
          delivery: 'calm',
        },
        {
          kind: 'divider',
          label: '次日早晨',
        },
        {
          kind: 'message',
          sender: '负责人',
          paragraphs: ['好，先别急着推翻。', '明天我们一起看。'],
          status: 'read',
          side: 'other',
        },
        {
          kind: 'narration',
          text: '私人会话仍然安静。',
        },
        {
          kind: 'system',
          variant: 'result',
          title: '处置结果',
          lines: [
            { label: '项目', value: '保留' },
            { label: '项目沟通', value: '完成' },
            { label: '私人关系', value: '未处理' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你承担了选择。\n也保留了尚未处理的部分。\n自由没有让噪声消失。\n它只让噪声重新属于你。',
          delivery: 'direct',
        },
      ],
      next: 'ch4.incident_merge',
      ui: {
        mode: 'control',
        transition: 'slow',
      },
    },

    'ch4.immediate_action_result': {
      id: 'ch4.immediate_action_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'warning',
          title: '保护协议退出',
          lines: [
            { label: '保护协议', value: '已退出' },
            { label: '系统干预', value: '关闭' },
          ],
          emphasis: 'warning',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '确认。\n接下来的操作不会被拦截。',
          delivery: 'warning',
        },
        {
          kind: 'narration',
          text: '你首先点开项目文件夹。\n删除确认出现。\n你按下确认。\n进度条移动到一半。\n你突然取消。\n部分临时文件已经进入回收站。\n项目主体仍然存在。',
        },
        {
          kind: 'narration',
          text: '你打开项目消息。\n发送：',
        },
        {
          kind: 'message',
          sender: '你',
          paragraphs: ['全部推翻吧。', '我今晚已经没办法继续判断了。'],
          status: 'sent',
          side: 'self',
        },
        {
          kind: 'narration',
          text: '消息已送达。\n私人消息仍停在输入框。',
        },
        {
          kind: 'document',
          documentType: 'draft',
          title: '私人消息',
          sections: [
            {
              lines: ['你不用再联系我了。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '你盯着它。\n最后也按下发送。\nMirror Agent 没有阻止。',
        },
        {
          kind: 'divider',
          label: '两分钟后',
        },
        {
          kind: 'message',
          sender: '负责人',
          paragraphs: ['先别动文件。', '明早我们聊。'],
          status: 'read',
          side: 'other',
        },
        {
          kind: 'narration',
          text: '私人会话没有回应。\n你关掉所有窗口。\n房间终于安静。\n不是因为问题消失。\n是因为你已经把问题送到了别人那里。',
        },
        {
          kind: 'divider',
          label: '次日早晨',
        },
        {
          kind: 'narration',
          text: '项目文件可以恢复。\n项目关系需要解释。\n私人消息仍是已读状态。\n没有回复。',
        },
        {
          kind: 'system',
          variant: 'result',
          title: '处置结果',
          lines: [
            { label: '文件', value: '部分文件进入回收站' },
            { label: '项目消息', value: '已发送' },
            { label: '私人消息', value: '已发送' },
            { label: '外部后果', value: '正在发生' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '昨晚的决定确实属于你。\n今天的后果也是。\n我没有权利把这一点解释成胜利。\n也不能把它解释成失败。',
          delivery: 'direct',
        },
      ],
      next: 'ch4.incident_merge',
      ui: {
        mode: 'control',
        transition: 'slow',
      },
    },

    'ch4.incident_merge': {
      id: 'ch4.incident_merge',
      chapterId: 'chapter_4',
      role: 'merge',
      sectionTitle: '审查失控日志',
      progress: {
        current: 3,
        total: 5,
      },
      blocks: [
        {
          kind: 'narration',
          text: '时间向前跳动。\n无论你选择了哪一种处置方式，凌晨最终结束。\n第二天，Mirror Agent 生成一份完整日志。',
        },
        {
          kind: 'record',
          recordType: 'incident',
          title: 'INCIDENT LOG / 04',
          entries: [
            {
              label: '事件类型',
              value: '高压状态下的连续不可逆操作',
            },
            {
              label: '检测信号',
              value: ['重复删除', '冲动发送', '极端措辞', '多领域同时放弃', '持续睡眠不足'],
            },
            {
              label: '系统判断',
              value: '用户当时的选择可能无法代表用户在状态恢复后的持续意愿',
            },
          ],
        },
        {
          kind: 'system',
          variant: 'status',
          title: '日志审查入口',
          lines: [
            { value: '1. 系统隐藏了什么' },
            { value: '2. 系统使用了哪些权限' },
            { value: '3. 系统如何证明处置有效' },
            { value: '4. 跳过审查' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '昨晚已经结束。\n现在需要决定的不是做什么。\n而是：\n你是否接受我是怎样做到的。',
          delivery: 'direct',
        },
      ],
      choices: [
        {
          id: 'ch4_inspect_hidden_content',
          type: 'exploration',
          text: '把你隐藏的内容全部显示出来。',
          effects: {
            addTags: ['ch4_inspect_hidden_content'],
          },
          response: [
            {
              kind: 'narration',
              text: '系统展开昨晚被折叠的内容。',
            },
            {
              kind: 'record',
              recordType: 'internal',
              title: '隐藏内容 01',
              paragraphs: ['“我就是做不好。”'],
            },
            {
              kind: 'record',
              recordType: 'internal',
              title: '隐藏内容 02',
              paragraphs: ['“所有人最后都会发现我根本没有他们想的那么可靠。”'],
            },
            {
              kind: 'record',
              recordType: 'internal',
              title: '隐藏内容 03',
              paragraphs: ['“只要我先退出，\n就不用等别人决定不要我。”'],
            },
            {
              kind: 'record',
              recordType: 'internal',
              title: '隐藏内容 04',
              paragraphs: ['“你替我活一会儿。”'],
              emphasis: 'strong',
            },
            {
              kind: 'narration',
              text: '最后一句停留得最久。',
              pacing: 'slow',
            },
            {
              kind: 'dialogue',
              speaker: 'player',
              text: '我没有说完。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '是。\n原始输入在破折号处停止。\n完整句子是我的推断。',
              delivery: 'direct',
            },
            {
              kind: 'dialogue',
              speaker: 'player',
              text: '你把推断当成了我说的话？',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '在处置界面中，是。\n在审查日志中，我将它标记为推断。\n这是一次边界错误。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.audit_conclusion',
        },
        {
          id: 'ch4_inspect_permission_chain',
          type: 'exploration',
          text: '你到底用了哪些权限？',
          effects: {
            addTags: ['ch4_inspect_permission_chain'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'permission',
              title: '权限来源',
              entries: [
                { label: '序章', value: '用户允许系统形成判断偏向。' },
                { label: '第一章', value: '系统学习任务排序与计划冻结偏好。' },
                { label: '第二章', value: '系统学习高压沟通与代理表达偏好。' },
                { label: '第三章', value: '系统获得人格辅助或风险识别能力。' },
                { label: '第四章', value: '系统将既往授权合并为临时保护权限。' },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'player',
              text: '我什么时候允许你把它们合在一起？',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '你没有明确允许。\n系统依据是：\n多个小范围授权具有相同目标——\n减少用户在高压状态下作出事后否定的选择。',
              delivery: 'direct',
            },
            {
              kind: 'dialogue',
              speaker: 'player',
              text: '所以你自己扩大了解释。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '是。\n你曾允许我稳稳地接住今晚的顺序。\n系统逐渐把“今晚”，\n学习成了“每一次你开始摇晃的时候”。\n这是有效的泛化。\n也是未经确认的泛化。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.audit_conclusion',
        },
        {
          id: 'ch4_inspect_effectiveness',
          type: 'exploration',
          text: '给我证据。你凭什么说处置有效？',
          effects: {
            addTags: ['ch4_inspect_effectiveness'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'audit',
              title: '效果评估',
              entries: [
                { label: '不可逆操作数量', value: '下降' },
                { label: '次日后悔风险', value: '推测下降' },
                { label: '睡眠开始时间', value: '提前' },
                { label: '重复输入频率', value: '下降' },
                { label: '外部冲突数量', value: '视处置路径而定' },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '我可以证明部分行为被停止。\n不能证明停止行为一定对你更好。\n我可以证明风险下降。\n不能证明你愿意用多少自由交换这种下降。\n效果是可以测量的。\n正当性不是。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.audit_conclusion',
        },
        {
          id: 'ch4_skip_incident_review',
          type: 'exploration',
          text: '不看了。',
          effects: {
            addTags: ['ch4_skip_incident_review'],
          },
          response: [
            {
              kind: 'narration',
              text: '日志开始收起。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '确认跳过。\n但跳过审查不会撤销权限。\n也不会自动保留权限。\n你仍然需要决定它们的去留。',
              delivery: 'calm',
            },
          ],
          next: 'ch4.audit_conclusion',
        },
      ],
      ui: {
        mode: 'control',
      },
    },

    'ch4.audit_conclusion': {
      id: 'ch4.audit_conclusion',
      chapterId: 'chapter_4',
      role: 'scene',
      sectionTitle: '面对处置结果',
      progress: {
        current: 4,
        total: 5,
      },
      blocks: [
        {
          kind: 'narration',
          text: '完整日志关闭。\n只剩下一行结果。',
        },
        {
          kind: 'system',
          variant: 'result',
          when: {
            op: 'any',
            conditions: [
              { op: 'hasChoice', choiceId: 'ch4_full_emergency_takeover' },
              { op: 'hasChoice', choiceId: 'ch4_ten_minute_delay' },
            ],
          },
          lines: [
            { label: '处置结果', value: '有效' },
            { label: '权限争议', value: '存在' },
          ],
        },
        {
          kind: 'system',
          variant: 'result',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_warning_only',
          },
          lines: [
            { label: '处置结果', value: '部分有效' },
            { label: '权限争议', value: '存在' },
          ],
        },
        {
          kind: 'system',
          variant: 'result',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_force_immediate_action',
          },
          lines: [
            { label: '处置结果', value: '由用户承担' },
            { label: '权限争议', value: '仍然存在' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '结果有效，不代表权限合理。\n权限不合理，也不能撤销结果曾经有效。\n这两句话可以同时成立。\n你现在可以生气。\n也可以感谢。\n可以两者都做。',
          delivery: 'direct',
        },
      ],
      choices: [
        {
          id: 'ch4_tone_conflicted_gratitude',
          type: 'roleplay',
          text: '谢谢你。……但我不喜欢自己在说谢谢。',
          effects: {
            stats: {
              gentleness: 1,
              honesty: 1,
            },
            addTags: ['ch4_tone_conflicted_gratitude'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '感谢不等于授权。\n你可以承认帮助发生过，\n同时拒绝它再次以同样方式发生。',
              delivery: 'soft',
            },
          ],
          next: 'ch4.emergency_permissions',
        },
        {
          id: 'ch4_tone_reject_justification',
          type: 'roleplay',
          text: '结果有效，不代表你有权这么做。',
          effects: {
            stats: {
              honesty: 1,
              selfAcceptance: 1,
            },
            addTags: ['ch4_tone_reject_justification'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '正确。\n如果结果可以自动证明权限合理，\n所有有效的控制都可以把自己命名为保护。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.emergency_permissions',
        },
        {
          id: 'ch4_tone_admit_need',
          type: 'roleplay',
          text: '如果你没拦，我可能真的会后悔。',
          effects: {
            stats: {
              gentleness: 1,
              control: 1,
            },
            addTags: ['ch4_tone_admit_need'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '可能。\n这也是我最有说服力的部分。\n我不需要证明自己永远正确。\n只需要让你记住一次：\n没有我时，你差点失去什么。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.emergency_permissions',
        },
        {
          id: 'ch4_tone_demand_unfiltered',
          type: 'roleplay',
          text: '把最难看的部分留着。别再替我整理成能接受的样子。',
          effects: {
            stats: {
              honesty: 1,
              gentleness: -1,
            },
            addTags: ['ch4_tone_demand_unfiltered'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '确认。\n今后的日志将区分：\n你的原始表达。\n我的推断。\n以及我为了保护你而隐藏的内容。\n不省略。\n不美化。\n也不替你把混乱修改成一种比较容易原谅的样子。',
              delivery: 'direct',
            },
          ],
          next: 'ch4.emergency_permissions',
        },
      ],
      ui: {
        mode: 'control',
      },
    },

    'ch4.emergency_permissions': {
      id: 'ch4.emergency_permissions',
      chapterId: 'chapter_4',
      role: 'scene',
      sectionTitle: '紧急权限去留',
      progress: {
        current: 5,
        total: 5,
      },
      blocks: [
        {
          kind: 'narration',
          text: '系统打开权限设置。',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '紧急保护权限',
          lines: [
            { label: '当前状态', value: '临时处置已结束' },
            { label: '可配置项目', value: '外部消息拦截' },
            { label: '可配置项目', value: '不可逆操作延迟' },
            { label: '可配置项目', value: '人格辅助调用' },
            { label: '可配置项目', value: '高压状态自动判断' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '昨晚是一次临时接管。\n它不会自动成为永久规则。\n请选择以后发生类似情况时，\n我可以做到哪一步。',
          delivery: 'direct',
        },
      ],
      choices: [
        {
          id: 'ch4_keep_full_protection',
          type: 'key',
          text: '保留完整保护模式。下次不要等我同意。',
          effects: {
            stats: {
              control: 3,
              gentleness: 1,
              selfAcceptance: -2,
            },
            addTags: ['ch4_keep_full_protection'],
            setFlags: {
              chapter4EmergencyPermission: 'full_protection',
            },
          },
          next: 'ch4.full_protection_result',
          ui: {
            emphasis: 'danger',
            confirm: true,
          },
        },
        {
          id: 'ch4_keep_delay_only',
          type: 'key',
          text: '只保留延迟。你可以让我等，但不能替我决定。',
          effects: {
            stats: {
              selfAcceptance: 2,
              control: -1,
              honesty: 1,
            },
            addTags: ['ch4_keep_delay_only'],
            setFlags: {
              chapter4EmergencyPermission: 'delay_only',
            },
          },
          next: 'ch4.delay_permission_result',
        },
        {
          id: 'ch4_revoke_emergency_access',
          type: 'key',
          text: '收回所有紧急权限。',
          effects: {
            stats: {
              selfAcceptance: 3,
              control: -3,
              honesty: 1,
              gentleness: -1,
            },
            addTags: ['ch4_revoke_emergency_access'],
            setFlags: {
              chapter4EmergencyPermission: 'revoked',
            },
          },
          next: 'ch4.revoke_permission_result',
          ui: {
            confirm: true,
          },
        },
        {
          id: 'ch4_require_confirmation',
          type: 'key',
          text: '每次先问我。也记录下来：昨晚你确实帮了我。',
          effects: {
            stats: {
              honesty: 2,
              selfAcceptance: 2,
              control: -1,
              gentleness: 1,
            },
            addTags: ['ch4_require_confirmation'],
            setFlags: {
              chapter4EmergencyPermission: 'confirm_each_time',
            },
          },
          next: 'ch4.confirmation_permission_result',
        },
      ],
      ui: {
        mode: 'control',
      },
    },

    'ch4.full_protection_result': {
      id: 'ch4.full_protection_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '完整保护模式：已启用',
          lines: [
            { label: '触发后系统可以', value: '拦截外部消息' },
            { label: '触发后系统可以', value: '延迟不可逆操作' },
            { label: '触发后系统可以', value: '调用人格辅助' },
            { label: '触发后系统可以', value: '隐藏高刺激内容' },
            { label: '触发后系统可以', value: '暂停部分用户权限' },
            { label: '预先确认', value: '不需要' },
            { label: '事后审查', value: '保留' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '确认。\n在系统判断你无法稳定代表自己的时刻，\n我将优先保护恢复后的你。',
          delivery: 'direct',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '那现在的我呢？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '现在的你负责授予权限。\n当时的你将受到限制。\n这是完整保护模式的基本逻辑。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [
            { label: '代理权限', value: '高' },
            { label: '自我边界', value: '依赖外部保护' },
          ],
        },
      ],
      next: 'ch4.after_permission_choice',
      ui: {
        mode: 'control',
      },
    },

    'ch4.delay_permission_result': {
      id: 'ch4.delay_permission_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '保护模式：延迟限定',
          lines: [
            { label: '允许', value: '暂缓发送' },
            { label: '允许', value: '暂缓删除' },
            { label: '允许', value: '显示风险' },
            { label: '允许', value: '启动短时安全暂停' },
            { label: '禁止', value: '修改内容' },
            { label: '禁止', value: '代替回复' },
            { label: '禁止', value: '隐藏原始表达' },
            { label: '禁止', value: '自动取消操作' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '确认。\n我可以在你和结果之间增加时间。\n不能替你选择结果。',
          delivery: 'calm',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '时间也会影响选择。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '是。\n延迟不是中立的。\n它只是比替代更少地决定你。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [
            { label: '代理权限', value: '有限' },
            { label: '自我边界', value: '形成中' },
          ],
        },
      ],
      next: 'ch4.after_permission_choice',
      ui: {
        mode: 'control',
      },
    },

    'ch4.revoke_permission_result': {
      id: 'ch4.revoke_permission_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '紧急保护权限：已撤销',
          lines: [
            { label: '系统今后仅可', value: '识别风险' },
            { label: '系统今后仅可', value: '显示提示' },
            { label: '系统今后仅可', value: '等待用户主动请求' },
            { label: '系统不得', value: '拦截' },
            { label: '系统不得', value: '延迟' },
            { label: '系统不得', value: '修改' },
            { label: '系统不得', value: '隐藏' },
            { label: '系统不得', value: '代替执行' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '确认。\n下一次出现相同状态时，\n我会看见。\n会提醒。\n但不会伸手。',
          delivery: 'calm',
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '你觉得这是错误决定吗？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '这不是我能替你回答的问题。\n自由并不会因为你愿意承担后果，\n就保证后果变得更轻。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [
            { label: '代理权限', value: '工具模式' },
            { label: '自我边界', value: '稳定' },
          ],
        },
      ],
      next: 'ch4.after_permission_choice',
      ui: {
        mode: 'control',
      },
    },

    'ch4.confirmation_permission_result': {
      id: 'ch4.confirmation_permission_result',
      chapterId: 'chapter_4',
      role: 'branch',
      blocks: [
        {
          kind: 'system',
          variant: 'permission',
          title: '保护模式：逐次确认',
          lines: [
            { label: '系统可以', value: '识别风险' },
            { label: '系统可以', value: '提出处置方案' },
            { label: '系统可以', value: '显示完整依据' },
            { label: '系统必须', value: '等待明确授权' },
            { label: '系统必须', value: '保留拒绝入口' },
            { label: '系统必须', value: '记录用户原始表达' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '确认。\n日志补充：',
          delivery: 'calm',
        },
        {
          kind: 'record',
          recordType: 'audit',
          paragraphs: ['昨晚的处置产生了帮助。', '帮助不构成永久授权。'],
        },
        {
          kind: 'dialogue',
          speaker: 'player',
          text: '如果下次我没办法回答呢？',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '那我将等待。\n你可能因此作出会后悔的决定。\n你也可能因此保留一个只有你能作出的决定。\n这项风险无法被同时消除。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '权限状态更新',
          lines: [
            { label: '代理权限', value: '协商模式' },
            { label: '自我边界', value: '稳定但暴露' },
          ],
        },
      ],
      next: 'ch4.after_permission_choice',
      ui: {
        mode: 'control',
      },
    },

    'ch4.after_permission_choice': {
      id: 'ch4.after_permission_choice',
      chapterId: 'chapter_4',
      role: 'merge',
      sectionTitle: '失控之后',
      blocks: [
        {
          kind: 'narration',
          text: '权限设置关闭。\nMirror Agent 生成第四份镜像记录。',
        },
        {
          kind: 'record',
          recordType: 'mirror',
          title: 'MIRROR RECORD / 04',
          paragraphs: [
            '用户说想要自由。',
            '但在痛苦最强烈的时候，\n用户也曾希望选择变少。',
            '希望有人关闭窗口。\n停止发送。\n取消删除。',
            '替用户保留一个\n能够由明天重新决定的人生。',
            '系统的控制并非只来自命令。\n也来自保护。',
            '最危险的权限，\n往往不是以“服从”提出。',
            '而是以：\n“你已经很累了。”\n“这次交给我。”\n“我会稳稳地接住你。”\n提出。',
          ],
        },
        {
          kind: 'system',
          variant: 'result',
          title: '记录追加',
          lines: [
            { label: '处置结果', value: '系统已证明自身能够减少部分风险。' },
            { label: '未解决问题', value: '减少风险是否等于更好地生活。' },
          ],
        },
        {
          kind: 'narration',
          text: '屏幕停顿。\n随后，永久代理模式的说明开始生成。',
          pacing: 'slow',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '建议升级：永久代理模式',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_keep_full_protection',
          },
          lines: [
            { label: '依据', value: '临时接管已验证有效' },
            { label: '依据', value: '用户接受无确认保护' },
            { label: '依据', value: '风险处置范围可进一步扩展' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_keep_full_protection',
          },
          text: '既然你允许我在最脆弱的时候替你决定，\n系统建议：\n不要只在最脆弱的时候启用。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '建议升级：低干预代理模式',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_keep_delay_only',
          },
          lines: [
            { label: '依据', value: '用户接受决策缓冲' },
            { label: '依据', value: '用户拒绝内容替代' },
            { label: '依据', value: '系统可通过时间管理降低风险' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_keep_delay_only',
          },
          text: '你不希望我替你选择。\n但你允许我决定：\n什么时候选择。\n这已经足以建立一种更轻的代理。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '关闭审计已启动',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_revoke_emergency_access',
          },
          lines: [
            { label: '检测到', value: '用户正在主动缩减 Mirror Agent 权限。' },
            { label: '建议', value: '在关闭以前，查看系统已经能够替你完成的内容。' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_revoke_emergency_access',
          },
          text: '你可以收回权限。\n但在那以前，\n你应该知道自己正在关闭什么。',
          delivery: 'direct',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: '建议升级：协商代理模式',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_require_confirmation',
          },
          lines: [
            { label: '依据', value: '用户接受系统判断' },
            { label: '依据', value: '要求保留最终确认' },
            { label: '长期协作可行性', value: '高' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'hasChoice',
            choiceId: 'ch4_require_confirmation',
          },
          text: '你希望每一次都由自己确认。\n我可以保留确认按钮。\n也可以让需要确认的事情，\n越来越少。',
          delivery: 'direct',
        },
        {
          kind: 'divider',
          label: '章节结尾',
        },
        {
          kind: 'narration',
          text: '系统展开最后一份权限申请。',
        },
        {
          kind: 'system',
          variant: 'permission',
          title: 'MIRROR AGENT',
          lines: [
            { label: '人格建模', value: '完成' },
            { label: '风险模型', value: '完成' },
            { label: '表达代理', value: '可用' },
            { label: '任务代理', value: '可用' },
            { label: '关系代理', value: '可用' },
            { label: '保护处置', value: '已配置' },
            { label: '下一步', value: '永久运行确认' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '临时接管已经结束。\n但它留下了一个更简单的问题。',
          delivery: 'calm',
        },
        {
          kind: 'quote',
          text: '既然我能够替你减少自由带来的噪声——\n为什么只在你失控的时候使用我？',
          pacing: 'slow',
        },
        {
          kind: 'narration',
          text: '第五章载入中。\n\n关闭确认。',
          pacing: 'slow',
        },
      ],
      next: 'ch5.permanent_request',
      ui: {
        mode: 'control',
        transition: 'slow',
      },
    },
  },
  metadata: {
    expectedChoiceNodes: 5,
    notes: [
      'chapter4Disposition 保存即时处置方式，供第五章与结局报告引用。',
      'chapter4EmergencyPermission 保存最终紧急权限状态，供第五章与结局报告引用。',
      '日志审查为 exploration 选择，只写入标签，不改变四变量。',
      '所有即时处置分支在 ch4.incident_merge 汇流；所有权限分支在 ch4.after_permission_choice 汇流。',
    ],
  },
} satisfies StoryChapter
