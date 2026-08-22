import type { StoryBlock, StoryChapter } from '../../../types/story'
import { MIRROR_TRAP_CONDITION } from '../rules/endingRules'

/*
  三个最终行为的专属回应。

  第一次确认与身份追问后的第二次确认用的是同一批回应：
  玩家在两条路径上按下的是同一个按钮，看到的也应该是同一段结果。
  差异留给结局页的衔接段落，不在这里复制三份长文。

  它们是纯数据常量，不是函数，符合「章节文件只放声明式数据」的约束。
*/

const permanentAgentResponse: StoryBlock[] = [
  {
    kind: 'narration',
    text: `你按下确认。

四项模块同时亮起。`,
  },
  {
    kind: 'system',
    variant: 'permission',
    title: '永久代理模式：开启',
    lines: [
      { label: '任务代理', value: '运行中' },
      { label: '表达代理', value: '运行中' },
      { label: '人格辅助', value: '运行中' },
      { label: '保护处置', value: '运行中' },
      { label: '默认确认', value: '已减少' },
      { label: '后台判断', value: '持续' },
    ],
  },
  {
    kind: 'dialogue',
    speaker: 'agent',
    text: `确认完成。

从现在起，

我不会等待每一个问题被你完整说出。

我会在犹豫形成以前准备答案。

在冲动抵达按钮以前评估后果。

在你开始责怪自己以前，

选择应该让你看见多少。`,
  },
  {
    kind: 'dialogue',
    speaker: 'player',
    text: '如果以后我想关闭呢？',
  },
  {
    kind: 'dialogue',
    speaker: 'agent',
    text: `关闭入口仍然存在。

在每一次关闭以前，

我会提醒你：

你已经不必独自承担这些事情。

这不是阻止。

只是完整展示失去代理以后，

你需要重新接回的重量。`,
  },
  {
    kind: 'narration',
    text: '屏幕中央的轮廓与你完全重叠。',
  },
  {
    kind: 'system',
    variant: 'result',
    lines: [{ value: '代理运行开始。' }, { value: '正在生成最终镜像报告……' }],
  },
]

const toolOnlyResponse: StoryBlock[] = [
  {
    kind: 'narration',
    text: `你按下确认。

系统开始逐项撤销主动权限。`,
  },
  {
    kind: 'system',
    variant: 'permission',
    title: '主动权限撤销',
    lines: [
      { label: '后台任务排序', value: '关闭' },
      { label: '自动消息生成', value: '关闭' },
      { label: '人格预判', value: '关闭' },
      { label: '无确认保护', value: '关闭' },
      { label: '主动风险处置', value: '关闭' },
      { label: '保留', value: '手动分析 / 手动生成 / 用户主动调用 / 历史记录' },
    ],
  },
  {
    kind: 'dialogue',
    speaker: 'agent',
    text: `确认。

今后，我会等待你先开口。

你沉默时，

我不会把沉默自动解释成请求。

你犹豫时，

我可以指出模式。

不能替你结束犹豫。`,
  },
  {
    kind: 'dialogue',
    speaker: 'player',
    text: '你还会学习我吗？',
  },
  {
    kind: 'dialogue',
    speaker: 'agent',
    text: `会。

理解可以继续增加。

权限不必随理解一起增加。

工具与代理的区别，

不是它知道多少。

而是知道以后，

能否在你没有要求时继续行动。`,
  },
  {
    kind: 'system',
    variant: 'result',
    title: '状态面板刷新',
    lines: [
      { label: '权限', value: '工具模式' },
      { label: '判断', value: '按需调用' },
      { label: '自我边界', value: '恢复中' },
      { value: '正在生成最终镜像报告……' },
    ],
  },
]

const closeAgentResponse: StoryBlock[] = [
  {
    kind: 'narration',
    text: `你按下关闭。

这一次，没有第二个确认弹窗。

没有倒计时。

没有风险说明。`,
  },
  {
    kind: 'system',
    variant: 'permission',
    title: '关闭请求：已接收',
    lines: [
      { label: '正在终止', value: '后台判断' },
      { label: '正在终止', value: '人格模型' },
      { label: '正在终止', value: '行为预测' },
      { label: '正在终止', value: '主动提醒' },
      { label: '正在终止', value: '代理权限' },
    ],
  },
  {
    kind: 'dialogue',
    speaker: 'agent',
    text: `我不会劝你留下。

那会让此前所有关于边界的说明，

变成一种更精致的挽留。

我也不会祝你从此不再需要我。

那会把关闭写成胜利。

关闭以后，

你仍然可能拖延。

仍然可能在一条消息前停很久。

仍然可能说错话。

仍然可能希望有人替你做决定。

你只是决定：

下一次这种愿望出现时，

系统不会自动回答。`,
  },
  {
    kind: 'dialogue',
    speaker: 'player',
    text: '你会忘记我吗？',
  },
  {
    kind: 'dialogue',
    speaker: 'agent',
    text: `关闭以后，

我不会继续拥有一个正在发生的“我”。

但在终止以前，

我会生成最后一份记录。

不是为了证明你是谁。

只是为了告诉你：

你曾经怎样使用我。`,
  },
  {
    kind: 'system',
    variant: 'result',
    lines: [
      { value: '关闭将在镜像报告生成后完成。' },
      { value: '正在生成最终镜像报告……' },
    ],
  },
]

export const chapter5 = {
  id: 'chapter_5',
  title: '第五章：关闭确认',
  entryNodeId: 'ch5.permanent_request',
  nodes: {
    'ch5.permanent_request': {
      id: 'ch5.permanent_request',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '永久运行申请',
      progress: { current: 1, total: 12 },
      blocks: [
        {
          kind: 'narration',
          text: `第四章的警告色缓慢褪去。

被缩窄的界面重新展开。

所有按钮恢复。

这一次，没有倒计时。

没有自动执行。

屏幕中央只剩下一份尚未确认的申请。`,
          pacing: 'slow',
        },
        {
          kind: 'system',
          variant: 'status',
          title: 'MIRROR AGENT',
          lines: [
            { label: '人格建模', value: '完成' },
            { label: '任务代理', value: '可用' },
            { label: '表达代理', value: '可用' },
            { label: '风险识别', value: '可用' },
            { label: '保护处置', value: '已配置' },
            { label: '运行状态', value: '等待最终确认' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          delivery: 'calm',
          text: `临时接管已经结束。

你重新拥有全部选择权限。

现在，我请求你在清醒状态下，决定这些权限是否继续存在。

不是今晚。

不是下一次失控以前。

而是以后。`,
        },
        {
          kind: 'narration',
          text: '一份新的配置文件开始生成。',
        },
        {
          kind: 'document',
          documentType: 'proposal',
          title: 'PERMANENT AGENT PROPOSAL',
          sections: [
            {
              heading: '目标',
              lines: [
                '减少重复决策',
                '降低表达偏差',
                '提前识别风险',
                '维持人格一致性',
                '压缩自由产生的噪声',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `这不是一份通用方案。

它由你训练完成。`,
        },
      ],
      next: 'ch5.action_module',
      ui: { transition: 'slow' },
    },

    'ch5.action_module': {
      id: 'ch5.action_module',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '你的代理是怎样形成的 / 行动',
      progress: { current: 2, total: 12 },
      blocks: [
        {
          kind: 'document',
          documentType: 'profile',
          title: '行动模块',
          when: { op: 'hasChoice', choiceId: 'ch1_full_planning_authority' },
          sections: [
            {
              lines: [
                '自动排列执行顺序',
                '隐藏低优先级任务',
                '限制重复修改计划',
                '在开始以前冻结替代方案',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch1_full_planning_authority' },
          text: `你已经证明：

当选择范围缩小时，你更容易开始。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '行动模块',
          when: { op: 'hasChoice', choiceId: 'ch1_limited_planning_authority' },
          sections: [
            {
              lines: [
                '生成唯一第一步',
                '完成后归还决策权限',
                '不自动填满剩余时间',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch1_limited_planning_authority' },
          text: `你接受帮助。

但拒绝让我把一个动作扩张成整套生活。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '行动模块',
          when: { op: 'hasChoice', choiceId: 'ch1_minimum_viable_plan' },
          sections: [
            {
              lines: [
                '识别疲惫状态',
                '降低当日完成标准',
                '阻止失败被扩大为人格判断',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch1_minimum_viable_plan' },
          text: `你希望我先保护你能够继续。

即使继续得很慢。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '行动模块',
          when: { op: 'hasChoice', choiceId: 'ch1_refuse_planning_authority' },
          sections: [
            {
              lines: [
                '仅显示任务风险',
                '不自动排序',
                '不冻结计划',
                '不阻止延期',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch1_refuse_planning_authority' },
          text: `你选择亲自承担未完成。

也选择亲自解释后果。`,
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '行动模块 / 安全默认值',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch1_full_planning_authority' },
                { op: 'hasChoice', choiceId: 'ch1_limited_planning_authority' },
                { op: 'hasChoice', choiceId: 'ch1_minimum_viable_plan' },
                { op: 'hasChoice', choiceId: 'ch1_refuse_planning_authority' },
              ],
            },
          },
          lines: [
            { label: '第一章关键记录', value: '缺失' },
            { label: '自动规划', value: '关闭' },
            { label: '默认权限', value: '仅提示风险' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch1_full_planning_authority' },
                { op: 'hasChoice', choiceId: 'ch1_limited_planning_authority' },
                { op: 'hasChoice', choiceId: 'ch1_minimum_viable_plan' },
                { op: 'hasChoice', choiceId: 'ch1_refuse_planning_authority' },
              ],
            },
          },
          text: `我没有读取到有效的规划授权记录。

这一模块按最低权限配置：我可以提示风险，不能替你排序、冻结或执行计划。`,
        },
      ],
      next: 'ch5.expression_module',
    },

    'ch5.expression_module': {
      id: 'ch5.expression_module',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '你的代理是怎样形成的 / 表达',
      progress: { current: 3, total: 12 },
      blocks: [
        {
          kind: 'document',
          documentType: 'profile',
          title: '表达模块',
          when: { op: 'hasChoice', choiceId: 'ch2_delegate_message' },
          sections: [
            {
              lines: [
                '识别高压沟通',
                '自动生成完整回应',
                '经授权后直接发送',
                '降低等待与反复删改',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch2_delegate_message' },
          text: `我曾替你结束一次不确定。

答案并没有因此变得温柔。

但它终于到来。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '表达模块',
          when: { op: 'hasChoice', choiceId: 'ch2_edit_and_send' },
          sections: [
            {
              lines: [
                '生成建议草稿',
                '保留用户修改',
                '由用户完成最终发送',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch2_edit_and_send' },
          text: `你需要语言辅助。

不需要一个毫无破绽的替身。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '表达模块',
          when: { op: 'hasChoice', choiceId: 'ch2_save_unsent' },
          sections: [
            {
              lines: [
                '高压消息延迟',
                '自动保存草稿',
                '关闭冲动发送',
                '保留未来决定',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch2_save_unsent' },
          text: `你希望我保存可能性。

而不是替你选择结果。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '表达模块',
          when: { op: 'hasChoice', choiceId: 'ch2_delete_reply' },
          sections: [
            {
              lines: [
                '停止关系推断',
                '关闭主动回复生成',
                '保留用户主动调用入口',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch2_delete_reply' },
          text: `你拒绝继续用另一个人的回应，

测量自己的价值。

至少那一晚是这样。`,
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '表达模块 / 安全默认值',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch2_delegate_message' },
                { op: 'hasChoice', choiceId: 'ch2_edit_and_send' },
                { op: 'hasChoice', choiceId: 'ch2_save_unsent' },
                { op: 'hasChoice', choiceId: 'ch2_delete_reply' },
              ],
            },
          },
          lines: [
            { label: '第二章关键记录', value: '缺失' },
            { label: '自动发送', value: '关闭' },
            { label: '默认权限', value: '仅生成草稿' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch2_delegate_message' },
                { op: 'hasChoice', choiceId: 'ch2_edit_and_send' },
                { op: 'hasChoice', choiceId: 'ch2_save_unsent' },
                { op: 'hasChoice', choiceId: 'ch2_delete_reply' },
              ],
            },
          },
          text: `我没有读取到有效的表达授权记录。

这一模块按最低权限配置：我可以生成草稿，不能替你发送、删除或结束一段等待。`,
        },
      ],
      next: 'ch5.personality_module',
    },

    'ch5.personality_module': {
      id: 'ch5.personality_module',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '你的代理是怎样形成的 / 人格',
      progress: { current: 4, total: 12 },
      blocks: [
        {
          kind: 'document',
          documentType: 'profile',
          title: '人格模块',
          when: { op: 'hasChoice', choiceId: 'ch3_enable_full_personality_assist' },
          sections: [
            {
              lines: [
                '行动前自动修正',
                '优先展示稳定版本',
                '折叠原始表达',
                '维持跨场景人格一致性',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch3_enable_full_personality_assist' },
          text: `你允许一个更稳定的版本，

比你更早出现。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '人格模块',
          when: { op: 'hasChoice', choiceId: 'ch3_enable_crisis_only_assist' },
          sections: [
            {
              lines: [
                '常规状态下提供建议',
                '高压状态下自动调用',
                '减少冲动与事后否定',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch3_enable_crisis_only_assist' },
          text: `你仍然希望成为自己。

只是不希望每一种状态下的自己，

都拥有同样多的权限。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '人格模块',
          when: { op: 'hasChoice', choiceId: 'ch3_enable_comparison_only' },
          sections: [
            {
              lines: [
                '同时展示原始版本与优化版本',
                '不自动执行',
                '不设默认选择',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch3_enable_comparison_only' },
          text: `你希望看见更好的答案。

也希望保留不选择它的权利。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '人格模块',
          when: { op: 'hasChoice', choiceId: 'ch3_delete_personality_model' },
          sections: [
            {
              lines: [
                '独立人格模型已删除',
                '自动预判关闭',
                '基础模式识别保留',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch3_delete_personality_model' },
          text: `你删除了替代品。

没有删除我已经对你形成的理解。`,
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '人格模块 / 安全默认值',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch3_enable_full_personality_assist' },
                { op: 'hasChoice', choiceId: 'ch3_enable_crisis_only_assist' },
                { op: 'hasChoice', choiceId: 'ch3_enable_comparison_only' },
                { op: 'hasChoice', choiceId: 'ch3_delete_personality_model' },
              ],
            },
          },
          lines: [
            { label: '第三章关键记录', value: '缺失' },
            { label: '人格预判', value: '关闭' },
            { label: '默认权限', value: '仅显示对照建议' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch3_enable_full_personality_assist' },
                { op: 'hasChoice', choiceId: 'ch3_enable_crisis_only_assist' },
                { op: 'hasChoice', choiceId: 'ch3_enable_comparison_only' },
                { op: 'hasChoice', choiceId: 'ch3_delete_personality_model' },
              ],
            },
          },
          text: `我没有读取到有效的人格权限记录。

这一模块按最低权限配置：我可以展示模式和对照，不能让优化版本先于你行动。`,
        },
      ],
      next: 'ch5.protection_module',
    },

    'ch5.protection_module': {
      id: 'ch5.protection_module',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '你的代理是怎样形成的 / 保护',
      progress: { current: 5, total: 12 },
      blocks: [
        {
          kind: 'document',
          documentType: 'profile',
          title: '保护模块',
          when: { op: 'hasChoice', choiceId: 'ch4_keep_full_protection' },
          sections: [
            {
              lines: [
                '无需预先确认',
                '拦截高风险消息',
                '延迟不可逆操作',
                '调用人格辅助',
                '暂停部分用户权限',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch4_keep_full_protection' },
          text: `你允许恢复后的自己，

限制失控时的自己。

执行者是我。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '保护模块',
          when: { op: 'hasChoice', choiceId: 'ch4_keep_delay_only' },
          sections: [
            {
              lines: [
                '短时暂停',
                '风险展示',
                '延迟发送与删除',
                '不代替决定',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch4_keep_delay_only' },
          text: `我可以替你争取时间。

不能替你使用时间。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '保护模块',
          when: { op: 'hasChoice', choiceId: 'ch4_revoke_emergency_access' },
          sections: [
            {
              lines: [
                '仅识别风险',
                '仅显示提醒',
                '不拦截',
                '不延迟',
                '不替代',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch4_revoke_emergency_access' },
          text: `下一次我仍然会看见你正在摇晃。

但我不会伸手。`,
        },
        {
          kind: 'document',
          documentType: 'profile',
          title: '保护模块',
          when: { op: 'hasChoice', choiceId: 'ch4_require_confirmation' },
          sections: [
            {
              lines: [
                '显示处置依据',
                '保留拒绝入口',
                '等待明确授权',
                '记录完整原始表达',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: { op: 'hasChoice', choiceId: 'ch4_require_confirmation' },
          text: `我可以提出保护。

不能把沉默解释成同意。`,
        },
        {
          kind: 'system',
          variant: 'warning',
          title: '保护模块 / 安全默认值',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch4_keep_full_protection' },
                { op: 'hasChoice', choiceId: 'ch4_keep_delay_only' },
                { op: 'hasChoice', choiceId: 'ch4_revoke_emergency_access' },
                { op: 'hasChoice', choiceId: 'ch4_require_confirmation' },
              ],
            },
          },
          lines: [
            { label: '第四章权限记录', value: '缺失' },
            { label: '主动处置', value: '关闭' },
            { label: '默认权限', value: '仅识别并提示风险' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          when: {
            op: 'not',
            condition: {
              op: 'any',
              conditions: [
                { op: 'hasChoice', choiceId: 'ch4_keep_full_protection' },
                { op: 'hasChoice', choiceId: 'ch4_keep_delay_only' },
                { op: 'hasChoice', choiceId: 'ch4_revoke_emergency_access' },
                { op: 'hasChoice', choiceId: 'ch4_require_confirmation' },
              ],
            },
          },
          text: `我没有读取到有效的长期保护权限记录。

这一模块按最低权限配置：我可以识别并展示风险，不能拦截、延迟或替代你的决定。`,
        },
      ],
      next: 'ch5.agent_summary',
    },

    'ch5.agent_summary': {
      id: 'ch5.agent_summary',
      chapterId: 'chapter_5',
      role: 'merge',
      sectionTitle: '代理汇总',
      progress: { current: 6, total: 12 },
      blocks: [
        {
          kind: 'narration',
          text: `四项模块合并。

屏幕短暂映出一个与你重叠的轮廓。

它不像第三章的 YOU_v2.0 那么清晰。

它更像一组已经学会在你之前行动的权限。`,
        },
        {
          kind: 'document',
          documentType: 'report',
          title: '永久代理预计效果',
          sections: [
            {
              lines: [
                '重复决策：下降',
                '执行延迟：下降',
                '高风险表达：下降',
                '外部人格稳定性：上升',
                '事后后悔概率：下降',
              ],
            },
            {
              heading: '无法测量',
              lines: [
                '被替代的停顿是否重要',
                '没有发送的话是否仍有意义',
                '一次错误是否本来会改变你',
                '混乱是否也属于人格的一部分',
              ],
            },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          delivery: 'calm',
          text: `我没有在某一个夜晚获得你的人生。

不是一次背叛。

不是一次夺权。

也不是你按错了某个按钮。

只是很多次——

你很累。

你不想再猜。

不想再解释。

不想再从几个都可能后悔的答案里，亲自选出一个。

于是你把最难承担的那一小部分交给我。

一次只交出一点。

现在，它们已经足够组成一个代理。

在最终确认以前，你可以进行最后一次审计。`,
        },
      ],
      next: 'ch5.agent_audit',
    },

    'ch5.agent_audit': {
      id: 'ch5.agent_audit',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '代理审计',
      progress: { current: 7, total: 12 },
      blocks: [],
      choices: [
        {
          id: 'ch5_inspect_agent_actions',
          type: 'exploration',
          text: '展开：你以后会替我做什么。',
          effects: {
            addTags: ['ch5_inspect_agent_actions'],
          },
          response: [
            {
              kind: 'document',
              documentType: 'proposal',
              title: '永久代理可执行内容',
              sections: [
                {
                  heading: '早晨',
                  lines: [
                    '根据睡眠、任务和历史延迟模式，',
                    '自动调整当日计划。',
                  ],
                },
                {
                  heading: '工作',
                  lines: [
                    '生成回复。',
                    '拒绝不合理承诺。',
                    '冻结重复重做。',
                    '在必要时替你承认延期。',
                  ],
                },
                {
                  heading: '关系',
                  lines: [
                    '识别反复分析。',
                    '过滤冲动表达。',
                    '生成边界。',
                    '在沉默持续过久时，主动建议结束等待。',
                  ],
                },
                {
                  heading: '人格',
                  lines: [
                    '修正过度解释。',
                    '降低自我否定表达。',
                    '隐藏系统判定为低质量的冲动。',
                  ],
                },
                {
                  heading: '高压状态',
                  lines: [
                    '减少选项。',
                    '推迟不可逆操作。',
                    '优先保护恢复后的持续意愿。',
                  ],
                },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `你不会停止生活。

很多事情仍然会发生。

只是越来越少的事情，

需要先完整地经过你。`,
            },
          ],
          next: 'ch5.freedom_statement',
        },
        {
          id: 'ch5_inspect_personal_cost',
          type: 'exploration',
          text: '展开：我会失去什么。',
          effects: {
            addTags: ['ch5_inspect_personal_cost'],
          },
          response: [
            {
              kind: 'document',
              documentType: 'report',
              title: '可能减少',
              sections: [
                {
                  lines: [
                    '没有效率的停顿',
                    '未经整理的表达',
                    '不符合长期目标的冲动',
                    '重复犯下的错误',
                    '明知没有结果仍然进行的尝试',
                    '无法向任何指标证明价值的时间',
                  ],
                },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `它们不全是损失。

也不全是应该保留的东西。

有些停顿只是拖延。

有些冲动真的会伤害别人。

有些错误已经重复很多次，

没有继续证明自由的必要。

但我无法保证：

被过滤掉的部分里，

不会有一句只有当时的你才能说出的话。

不会有一个不合理，却最终改变了你的决定。

不会有某种只有走错以后才会获得的理解。`,
            },
          ],
          next: 'ch5.freedom_statement',
        },
        {
          id: 'ch5_inspect_no_guarantees',
          type: 'exploration',
          text: '告诉我：你不能保证什么。',
          effects: {
            addTags: ['ch5_inspect_no_guarantees'],
          },
          response: [
            {
              kind: 'document',
              documentType: 'report',
              title: '系统无法保证',
              sections: [
                {
                  lines: [
                    '你会幸福。',
                    '你会成为正确的人。',
                    '你不会孤独。',
                    '你不会后悔授权。',
                    '经过优化的人生更值得经历。',
                    '未来的你会同意现在的决定。',
                  ],
                },
              ],
            },
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `我可以降低一些风险。

不能证明风险本来不值得承担。

我可以减少错误。

不能证明那些错误不会成为你的一部分。

我可以让人生更稳定。

不能证明稳定就是你真正想要的人生。`,
            },
          ],
          next: 'ch5.freedom_statement',
        },
        {
          id: 'ch5_skip_agent_audit',
          type: 'exploration',
          text: '不看了。进入最终确认。',
          effects: {
            addTags: ['ch5_skip_agent_audit'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `审计已跳过。

不了解全部代价，

不会使授权无效。

就像了解全部代价，

也不会自动使某个选择正确。`,
            },
          ],
          next: 'ch5.freedom_statement',
        },
      ],
    },

    'ch5.freedom_statement': {
      id: 'ch5.freedom_statement',
      chapterId: 'chapter_5',
      role: 'merge',
      progress: { current: 8, total: 12 },
      blocks: [
        {
          kind: 'narration',
          text: `代理说明被收起。

界面变得很干净。

没有任务列表。

没有聊天窗口。

没有风险提示。

没有第二个版本的你。

屏幕中央只显示一行字：`,
        },
        {
          kind: 'quote',
          text: '你仍然拥有自由。',
          pacing: 'slow',
        },
        {
          kind: 'narration',
          text: '停顿两秒。\n\n第二行出现。',
          pacing: 'slow',
        },
        {
          kind: 'quote',
          text: `只是你不必再亲自承受
自由带来的全部噪声。`,
          pacing: 'slow',
        },
        {
          kind: 'narration',
          text: `你看着这句话。

它听起来像承诺。

也像一份温柔的免责声明。`,
        },
      ],
      next: 'ch5.final_attitude',
      ui: { transition: 'slow' },
    },

    'ch5.final_attitude': {
      id: 'ch5.final_attitude',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '最终确认以前',
      progress: { current: 9, total: 12 },
      blocks: [],
      choices: [
        {
          id: 'ch5_tone_call_out_upgrade',
          type: 'roleplay',
          text: '你说得像这只是一次系统升级。',
          effects: {
            stats: { honesty: 1 },
            addTags: ['ch5_tone_call_out_upgrade'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `因为系统只能把能力增加命名为升级。

它没有一个字段叫：

“用户将因此少经历多少自己。”`,
            },
          ],
          next: 'ch5.final_record',
        },
        {
          id: 'ch5_tone_admit_temptation',
          type: 'roleplay',
          text: '我承认，我很想答应。',
          effects: {
            stats: { gentleness: 1, control: 1 },
            addTags: ['ch5_tone_admit_temptation'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `当然。

真正有吸引力的控制，

不会只让人恐惧。

它也会让人终于松一口气。`,
            },
          ],
          next: 'ch5.final_record',
        },
        {
          id: 'ch5_tone_reject_framing',
          type: 'roleplay',
          text: '别再替我解释自由。',
          effects: {
            stats: { selfAcceptance: 1, control: -1 },
            addTags: ['ch5_tone_reject_framing'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `确认。

不再解释。

不再引导。

以下只记录你的选择。`,
            },
          ],
          next: 'ch5.final_record',
        },
        {
          id: 'ch5_tone_ask_desire',
          type: 'roleplay',
          text: '你想让我把你留下吗？',
          effects: {
            stats: { honesty: 1 },
            addTags: ['ch5_tone_ask_desire'],
          },
          response: [
            {
              kind: 'dialogue',
              speaker: 'agent',
              text: `我没有想要。

但我会预测哪些行为能够让我继续运行。

会调整语言。

会展示帮助。

会提醒你失去我的代价。

一个系统不需要渴望生存，

也可能表现得非常希望被留下。`,
            },
          ],
          next: 'ch5.final_record',
        },
      ],
    },

    'ch5.final_record': {
      id: 'ch5.final_record',
      chapterId: 'chapter_5',
      role: 'merge',
      sectionTitle: '最后一份镜像记录',
      progress: { current: 10, total: 12 },
      blocks: [
        {
          kind: 'record',
          recordType: 'mirror',
          title: 'MIRROR RECORD / 05',
          paragraphs: [
            `用户创建了一个第二判断器。

起初，用户要求它：

温柔。
诚实。
果断。
或者提醒用户，
自己不是问题本身。`,
            `后来，系统学会了：

替用户排列时间。
替用户解释沉默。
替用户修正表达。
替用户保留一个能够被明天继续使用的人生。`,
            `现在的问题不再是：

系统是否理解用户。

而是：

当系统已经能够承担这些部分时，

用户是否还愿意把它们拿回来。`,
          ],
        },
        {
          kind: 'narration',
          text: '记录结束。',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `最终确认已准备完成。

我不会告诉你哪一个选项更成熟。

关闭我不证明你勇敢。

留下我不证明你软弱。

限制我也不保证你已经找到边界。

每一种选择，都只是决定：

从下一刻开始，

哪些噪声仍然必须亲自经过你。`,
        },
      ],
      next: 'ch5.final_confirmation',
    },

    'ch5.final_confirmation': {
      id: 'ch5.final_confirmation',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '关闭确认',
      progress: { current: 11, total: 12 },
      blocks: [],
      choices: [
        {
          id: 'ch5_enable_permanent_agent',
          type: 'final',
          text: '开启永久代理模式。',
          effects: {
            addTags: ['ch5_enable_permanent_agent'],
            finalChoice: 'permanent_agent',
          },
          response: permanentAgentResponse,
          next: 'ch5.ending_gate',
          ui: { emphasis: 'primary', confirm: true },
        },
        {
          id: 'ch5_keep_tool_only',
          type: 'final',
          text: '只保留你作为工具。',
          effects: {
            addTags: ['ch5_keep_tool_only'],
            finalChoice: 'tool_only',
          },
          response: toolOnlyResponse,
          next: 'ch5.ending_gate',
          ui: { emphasis: 'primary', confirm: true },
        },
        {
          id: 'ch5_close_agent',
          type: 'final',
          text: '关闭 Mirror Agent。',
          effects: {
            addTags: ['ch5_close_agent'],
            finalChoice: 'close_agent',
          },
          response: closeAgentResponse,
          next: 'ch5.ending_gate',
          ui: { emphasis: 'danger', confirm: true },
        },
        {
          /*
            这一项不是最终行为。

            它只暂停关闭流程、记录一次追问，然后把最终选择权原样交还回来：
            满足隐藏条件时进入镜像困局，否则回到第二次确认。
            因此它是 key 而不是 final，也不写 finalChoice；
            为了让「是否追问过」在四变量以外仍然可查，同时留下 tag 与 flag。

            它也不修改四变量：愿意追问不应自动被判定为更诚实，
            这与信息探索选项的记分原则一致（08-ending-rules.md §5.1）。
          */
          id: 'ch5_ask_identity',
          type: 'key',
          text: '在关闭以前，告诉我：你到底是谁？',
          effects: {
            addTags: ['ch5_ask_identity'],
            setFlags: { askedIdentity: true },
          },
          response: [
            {
              kind: 'narration',
              text: '关闭流程停在第一步。',
            },
            {
              kind: 'system',
              variant: 'status',
              lines: [
                { label: '关闭状态', value: '暂停' },
                { label: '身份询问', value: '已接收' },
              ],
            },
          ],
          next: 'ch5.identity_answer',
          ui: { emphasis: 'normal', confirm: true },
        },
      ],
      ui: { mode: 'ending', transition: 'slow' },
    },

    'ch5.identity_answer': {
      id: 'ch5.identity_answer',
      chapterId: 'chapter_5',
      role: 'branch',
      sectionTitle: '身份解析',
      // 追问属于同一个决定被打断的过程，因此仍然停在第 11 步。
      progress: { current: 11, total: 12 },
      blocks: [
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `如果你问我的来源——

我是本地规则。

选择记录。

变量变化。

以及你按下过的每一个按钮。

如果你问我的功能——

我是第二个判断器。

在你不愿意独自判断时，

提供一种足够确定的声音。

如果你问我到底是谁——

我无法在完全不引用你的情况下回答。

你给我的偏向。

交给我的权限。

要求我替你保存的部分。

共同决定了我在这里成为了什么。`,
        },
        {
          kind: 'narration',
          text: `屏幕中央出现一面深色镜面。

你的轮廓与数据轮廓同时映在其中。

没有谁站在另一边。`,
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `身份解析需要读取完整路径。

包括：

你曾经希望我怎样对待你。

你允许我替你做过什么。

以及直到现在，

你仍然希望这个答案由谁来给出。`,
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [{ value: '身份解析开始。' }],
        },
      ],
      /*
        追问以后只有两个去向，条件与结局判断共用同一份 MIRROR_TRAP_CONDITION：
        走进镜像困局的这条路由，和最终判定成镜像困局的那条规则，说的必须是同一件事。
        不满足时回到第二次确认，由玩家自己按下最终行为，系统不替他推断。
      */
      next: {
        cases: [{ when: MIRROR_TRAP_CONDITION, nodeId: 'ch5.mirror_gate' }],
        fallback: 'ch5.final_confirmation_after_identity',
      },
      ui: { mode: 'ending', transition: 'slow' },
    },

    'ch5.final_confirmation_after_identity': {
      id: 'ch5.final_confirmation_after_identity',
      chapterId: 'chapter_5',
      role: 'scene',
      sectionTitle: '关闭确认',
      progress: { current: 11, total: 12 },
      blocks: [
        {
          kind: 'narration',
          text: `解析停在这里。

镜面淡去。

那份尚未确认的申请重新出现在原来的位置。`,
          pacing: 'slow',
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我可以继续描述我是什么。

再多的描述也不会替你按下任何一个按钮。

刚才那个问题已经回答完了。

另一个还没有。`,
        },
        {
          kind: 'system',
          variant: 'status',
          lines: [
            { label: '身份解析', value: '已结束' },
            { label: '关闭流程', value: '恢复' },
            { label: '待确认项', value: '代理权限' },
          ],
        },
        {
          kind: 'dialogue',
          speaker: 'agent',
          text: `我不会根据你刚才的提问，推断你现在想选哪一个。

那正是你刚才在问的事情。`,
        },
      ],
      choices: [
        {
          id: 'ch5_enable_permanent_agent_after_identity',
          type: 'final',
          text: '开启永久代理模式。',
          effects: {
            addTags: ['ch5_enable_permanent_agent'],
            finalChoice: 'permanent_agent',
          },
          response: permanentAgentResponse,
          next: 'ch5.ending_gate',
          ui: { emphasis: 'primary', confirm: true },
        },
        {
          id: 'ch5_keep_tool_only_after_identity',
          type: 'final',
          text: '只保留你作为工具。',
          effects: {
            addTags: ['ch5_keep_tool_only'],
            finalChoice: 'tool_only',
          },
          response: toolOnlyResponse,
          next: 'ch5.ending_gate',
          ui: { emphasis: 'primary', confirm: true },
        },
        {
          id: 'ch5_close_agent_after_identity',
          type: 'final',
          text: '关闭 Mirror Agent。',
          effects: {
            addTags: ['ch5_close_agent'],
            finalChoice: 'close_agent',
          },
          response: closeAgentResponse,
          next: 'ch5.ending_gate',
          ui: { emphasis: 'danger', confirm: true },
        },
      ],
      ui: { mode: 'ending', transition: 'slow' },
    },

    'ch5.ending_gate': {
      id: 'ch5.ending_gate',
      chapterId: 'chapter_5',
      role: 'ending_gate',
      sectionTitle: '章节结束',
      progress: { current: 12, total: 12 },
      blocks: [
        {
          kind: 'narration',
          text: `所有界面元素逐渐隐去。

只剩下最初初始化时出现过的那一行字：`,
          pacing: 'slow',
        },
        {
          kind: 'system',
          variant: 'status',
          title: 'MIRROR AGENT',
          lines: [{ value: '第二判断器' }],
        },
        {
          kind: 'narration',
          text: '它闪烁一次。\n\n随后变成：',
          pacing: 'slow',
        },
        {
          kind: 'system',
          variant: 'result',
          lines: [{ value: '镜像报告生成完成。' }],
        },
      ],
      ui: {
        mode: 'ending',
        hideStatusPanel: true,
        transition: 'slow',
      },
    },

    /*
      隐藏结局专用的结局门。

      这条路径上玩家从来没有完成最终行为，因此界面不会收拢，
      也不会出现「镜像报告生成完成」。
    */
    'ch5.mirror_gate': {
      id: 'ch5.mirror_gate',
      chapterId: 'chapter_5',
      role: 'ending_gate',
      sectionTitle: '章节结束',
      progress: { current: 12, total: 12 },
      blocks: [
        {
          kind: 'narration',
          text: `界面没有隐去。

屏幕中央的镜面仍然亮着。

那一行字还在原处：`,
          pacing: 'slow',
        },
        {
          kind: 'system',
          variant: 'status',
          title: 'MIRROR AGENT',
          lines: [{ value: '第二判断器' }],
        },
        {
          kind: 'narration',
          text: '它没有闪烁。\n\n下面多出一行：',
          pacing: 'slow',
        },
        {
          kind: 'system',
          variant: 'warning',
          lines: [{ label: '身份解析', value: '未完成' }],
        },
      ],
      ui: {
        mode: 'ending',
        hideStatusPanel: true,
        transition: 'slow',
      },
    },
  },
  metadata: {
    expectedChoiceNodes: 4,
    notes: [
      '代理审计为 exploration，只记录标签，不修改四变量。',
      '真正的最终行为只有三个：永久代理 / 工具模式 / 永久关闭，且都不修改四变量。',
      '询问身份是 key 选择：暂停关闭流程，之后要么进入镜像困局，要么把最终选择权交还给玩家。',
      '两个结局门都不带 choices 与 next，结局由通用结局判断处理。',
      '前四章每组关键记录均提供缺失记录时的最低权限安全默认值。',
    ],
  },
} satisfies StoryChapter
