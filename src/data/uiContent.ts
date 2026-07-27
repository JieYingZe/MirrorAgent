/**
 * 非剧情的界面文案。
 *
 * 剧情章节、段落和选项一律来自 story.json，不放在这里。
 * 状态面板与结局页目前仍是占位内容，会在 I02 / C02 阶段被正式实现替换。
 */

export const startContent = {
  titleEn: 'MIRROR AGENT',
  titleZh: '镜中代理',
  subtitle: '你创造了一个 AI。后来，它开始创造你。',
  description: ['这是一次约 10–15 分钟的 AI 心理寓言。', '建议在安静的环境里阅读。'],
  primaryAction: '开始初始化',
}

/** 静态占位；正式的状态文案映射属于 I02。 */
export const statusPanelPlaceholder = {
  title: 'MIRROR AGENT STATUS',
  items: [
    { label: '语气', value: '校准中' },
    { label: '反馈', value: '等待输入' },
    { label: '权限', value: '工具模式' },
    { label: '自我边界', value: '尚未建立' },
  ],
}

/** 占位结局；五个正式结局与镜像报告属于 C02 / R01。 */
export const endingPlaceholder = {
  title: '实验数据记录完成',
  description: [
    '本轮只是一次数据验证。',
    '正式的结局判断与镜像报告尚未接入，你现在看到的是结局页的骨架。',
  ],
  report: {
    title: 'AI 镜像报告',
    lines: ['记录尚未生成。', '当正式实验开始后，这里会写下我对你的观察。'],
  },
  primaryAction: '重新初始化',
}

export const dataErrorContent = {
  eyebrow: 'SYSTEM FAULT',
  title: '实验数据损坏',
  hint: '这是一个开发阶段的数据错误，请检查 story.json 后重试。',
  primaryAction: '重新初始化',
}
