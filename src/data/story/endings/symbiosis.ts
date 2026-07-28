import type { EndingDefinition } from '../../../types/story'

/**
 * ENGINE TEST PLACEHOLDER —— 共生工具。
 *
 * 正文、镜像报告和路径回声都尚未录入。正式结局文案见 story-source/07-endings.md，
 * 录入属于 C02，这里只保留结局判断和渲染所需的最小结构。
 */
export const symbiosisEnding = {
  id: 'symbiosis',
  title: '共生工具',
  subtitle: 'ENGINE TEST PLACEHOLDER / 正文未录入',
  preludeVariants: [
    {
      id: 'symbiosis_after_identity',
      when: { op: 'finalChoice', equals: 'ask_identity' },
      blocks: [
        {
          kind: 'narration',
          text: '【测试衔接】身份追问之后转入共生工具的占位文本。',
        },
      ],
    },
  ],
  body: [
    {
      kind: 'narration',
      text: '【ENGINE TEST】共生工具结局正文占位（C02 未开始）。',
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
} satisfies EndingDefinition
