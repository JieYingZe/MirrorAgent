import { describe, expect, it } from 'vitest'
import type { EndingDefinition, EndingVariant, StoryBlock } from '../src/types/story'
import type { Stats } from '../src/types/game'
import { blocksToPlainText } from '../src/utils/story/blockText'
import { buildEndingReportText } from '../src/utils/story/endingReportText'
import type { EndingView } from '../src/utils/story/getEnding'
import { endings } from '../src/data/story'
import { buildEndingView } from '../src/utils/story/getEnding'
import { createInitialStoryState } from '../src/utils/story/storyState'

/**
 * 复制出去的镜像报告是给玩家粘贴到别处的纯文本（S01 / docs/03 §6.2）。
 *
 * 两条底线在这里守住：
 * - 界面上看得见的内容都要复制到；
 * - 只进控制台的那些（规则 ID、节点 ID、变量裸数字）一个都不能漏出去。
 */

const LABELS = {
  heading: '《镜中代理 Mirror Agent》',
  endingLabel: '我的结局：',
  reportLabel: 'AI 镜像报告：',
  statusLabel: '状态记录：',
}

function makeStats(overrides: Partial<Stats> = {}): Stats {
  return { gentleness: 0, honesty: 0, control: 0, selfAcceptance: 0, ...overrides }
}

describe('blocksToPlainText', () => {
  it('flattens every block kind that carries text', () => {
    const blocks: StoryBlock[] = [
      { kind: 'narration', text: '第一段。\n第二段。' },
      { kind: 'dialogue', speaker: 'agent', speakerLabel: '镜中人', text: '一句话。' },
      { kind: 'quote', text: '引用。' },
      { kind: 'system', variant: 'status', title: '系统', lines: [{ label: '权限', value: '工具模式' }] },
      {
        kind: 'record',
        recordType: 'mirror',
        title: '记录',
        paragraphs: ['一段记录。'],
        entries: [{ label: '来源', value: ['A', 'B'] }],
      },
      { kind: 'message', sender: '对方', paragraphs: ['消息正文。'] },
      {
        kind: 'document',
        documentType: 'report',
        title: '文件',
        sections: [{ heading: '小节', lines: ['一行。'] }],
      },
    ]

    expect(blocksToPlainText(blocks)).toBe(
      [
        '第一段。\n第二段。',
        '镜中人：一句话。',
        '引用。',
        '系统\n权限：工具模式',
        '记录\n一段记录。\n来源：A，B',
        '对方：\n消息正文。',
        '文件\n小节\n一行。',
      ].join('\n\n'),
    )
  })

  it('drops blocks with no content instead of leaving blank gaps', () => {
    const blocks: StoryBlock[] = [
      { kind: 'narration', text: '有内容。' },
      { kind: 'narration', text: '   ' },
      { kind: 'divider' },
      { kind: 'system', variant: 'status', lines: [] },
      { kind: 'narration', text: '也有内容。' },
    ]

    expect(blocksToPlainText(blocks)).toBe('有内容。\n\n也有内容。')
  })

  it('keeps a divider label when it has one', () => {
    expect(blocksToPlainText([{ kind: 'divider', label: '分界' }])).toBe('分界')
  })

  it('returns an empty string for an empty list', () => {
    expect(blocksToPlainText([])).toBe('')
  })
})

describe('buildEndingReportText', () => {
  const ending = {
    id: 'symbiosis',
    variants: [],
    report: { statusLines: [], paragraphs: [], variants: [] },
  } as unknown as EndingDefinition

  const variant: EndingVariant = {
    id: 'symbiosis_cautious',
    title: '谨慎共生',
    subtitle: '关系还没有定型。',
  }

  const view: EndingView = {
    ending,
    variant,
    title: variant.title,
    subtitle: variant.subtitle,
    statusLines: [],
    bodyBlocks: [{ kind: 'narration', text: '结局正文，不进复制。' }],
    reportBlocks: [{ kind: 'narration', text: '报告第一段。' }],
    echoBlocks: [{ kind: 'narration', text: '路径回声。' }],
    finalLineBlocks: [{ kind: 'quote', text: '结尾句。' }],
  }

  it('follows the section order from docs/03 §6.2', () => {
    expect(buildEndingReportText(view, makeStats(), LABELS)).toBe(
      [
        '《镜中代理 Mirror Agent》',
        '我的结局：谨慎共生',
        'AI 镜像报告：\n报告第一段。',
        '路径回声。',
        '状态记录：\n- 语气：中性输出\n- 反馈：委婉过滤\n- 权限：工具模式\n- 边界：尚未确认',
        '结尾句。',
      ].join('\n\n'),
    )
  })

  it('skips empty sections without leaving double blank lines', () => {
    const sparse: EndingView = {
      ...view,
      bodyBlocks: [],
      reportBlocks: [],
      echoBlocks: [],
      finalLineBlocks: [],
    }

    const text = buildEndingReportText(sparse, makeStats(), LABELS)

    expect(text).not.toMatch(/\n{3}/)
    expect(text).toContain('状态记录：')
    expect(text).not.toContain('AI 镜像报告：')
  })

  it('tracks the stats it is given', () => {
    const text = buildEndingReportText(view, makeStats({ control: 8, selfAcceptance: 12 }), LABELS)

    expect(text).toContain('- 权限：接管倾向')
    expect(text).toContain('- 边界：清晰稳定')
  })

  /*
    最重要的一条：复制出去的东西不能带上只该进控制台的信息。
    用正式结局数据跑，避免手写的假 view 恰好绕过问题。
    每个玩家可见结局都跑一遍：复制出去的标题必须是变体标题。
  */
  it('never leaks rule ids, node ids or raw stat numbers', () => {
    const state = {
      ...createInitialStoryState(),
      stats: makeStats({ gentleness: 9, honesty: 15, control: -7, selfAcceptance: 12 }),
    }

    for (const definition of Object.values(endings)) {
      for (const endingVariant of definition.variants) {
        const text = buildEndingReportText(
          buildEndingView(definition, endingVariant, state),
          state.stats,
          LABELS,
        )

        expect(text).not.toMatch(/gentleness|honesty|control|selfAcceptance/i)
        expect(text).not.toMatch(/\bch\d\.|\brule_|schemaVersion/i)
        expect(text).toContain(endingVariant.title)
        expect(text).toContain('状态记录：')
      }
    }
  })
})
