/**
 * 第一阶段占位数据。
 *
 * 只用于验证 StartPage → GamePage → EndingPage 的最小流转，
 * 正式剧情数据结构（story.json、章节、选项变量影响）将在后续阶段实现。
 */

export const startContent = {
  titleEn: 'MIRROR AGENT',
  titleZh: '镜中代理',
  subtitle: '你创造了一个 AI。后来，它开始创造你。',
  description: [
    '这是一次约 10–15 分钟的 AI 心理寓言。',
    '建议在安静的环境里阅读。',
  ],
  primaryAction: '开始初始化',
}

export const demoChapter = {
  stageLabel: 'PROLOGUE / 序章',
  progress: '00 / 06',
  title: '创建你的代理',
  paragraphs: [
    '系统连接已建立。',
    '我不是你的助手。\n我是你留在世界里的第二个判断器。',
    '在开始之前，我需要知道你希望我用什么方式对待你。',
  ],
  choices: [
    { id: 'demo-gentle', text: '请温柔一点，我已经很累了。' },
    { id: 'demo-honest', text: '请诚实一点，不要骗我。' },
  ],
}

export const demoStatus = {
  title: 'MIRROR AGENT STATUS',
  items: [
    { label: '语气', value: '校准中' },
    { label: '反馈', value: '等待输入' },
    { label: '权限', value: '工具模式' },
    { label: '自我边界', value: '尚未建立' },
  ],
}

export const demoEnding = {
  title: '实验流程预览完成',
  description: [
    '本轮只是一次流程验证。',
    '正式的章节、变量与结局判断尚未接入，你现在看到的是结局页的骨架。',
  ],
  report: {
    title: 'AI 镜像报告',
    lines: [
      '记录尚未生成。',
      '当正式实验开始后，这里会写下我对你的观察。',
    ],
  },
  primaryAction: '重新初始化',
}
