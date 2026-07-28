/**
 * 非剧情的界面文案。
 *
 * 剧情节点、文本块和选项一律来自 src/data/story/，不放在这里。
 */

export const startContent = {
  titleEn: 'MIRROR AGENT',
  titleZh: '镜中代理',
  subtitle: '你创造了一个 AI。后来，它开始创造你。',
  description: ['这是一次约 10–15 分钟的 AI 心理寓言。', '建议在安静的环境里阅读。'],
  primaryAction: '开始初始化',
}

/** 剧情页的通用按钮文案，不属于任何具体节点。 */
export const gameContent = {
  continueAction: '继续',
  endingGateAction: '查看镜像报告',
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
