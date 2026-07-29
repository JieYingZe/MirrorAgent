import { describe, expect, it } from 'vitest'
import type { StoryBlock } from '../src/types/story'
import { splitGraphemes, splitGraphemesFallback } from '../src/utils/graphemes'
import {
  READING_TIMING,
  buildBlockRevealPlan,
  buildRevealSteps,
  buildSequencePlan,
  resolveCharBaseMs,
  resolveInterBlockDelay,
} from '../src/utils/story/readingPlan'
import {
  getDocumentUnits,
  getMessageUnits,
  getRecordUnits,
  getSystemUnits,
  isBlockEmpty,
} from '../src/utils/story/readingUnits'

/**
 * 揭示计划是纯计算：给定文本块，算出「第几步显示到第几项、之后等多久」。
 * 这里不涉及 React、timer 和 DOM。
 */

/** 写成转义序列，避免测试文件里出现不可见字符。 */
const FAMILY = '\u{1f469}\u{200d}\u{1f469}\u{200d}\u{1f467}'
const THUMBS_UP_TONE = '\u{1f44d}\u{1f3fd}'
const FLAG_CN = '\u{1f1e8}\u{1f1f3}'
const E_ACUTE_COMBINING = 'e\u{301}'
const KEYCAP_ONE = '1\u{fe0f}\u{20e3}'

function totalDelay(steps: ReadonlyArray<{ delay: number }>): number {
  return steps.reduce((sum, step) => sum + step.delay, 0)
}

describe('splitGraphemes', () => {
  const cases: Array<[string, string, number]> = [
    ['ZWJ 家庭 emoji', FAMILY, 1],
    ['肤色修饰符', THUMBS_UP_TONE, 1],
    ['国旗', FLAG_CN, 1],
    ['组合重音', E_ACUTE_COMBINING, 1],
    ['keycap', KEYCAP_ONE, 1],
    ['汉字', '镜中代理', 4],
    ['单个标点', '。', 1],
    ['连续标点', '……！', 3],
    ['换行', 'a\nb', 3],
    ['空串', '', 0],
  ]

  for (const [name, text, expected] of cases) {
    it(`${name} 切成 ${expected} 个字素`, () => {
      expect(splitGraphemes(text)).toHaveLength(expected)
      expect(splitGraphemesFallback(text)).toHaveLength(expected)
    })
  }

  it('切分后拼回原文，不丢字也不改字', () => {
    const text = `记录不是指控。${FAMILY}${THUMBS_UP_TONE}${FLAG_CN}\n${E_ACUTE_COMBINING}`

    expect(splitGraphemes(text).join('')).toBe(text)
    expect(splitGraphemesFallback(text).join('')).toBe(text)
  })

  it('两个国旗不会被并成一个字素', () => {
    expect(splitGraphemes(`${FLAG_CN}${FLAG_CN}`)).toHaveLength(2)
    expect(splitGraphemesFallback(`${FLAG_CN}${FLAG_CN}`)).toHaveLength(2)
  })
})

describe('buildRevealSteps', () => {
  it('最后一步一定揭示到全部，且之后不再等待', () => {
    const steps = buildRevealSteps([20, 20, 20], 6000)

    expect(steps.at(-1)).toEqual({ upTo: 3, delay: 0 })
    expect(steps.map((step) => step.upTo)).toEqual([1, 2, 3])
  })

  it('单项内容一步显示完', () => {
    expect(buildRevealSteps([22], 6000)).toEqual([{ upTo: 1, delay: 0 }])
  })

  it('没有内容就没有步骤', () => {
    expect(buildRevealSteps([], 6000)).toEqual([])
  })

  it('间隔过小的相邻项合并成一步，避免排出一串几乎同时到期的 timer', () => {
    const steps = buildRevealSteps([4, 4, 4, 4, 4, 4], 6000)

    // 4ms < minStepMs，必须合并；每一步的间隔都不小于 minStepMs。
    expect(steps.length).toBeLessThan(6)

    for (const step of steps.slice(0, -1)) {
      expect(step.delay).toBeGreaterThanOrEqual(READING_TIMING.minStepMs)
    }

    expect(steps.at(-1)?.upTo).toBe(6)
  })

  it('超过上限时整体按比例缩短，但一项内容都不会少', () => {
    const delays = new Array<number>(500).fill(60)
    const steps = buildRevealSteps(delays, READING_TIMING.maxCharsBlockMs)

    expect(totalDelay(steps)).toBeLessThanOrEqual(READING_TIMING.maxCharsBlockMs + 500)
    expect(steps.at(-1)?.upTo).toBe(500)
  })

  it('upTo 单调不减', () => {
    const steps = buildRevealSteps([22, 120, 22, 8, 8, 95], 6000)
    let previous = 0

    for (const step of steps) {
      expect(step.upTo).toBeGreaterThan(previous)
      previous = step.upTo
    }
  })
})

describe('buildBlockRevealPlan: 字符型块', () => {
  it('narration 按 grapheme 逐字', () => {
    const block: StoryBlock = { kind: 'narration', text: '你创造了一个 AI。' }
    const plan = buildBlockRevealPlan(block)

    expect(plan.mode).toBe('chars')
    expect(plan.total).toBe(splitGraphemes(block.text).length)
    expect(plan.graphemes.join('')).toBe(block.text)
  })

  it('dialogue 的 direct 比 soft 快，quote 与 slow 最慢', () => {
    expect(resolveCharBaseMs({ kind: 'dialogue', speaker: 'agent', text: 'a', delivery: 'direct' })).toBe(
      READING_TIMING.direct,
    )
    expect(resolveCharBaseMs({ kind: 'dialogue', speaker: 'agent', text: 'a', delivery: 'soft' })).toBe(
      READING_TIMING.soft,
    )
    expect(resolveCharBaseMs({ kind: 'dialogue', speaker: 'agent', text: 'a', delivery: 'calm' })).toBe(
      READING_TIMING.normal,
    )
    expect(resolveCharBaseMs({ kind: 'quote', text: 'a' })).toBe(READING_TIMING.slow)
    expect(resolveCharBaseMs({ kind: 'narration', text: 'a', pacing: 'slow' })).toBe(
      READING_TIMING.slow,
    )
  })

  it('句末标点比逗号停得久，逗号又比普通字久', () => {
    const plain = buildBlockRevealPlan({ kind: 'narration', text: '一二三四' })
    const soft = buildBlockRevealPlan({ kind: 'narration', text: '一二三，' })
    const hard = buildBlockRevealPlan({ kind: 'narration', text: '一二三。' })

    // 最后一个字之后不再等待，所以比较的是前三个字的间隔。
    const plainMid = buildBlockRevealPlan({ kind: 'narration', text: '一二三四五' })
    const softMid = buildBlockRevealPlan({ kind: 'narration', text: '一二，四五' })
    const hardMid = buildBlockRevealPlan({ kind: 'narration', text: '一二。四五' })

    expect(totalDelay(plain.steps)).toBeLessThan(totalDelay(softMid.steps))
    expect(totalDelay(softMid.steps)).toBeLessThan(totalDelay(hardMid.steps))
    expect(totalDelay(soft.steps)).toBe(totalDelay(hard.steps))
    expect(totalDelay(plainMid.steps)).toBeLessThan(totalDelay(softMid.steps))
  })

  it('很短的一句用更短的段间停顿', () => {
    expect(resolveInterBlockDelay({ kind: 'narration', text: '好。' }, 2)).toBe(
      READING_TIMING.interBlockShortText,
    )
    expect(resolveInterBlockDelay({ kind: 'narration', text: '好。' }, 40)).toBe(
      READING_TIMING.interBlockText,
    )
  })

  it('超长正文的自动播放时长有上限', () => {
    const plan = buildBlockRevealPlan({ kind: 'narration', text: '很长的一段话。'.repeat(120) })

    expect(totalDelay(plan.steps)).toBeLessThanOrEqual(READING_TIMING.maxCharsBlockMs + 500)
    expect(plan.steps.at(-1)?.upTo).toBe(plan.total)
  })
})

describe('buildBlockRevealPlan: 结构化块', () => {
  it('system 按 line 逐条', () => {
    const plan = buildBlockRevealPlan({
      kind: 'system',
      variant: 'status',
      title: '权限变更',
      lines: [
        { label: '人格辅助', value: '全面启用' },
        { label: '自动执行', value: '开启' },
      ],
    })

    expect(plan.mode).toBe('units')
    expect(plan.total).toBe(2)
    expect(plan.graphemes).toEqual([])
  })

  it('record 的 paragraphs 与 entries 都算语义单元', () => {
    const units = getRecordUnits({
      kind: 'record',
      recordType: 'mirror',
      paragraphs: ['第一段', '第二段'],
      entries: [{ label: '标签', value: ['甲', '乙'] }],
    })

    expect(units.total).toBe(3)
    expect(units.paragraphs.map((item) => item.unit)).toEqual([0, 1])
    expect(units.entries[0]).toEqual({ label: '标签', value: '甲，乙', unit: 2 })
  })

  it('message 只有 paragraphs 是单元，sender 与状态属于元信息', () => {
    const units = getMessageUnits({
      kind: 'message',
      sender: '同事',
      timestamp: '23:41',
      status: 'read',
      paragraphs: ['第一句', '第二句'],
    })

    expect(units.total).toBe(2)
  })

  it('document 的 section heading 各占一个单元，内容按 line 排在其后', () => {
    const units = getDocumentUnits({
      kind: 'document',
      documentType: 'file',
      sections: [
        { heading: '一、范围', lines: ['第一条', '第二条'] },
        { lines: ['无标题正文'] },
        { heading: '只有标题', lines: [] },
      ],
    })

    expect(units.total).toBe(5)
    expect(units.sections[0].headingUnit).toBe(0)
    expect(units.sections[0].lines.map((line) => line.unit)).toEqual([1, 2])
    expect(units.sections[1].headingUnit).toBeUndefined()
    expect(units.sections[1].lines.map((line) => line.unit)).toEqual([3])
    expect(units.sections[2].headingUnit).toBe(4)
  })

  it('结构化块的自动播放时长同样有上限', () => {
    const plan = buildBlockRevealPlan({
      kind: 'system',
      variant: 'result',
      lines: new Array(40).fill(null).map((_, index) => ({ label: `L${index}`, value: '值' })),
    })

    expect(totalDelay(plan.steps)).toBeLessThanOrEqual(READING_TIMING.maxUnitsBlockMs + 200)
    expect(plan.steps.at(-1)?.upTo).toBe(40)
  })
})

describe('buildBlockRevealPlan: 立即显示与空内容', () => {
  it('divider 整体立即显示，且不算空块', () => {
    const plan = buildBlockRevealPlan({ kind: 'divider', label: '第二天早晨' })

    expect(plan.mode).toBe('instant')
    expect(plan.empty).toBe(false)
  })

  it('没有 label 的 divider 仍然是内容', () => {
    expect(isBlockEmpty({ kind: 'divider' })).toBe(false)
  })

  it('pacing: instant 的块整体立即显示', () => {
    const plan = buildBlockRevealPlan({
      kind: 'narration',
      text: '一句立即出现的话。',
      pacing: 'instant',
    })

    expect(plan.mode).toBe('instant')
    expect(plan.empty).toBe(false)
  })

  const emptyCases: Array<[string, StoryBlock]> = [
    ['空字符串', { kind: 'narration', text: '' }],
    ['只有空格', { kind: 'narration', text: '   ' }],
    ['只有换行', { kind: 'quote', text: '\n\n' }],
    ['空对白', { kind: 'dialogue', speaker: 'agent', text: '' }],
    ['空 lines', { kind: 'system', variant: 'status', title: '标题', lines: [] }],
    [
      '全是空白的 lines',
      { kind: 'system', variant: 'status', lines: [{ label: '  ', value: '  ' }] },
    ],
    ['空 paragraphs', { kind: 'record', recordType: 'audit', paragraphs: ['', '  '] }],
    ['没有内容的 record', { kind: 'record', recordType: 'audit', title: '只有标题' }],
    ['空 message', { kind: 'message', sender: '某人', paragraphs: [] }],
    ['空 sections', { kind: 'document', documentType: 'file', sections: [] }],
    [
      '只有空 section',
      { kind: 'document', documentType: 'file', sections: [{ heading: '   ', lines: ['  '] }] },
    ],
  ]

  for (const [name, block] of emptyCases) {
    it(`${name} 判为空块`, () => {
      expect(isBlockEmpty(block)).toBe(true)
      expect(buildBlockRevealPlan(block).empty).toBe(true)
    })
  }

  it('单字与单个标点是正常内容', () => {
    expect(isBlockEmpty({ kind: 'narration', text: '好' })).toBe(false)
    expect(buildBlockRevealPlan({ kind: 'narration', text: '。' }).total).toBe(1)
  })
})

describe('buildSequencePlan', () => {
  it('条件过滤后没有块时整段为空', () => {
    expect(buildSequencePlan([])).toEqual({ blocks: [], empty: true })
  })

  it('全是空块时整段为空', () => {
    const plan = buildSequencePlan([
      { kind: 'narration', text: '' },
      { kind: 'system', variant: 'status', lines: [] },
    ])

    expect(plan.empty).toBe(true)
  })

  it('每个块都带上自己的段间停顿，空块不参与调度所以为 0', () => {
    const plan = buildSequencePlan([
      { kind: 'narration', text: '一段足够长的普通正文，用来触发普通停顿。' },
      { kind: 'narration', text: '' },
    ])

    expect(plan.blocks[0].interBlockDelay).toBe(READING_TIMING.interBlockText)
    expect(plan.blocks[1].interBlockDelay).toBe(0)
  })

  it('计划与传入块一一对应', () => {
    const blocks: StoryBlock[] = [
      { kind: 'narration', text: '一' },
      { kind: 'divider' },
      { kind: 'quote', text: '二' },
    ]

    expect(buildSequencePlan(blocks).blocks).toHaveLength(3)
    expect(buildSequencePlan(blocks).empty).toBe(false)
  })

  it('system 的空白 line 不产生单元', () => {
    const units = getSystemUnits({
      kind: 'system',
      variant: 'status',
      lines: [
        { label: '有效', value: '是' },
        { label: '  ', value: '   ' },
      ],
    })

    expect(units.total).toBe(1)
  })
})
