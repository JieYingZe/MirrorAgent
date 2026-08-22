/**
 * 非剧情的界面文案。
 *
 * 剧情节点、文本块和选项一律来自 src/data/story/，不放在这里。
 */

/**
 * 启动遮罩（A01）。
 *
 * 三行文案由 docs/05-assets-map.md §8 与 docs/03-interaction-design.md §3.1 规定，
 * 不要在这里加第四行说明：遮罩只承担「一次用户手势」这一件事。
 *
 * 两个按钮（A03 试玩修订）：「启动实验」按当前音频偏好解锁声音，
 * 「静默启动」把两路通道都关掉、不解锁音频，两者都会关闭遮罩。
 */
export const startupGateContent = {
  title: 'Mirror Agent',
  action: '启动实验',
  silentAction: '静默启动',
  hint: '建议佩戴耳机',
}

/**
 * 全局音频控件（A01 建立，A03 试玩修订拆成两个通道）。
 *
 * 原来只有一个静音按钮，玩家要么全有声要么全无声。实际试玩里这两类声音的取舍
 * 是独立的，因此拆成「背景音乐」和「音效」两个开关，不再保留第三个总开关。
 *
 * 按钮上有可见的通道名与开／关状态，状态不只靠图标表达；
 * aria-label 与 title 再把「当前状态 + 点击后会发生什么」说完整。
 */
export const audioContent = {
  groupLabel: '音频控制',
  bgm: {
    /** 按钮上的可见短名；完整名称放在 aria-label 与 title 里。 */
    shortName: '音乐',
    ariaOn: '背景音乐：已开启，点击关闭',
    ariaOff: '背景音乐：已关闭，点击开启',
  },
  sfx: {
    shortName: '音效',
    ariaOn: '音效：已开启，点击关闭',
    ariaOff: '音效：已关闭，点击开启',
  },
  /** 可见的状态字，与 aria-label 表达同一件事。 */
  stateOn: '开',
  stateOff: '关',
}

export const startContent = {
  titleEn: 'MIRROR AGENT',
  titleZh: '镜中代理',
  subtitle: '你创造了一个 AI。后来，它开始创造你。',
  description: ['这是一次约 10–15 分钟的 AI 心理寓言。', '建议在安静的环境里阅读。'],
  primaryAction: '开始初始化',
  /** 存在未完成存档时替换主按钮。 */
  continueAction: '继续实验',
  /** 存在未完成存档时的次按钮，与结局页共用同一个重新初始化流程。 */
  restartAction: '重新初始化',
}

/** 剧情页的通用按钮与阅读提示文案，不属于任何具体节点。 */
export const gameContent = {
  continueAction: '继续',
  endingGateAction: '查看镜像报告',
  /**
   * 正文播放中的提示，显示在交互区位置。
   *
   * 两种偏好下的动作不同：关闭自动播放时点击是「读下一段」，
   * 开启时点击是「把这一页看完」，提示必须如实反映当前行为。
   */
  readingHintManual: '点击 / Enter / 空格 继续阅读',
  readingHintAutoplay: '自动播放中 · 点击可显示整页',

  /** 自动播放开关。默认关闭，偏好保存在独立的本地用户偏好里。 */
  autoplayLabel: '自动播放',
  autoplayStateOn: '开',
  autoplayStateOff: '关',
  autoplayAriaOn: '自动播放：已开启',
  autoplayAriaOff: '自动播放：已关闭',
  /**
   * 正文显示完成时的一次性播报。
   *
   * 只播报状态，不逐字播报正文（见 docs/03-interaction-design.md §11）。
   */
  readingCompleteHint: '本节文本已显示完毕。',
  choicesReadyHint: '选择现已可用。',
}

/**
 * AI 状态面板的框架文案。
 *
 * 四个状态项的标签与文案由变量映射推导，见 src/utils/aiStatus.ts；
 * 这里只保留标题、无障碍名称和系统提示语。
 */
export const statusPanelContent = {
  /*
    标题与运行提示并排在面板第一行（V03，对齐 design/ui-mockups/ui-game-desktop.webp）。
    原来的 'MIRROR AGENT STATUS' 独占一行，加上提示语之后在 260px 的面板里放不下；
    英文改为出现在每个状态项的副标上，标题本身收成中文短标。
  */
  title: 'AI 状态',
  ariaLabel: 'AI 状态面板',
  hints: {
    /** 普通节点。 */
    normal: '实时监测',
    /** 节点 ui.mode 为 control 时（第四章失控段落）。 */
    control: '权限审查中',
  },
}

/** 结局页的框架文案；五个结局的正文与镜像报告属于 C02。 */
export const endingContent = {
  eyebrow: '结局达成',
  bodyTitle: '结局正文',
  reportTitle: 'AI 镜像报告',
  statSummaryTitle: '状态摘要',
  /*
    理论路径占比（docs/06 §15）。

    这条文案曾经只出现在结局页的开发验证区里，那一整块后来移到了控制台；
    现在它作为正式界面文案回到标题区 —— 玩家看完自己的结局以后，
    「这条路有多少人走得到」是一次安静的收尾里少数适合出现的趣味信息。

    措辞是硬约束：必须带“理论”或“估算”字样，不能写成“达成概率”或“达成率”。
    当前没有后端，也没有任何真实玩家统计，数字来自剧情规则的结构模拟；
    “概率”会让玩家误认为这是实时数据或随机结果。
    未来真的接入匿名统计时，改的是这里的措辞，不是数字来源。

    标签收成四个字：它排在副标题右边，与状态面板那几个短标（语气／反馈／权限／边界）
    是同一类东西，六个字的“理论路径占比”在那个位置又长又拗口。
    “路径”这层意思交给悬停说明，那里有完整的一句话。
  */
  rateLabel: '理论占比',
  rateValuePrefix: '约 ',
  rateHint: '在当前剧情规则中，约有这个比例的选择路径会抵达这个结局。这不是玩家达成率。',
  primaryAction: '重新初始化',
  primaryHint: '开启一段新的对话',
  copyAction: '复制我的镜像报告',
  copiedFeedback: '已复制镜像报告',
  copyFailedFeedback: '无法访问剪贴板，请手动复制下面的内容。',
  copyFallbackLabel: '镜像报告全文（可手动复制）',
}

/**
 * 复制出去的镜像报告里那几行固定标题（S01）。
 *
 * 与 endingContent 分开：这些字不出现在界面上，是玩家粘贴到别处之后
 * 别人会读到的内容，格式由 docs/03-interaction-design.md §6.2 规定。
 */
export const endingReportLabels = {
  heading: '《镜中代理 Mirror Agent》',
  endingLabel: '我的结局：',
  reportLabel: 'AI 镜像报告：',
  statusLabel: '状态记录：',
}

export const dataErrorContent = {
  eyebrow: 'SYSTEM FAULT',
  title: '实验数据损坏',
  hint: '这是一个开发阶段的数据错误。具体信息见开发控制台，可运行 npm run validate:story 复查剧情数据。',
  primaryAction: '返回开始页并重新初始化',
}
