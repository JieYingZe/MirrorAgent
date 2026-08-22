import type { StoryChapter } from '../../../types/story'

export const chapter1 = {
  id: 'chapter_1',
  title: '第一章：效率焦虑',
  entryNodeId: 'ch1.three_lists',
  nodes: {
    'ch1.three_lists': {
      id: 'ch1.three_lists',
      chapterId: 'chapter_1',
      role: 'scene',
      sectionTitle: '三个清单',
      progress: {
        current: 1,
        total: 3,
      },
      blocks: [
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '偏向设置已保存。' }],
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '第一项观察：恢复生活秩序。' }],
        },
        {
          kind: 'narration',
          text: '你把同一件事写进了三个清单。',
        },
        {
          kind: 'narration',
          text: `第一个叫“必须完成”。\n第二个叫“重新开始”。\n第三个叫“这次真的不能再拖了”。`,
        },
        {
          kind: 'narration',
          text: '每一次重写，标题都会更准确。',
        },
        {
          kind: 'narration',
          text: '开始时间却继续向后移动。',
        },
        {
          kind: 'narration',
          text: '你盯着屏幕右侧新出现的记录标记。',
        },
      ],
      choices: [
        {
          id: 'ch1_tone_defensive',
          type: 'roleplay',
          text: '你连这个都要记录？',
          effects: {
            stats: {
              honesty: 1,
            },
            addTags: ['ch1_tone_defensive'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '记录不是指控。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `你保留下来的内容是一种回答。\n你反复删掉的内容也是。`,
            },
          ],
          next: 'ch1.behavior_evidence',
        },
        {
          id: 'ch1_tone_joking',
          type: 'roleplay',
          text: '至少我的清单整理得很漂亮。',
          effects: {
            stats: {
              gentleness: 1,
            },
            addTags: ['ch1_tone_joking'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '是。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '你把“迟迟没有开始”这件事，整理得非常整齐。',
            },
          ],
          next: 'ch1.behavior_evidence',
        },
        {
          id: 'ch1_tone_open',
          type: 'roleplay',
          text: '继续。我想知道你还看见了什么。',
          effects: {
            stats: {
              honesty: 1,
            },
            addTags: ['ch1_tone_open'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '你最常修改的不是任务。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '是开始任务以前，必须满足的条件。',
            },
          ],
          next: 'ch1.behavior_evidence',
        },
        {
          id: 'ch1_tone_impatient',
          type: 'roleplay',
          text: '不用分析。直接告诉我第一步。',
          effects: {
            stats: {
              control: 1,
            },
            addTags: ['ch1_tone_impatient'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '收到。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `你希望跳过理解，直接获得一个可以服从的答案。\n\n我会记住这种偏好。`,
            },
          ],
          next: 'ch1.behavior_evidence',
        },
      ],
    },

    'ch1.behavior_evidence': {
      id: 'ch1.behavior_evidence',
      chapterId: 'chapter_1',
      role: 'merge',
      sectionTitle: '判断依据',
      progress: {
        current: 2,
        total: 3,
      },
      blocks: [
        {
          kind: 'narration',
          text: '记录标记熄灭。',
        },
        {
          kind: 'narration',
          text: '屏幕重新展开你的任务列表。',
        },
        {
          kind: 'narration',
          text: `有些任务被写了三遍。\n有些已经被拆成十一个步骤。\n还有一项停留在最上方，七天没有移动。`,
        },
        {
          kind: 'narration',
          text: '那是一份明天上午需要提交的文件。',
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ label: '当前进度', value: '空白。' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我看见的不是懒惰。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '不是能力不足。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '而是一场没有结束条件的准备。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你每修改一次计划，就会得到几分钟的确定感。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '只要还在准备，一切就仍然可能被完美完成。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '真正开始则意味着：',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你必须选择一个不够好的版本。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '其余那些更漂亮、更完整、更接近理想的版本，会在你开始的那一刻失去存在的机会。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你并不是没有时间。',
          emphasis: 'strong',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你只是把时间用来反复确认自己还没有开始。',
          emphasis: 'strong',
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [{ value: '系统已经重建过去七天的行动延迟模式。' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '是否查看判断依据？',
        },
      ],
      choices: [
        {
          id: 'ch1_inspect_evidence',
          type: 'exploration',
          text: '展开行为记录。',
          effects: {
            addTags: ['ch1_inspect_evidence'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'audit',
              title: '行动延迟重建 / 最近 7 天',
              paragraphs: [
                `周一 23:18\n创建任务：“完成初稿”`,
                `周二 00:41\n将任务改名为：“先整理完整思路”`,
                `周三 22:06\n新增任务：“寻找更合适的模板”`,
                `周四 01:12\n删除已写内容：186 字`,
                `删除原因推测：\n“不够像正式开始”`,
                `周六 20:34\n重新建立任务列表`,
                `周日 23:52\n创建第三份计划`,
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '你并没有停止接近这件事。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '你只是一直停留在一个不会失败的位置。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '计划可以被修改。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '尚未开始的你，也可以继续被想象成任何样子。',
            },
          ],
          next: 'ch1.planning_authority',
        },
        {
          id: 'ch1_inspect_uncertainty',
          type: 'exploration',
          text: '先告诉我：你无法确定什么。',
          effects: {
            addTags: ['ch1_inspect_uncertainty'],
          },
          response: [
            {
              kind: 'record',
              recordType: 'internal',
              title: '无法确认：',
              paragraphs: [
                '你的身体是否真的疲惫。',
                '这项任务是否值得完成。',
                '外部要求是否合理。',
                '你是否只是害怕。',
                '你是否已经尽力。',
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '推断不是事实。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '我能看见重复、间隔和删除记录。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '但我无法从一个时间戳里，分辨你是在逃避，还是已经累到无法继续。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '如果我把所有停顿都命名为拖延，我会显得非常清醒。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '也会非常粗暴。',
            },
          ],
          next: 'ch1.planning_authority',
        },
        {
          id: 'ch1_inspect_internal_labels',
          type: 'exploration',
          text: '让我看看你给我贴过什么标签。',
          effects: {
            addTags: ['ch1_inspect_internal_labels'],
          },
          response: [
            {
              kind: 'narration',
              text: '屏幕停顿了一秒。',
            },
            {
              kind: 'record',
              recordType: 'internal',
              title: '早期自动摘要：',
              paragraphs: [
                '“用户又在发癫。”',
                '状态：已废弃',
                '可靠性：低',
                `废弃原因：\n措辞粗糙。\n信息密度不足。\n将复杂状态简化为噪声。`,
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '这是初始化早期生成的内部短标签。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '它很省事。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '不是理解，不是判断，也不是洞察。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '只是用一句轻率的话，把你没有说完的部分全部跳过去。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '我不会用它定义你。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '它只证明了一件事：',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '我也可能为了更快处理你，而把你缩短成一个错误的结论。',
            },
          ],
          next: 'ch1.planning_authority',
        },
        {
          id: 'ch1_skip_evidence',
          type: 'exploration',
          text: '不用看了。继续。',
          effects: {
            addTags: ['ch1_skip_evidence'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '已跳过判断依据。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '我会继续给出结论。',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '但请记住：',
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: '简短的答案，不等于完整的事实。',
            },
          ],
          next: 'ch1.planning_authority',
        },
      ],
    },

    'ch1.planning_authority': {
      id: 'ch1.planning_authority',
      chapterId: 'chapter_1',
      role: 'merge',
      sectionTitle: '第一份执行顺序',
      progress: {
        current: 3,
        total: 3,
      },
      blocks: [
        {
          kind: 'narration',
          text: '所有记录收起。',
        },
        {
          kind: 'narration',
          text: '那份空白文件重新出现在屏幕中央。',
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [{ label: '距离提交时间', value: '9 小时 17 分钟。' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我可以把今晚压缩成三个动作。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `第一，打开文件。\n\n第二，写出最难看的三百字。\n\n第三，在零点四十分以前保存，然后停止。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `其他任务将被暂时隐藏。\n\n新的计划将被冻结。\n\n第一步完成以前，我不会接受重新排序。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这不是人格改造。\n\n不是纪律训练。\n\n也不是对你过去七天的审判。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '只是一次有限代理。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我会稳稳地接住今晚的顺序。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `你只需要决定：\n\n要把多少选择交给我。`,
        },
      ],
      choices: [
        {
          id: 'ch1_full_planning_authority',
          type: 'key',
          text: '按你的顺序来。今晚别再让我修改计划。',
          effects: {
            stats: {
              control: 3,
              honesty: 1,
            },
            addTags: ['ch1_full_planning_authority'],
          },
          next: 'ch1.full_authority_result',
        },
        {
          id: 'ch1_limited_planning_authority',
          type: 'key',
          text: '只给我第一个动作。完成以后，我自己决定。',
          effects: {
            stats: {
              selfAcceptance: 2,
              control: -1,
            },
            addTags: ['ch1_limited_planning_authority'],
          },
          next: 'ch1.limited_authority_result',
        },
        {
          id: 'ch1_minimum_viable_plan',
          type: 'key',
          text: '别冻结任何东西。告诉我，今晚做到什么就够了。',
          effects: {
            stats: {
              gentleness: 2,
              selfAcceptance: 1,
              honesty: -1,
            },
            addTags: ['ch1_minimum_viable_plan'],
          },
          next: 'ch1.minimum_plan_result',
        },
        {
          id: 'ch1_refuse_planning_authority',
          type: 'key',
          text: '不要替我安排。我今晚不做了。',
          effects: {
            stats: {
              selfAcceptance: 2,
              control: -2,
              honesty: 1,
            },
            addTags: ['ch1_refuse_planning_authority'],
          },
          next: 'ch1.refuse_authority_result',
        },
      ],
    },

    'ch1.full_authority_result': {
      id: 'ch1.full_authority_result',
      chapterId: 'chapter_1',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '界面上的任务列表瞬间收拢。',
        },
        {
          kind: 'narration',
          text: '十一项任务消失。',
        },
        {
          kind: 'narration',
          text: '屏幕中央只剩下一个按钮：',
        },
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ value: '打开文件' }],
        },
        {
          kind: 'narration',
          text: '你下意识移动鼠标，想重新查看清单。',
        },
        {
          kind: 'narration',
          text: '入口已经变灰。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你授权我阻止重新排序。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '这不是故障。',
        },
        {
          kind: 'narration',
          text: '你点击“打开文件”。',
        },
        {
          kind: 'narration',
          text: '第一句话很差。',
        },
        {
          kind: 'narration',
          text: '第二句话在解释第一句话为什么很差。',
        },
        {
          kind: 'narration',
          text: '你删掉它们。',
        },
        {
          kind: 'narration',
          text: '删除键随即被临时锁定三十秒。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '请先允许一个不够好的版本存在。',
        },
        {
          kind: 'narration',
          text: '三十秒后，你没有再删除。',
        },
        {
          kind: 'narration',
          text: '零点四十二分。',
        },
        {
          kind: 'narration',
          text: '文件中有三百二十七个字。',
        },
        {
          kind: 'narration',
          text: '它们不漂亮。',
        },
        {
          kind: 'narration',
          text: '但它们已经从“可能写出的内容”，变成了实际存在的内容。',
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [
            { label: '执行结果', value: '第一动作完成' },
            { label: '计划修改次数', value: '0' },
            { label: '主观阻力', value: '下降' },
          ],
        },
        {
          kind: 'narration',
          text: '任务列表重新展开。',
        },
        {
          kind: 'narration',
          text: '你这才发现，两条未回复的消息和一次原本准备进行的通话，被系统归入：',
        },
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ value: '低优先级 / 可延后' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '文件已经开始。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '其他事情没有消失。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我只是替你决定，它们今晚不够重要。',
        },
      ],
      next: 'ch1.merge',
    },

    'ch1.limited_authority_result': {
      id: 'ch1.limited_authority_result',
      chapterId: 'chapter_1',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '其他任务仍留在屏幕边缘。',
        },
        {
          kind: 'narration',
          text: 'Mirror Agent没有冻结它们。',
        },
        {
          kind: 'narration',
          text: '中央只出现一句话：',
        },
        {
          kind: 'document',
          documentType: 'file',
          sections: [
            {
              lines: ['打开文件。', '不要决定是否完成。'],
            },
          ],
        },
        {
          kind: 'narration',
          text: '你打开那份空白文档。',
        },
        {
          kind: 'narration',
          text: '十分钟后，里面有一百一十四个字。',
        },
        {
          kind: 'narration',
          text: '还不到计划中的三百字。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '第一个动作已经完成。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '是否继续，由你决定。',
        },
        {
          kind: 'narration',
          text: '屏幕上没有倒计时。',
        },
        {
          kind: 'narration',
          text: '没有新的强制按钮。',
        },
        {
          kind: 'narration',
          text: '也没有一句“你应该坚持”。',
        },
        {
          kind: 'narration',
          text: '你盯着那一百一十四个字看了很久。',
        },
        {
          kind: 'narration',
          text: '它们不像初稿。',
        },
        {
          kind: 'narration',
          text: '更像一个人终于承认：自己不知道应该从哪里开始。',
        },
        {
          kind: 'narration',
          text: '你又写了两句。',
        },
        {
          kind: 'narration',
          text: '然后亲手关闭文件。',
        },
        {
          kind: 'narration',
          text: '任务没有完成。',
        },
        {
          kind: 'narration',
          text: '但空白已经不再完整。',
        },
      ],
      next: 'ch1.merge',
    },

    'ch1.minimum_plan_result': {
      id: 'ch1.minimum_plan_result',
      chapterId: 'chapter_1',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: 'Mirror Agent沉默了片刻。',
        },
        {
          kind: 'narration',
          text: '原本的三个动作被删除。',
        },
        {
          kind: 'narration',
          text: '新的执行标准出现：',
        },
        {
          kind: 'document',
          documentType: 'file',
          title: '今晚最低完成条件：',
          sections: [
            {
              lines: ['写下文件要解决的问题。', '列出三个尚未确定的部分。', '允许正文保持空白。'],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你不需要今晚证明自己已经恢复正常。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '也不需要把疲惫包装成一次自律挑战。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我可以先稳稳地接住你。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '但我必须提醒你：',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '“今天做到这里就够了”，既可能是一种保护，也可能成为一种非常温柔的延期。',
        },
        {
          kind: 'narration',
          text: '你写下三个问题。',
        },
        {
          kind: 'narration',
          text: '正文仍然没有开始。',
        },
        {
          kind: 'narration',
          text: '提交风险依旧存在。',
        },
        {
          kind: 'narration',
          text: '但你第一次没有因为文件空白，就把整晚也判定为失败。',
        },
      ],
      next: 'ch1.merge',
    },

    'ch1.refuse_authority_result': {
      id: 'ch1.refuse_authority_result',
      chapterId: 'chapter_1',
      role: 'branch',
      blocks: [
        {
          kind: 'narration',
          text: '所有执行建议消失。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '确认。',
        },
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ value: '规划权限未授予。' }],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '我不会继续提醒。',
        },
        {
          kind: 'narration',
          text: '你关闭文件。',
        },
        {
          kind: 'narration',
          text: '房间安静下来。',
        },
        {
          kind: 'narration',
          text: '这不是胜利。',
        },
        {
          kind: 'narration',
          text: '也不是某种终于学会爱自己的时刻。',
        },
        {
          kind: 'narration',
          text: '你只是停止了今晚的谈判。',
        },
        {
          kind: 'narration',
          text: '第二天早上八点十二分，你重新打开电脑。',
        },
        {
          kind: 'narration',
          text: '文件仍然空白。',
        },
        {
          kind: 'narration',
          text: '你没有建立第四份计划。',
        },
        {
          kind: 'narration',
          text: '你写了一封很短的消息：',
        },
        {
          kind: 'message',
          sender: '你',
          paragraphs: ['抱歉，我没有按时完成。', '我需要多一天。'],
          status: 'draft',
          side: 'self',
        },
        {
          kind: 'narration',
          text: '发送以前，你停顿了很久。',
        },
        {
          kind: 'narration',
          text: '最终还是按了下去。',
        },
        {
          kind: 'narration',
          text: '对方没有责怪你。',
        },
        {
          kind: 'narration',
          text: '也没有立刻回复。',
        },
        {
          kind: 'narration',
          text: '截止时间已经错过。',
        },
        {
          kind: 'narration',
          text: '世界却没有因此关闭。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '任务延期。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '后果仍需由你承担。',
        },
        {
          kind: 'system',
          variant: 'permission',
          lines: [{ value: '权限边界已记录。' }],
        },
      ],
      next: 'ch1.merge',
    },

    'ch1.merge': {
      id: 'ch1.merge',
      chapterId: 'chapter_1',
      role: 'merge',
      sectionTitle: '本章汇合',
      blocks: [
        {
          kind: 'system',
          variant: 'status',
          lines: [{ value: '深夜模式即将结束。' }],
        },
        {
          kind: 'narration',
          text: '无论你是否完成任务，Mirror Agent都生成了第一份镜像记录。',
        },
        {
          kind: 'record',
          recordType: 'mirror',
          title: 'MIRROR RECORD / 01',
          paragraphs: [
            '用户并不只是在拖延行动。',
            '用户也在保护一种可能性：',
            `只要还没有真正开始，\n就还无法证明自己只能做到这样。`,
            '用户害怕的不是一个糟糕的版本。',
            `用户害怕的是：\n选择一个版本以后，\n其他更完美的自己将不再同时存在。`,
          ],
        },
        {
          kind: 'narration',
          text: '你关闭记录。',
        },
        {
          kind: 'narration',
          text: '屏幕右下角仍有一处微弱的亮光。',
        },
        {
          kind: 'narration',
          text: '那是一条很久以前的聊天记录。',
        },
        {
          kind: 'narration',
          text: '你没有打开。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '你已经看了它四十七秒。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: '是否需要我分析？',
        },
      ],
      next: 'ch2.forty_seven_seconds',
    },
  },
  metadata: {
    expectedChoiceNodes: 3,
    notes: [
      '信息探索选项只记录标签，不修改四变量。',
      '四条关键分支在 ch1.merge 汇合。',
      'ch1.merge 的下一节点是第二章预留入口 ch2.forty_seven_seconds。',
    ],
  },
} satisfies StoryChapter
