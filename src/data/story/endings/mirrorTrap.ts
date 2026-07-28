import type { EndingDefinition } from '../../../types/story'

/**
 * ENGINE TEST PLACEHOLDER —— 镜像困局（隐藏结局）。
 *
 * 正文、镜像报告和路径回声都尚未录入。正式结局文案见 story-source/07-endings.md，
 * 录入属于 C02，这里只保留结局判断和渲染所需的最小结构。
 */
export const mirrorTrapEnding = {
  id: 'mirror_trap',
  title: '镜像困局',
  subtitle: 'ENGINE TEST PLACEHOLDER / 正文未录入',
  body: [
    {
      kind: 'narration',
      text: '【ENGINE TEST】镜像困局结局正文占位（C02 未开始）。',
    },
  ],
  report: {
    title: 'AI 镜像报告 / TEST',
    statusLines: [{ label: '报告', value: '【测试】未生成' }],
    paragraphs: [
      {
        kind: 'narration',
        text: '【ENGINE TEST】镜像报告占位。',
      },
    ],
  },
  finalLine: [
    {
      kind: 'quote',
      text: '【ENGINE TEST】结局余韵占位。',
    },
  ],
  metadata: {
    hidden: true,
  },
} satisfies EndingDefinition
