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
 */
export const startupGateContent = {
  title: 'MIRROR AGENT',
  action: '点击进入实验',
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
  title: 'MIRROR AGENT STATUS',
  ariaLabel: 'AI 状态面板',
  hints: {
    /** 普通节点。 */
    normal: '参数校准持续运行',
    /** 节点 ui.mode 为 control 时（第四章失控段落）。 */
    control: '权限边界审查中',
  },
}

/** 结局页的框架文案；五个结局的正文与镜像报告属于 C02。 */
export const endingContent = {
  reportTitle: 'AI 镜像报告',
  /** 不能写成“达成概率”，当前没有真实玩家统计（docs/06 §15）。 */
  rateLabel: '理论路径占比约 ',
  primaryAction: '重新初始化',
}

export const dataErrorContent = {
  eyebrow: 'SYSTEM FAULT',
  title: '实验数据损坏',
  hint: '这是一个开发阶段的数据错误。具体信息见开发控制台，可运行 npm run validate:story 复查剧情数据。',
  primaryAction: '返回开始页并重新初始化',
}
