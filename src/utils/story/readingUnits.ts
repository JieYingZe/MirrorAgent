import type {
  DocumentBlock,
  MessageBlock,
  RecordBlock,
  StoryBlock,
  SystemBlock,
} from '../../types/story'

/**
 * 面板类文本块的「语义单元」。
 *
 * 打字机对 system / record / message / document 不逐字显示，而是按数据结构里的
 * line、paragraph、entry、section line 整条显示。单元划分只能来自数据结构本身，
 * 不能依赖浏览器的视觉换行。
 *
 * 这里同时是「空内容」的唯一判定处：空字符串、只有空格、空数组、
 * 空 sections 都不产生单元，也就不会消耗玩家的一次点击。
 *
 * 渲染组件和揭示计划共用这些函数，保证「计划里有几个单元」与
 * 「界面上画了几个单元」永远一致。
 */

export type SystemUnits = {
  lines: Array<{ label?: string; value: string; unit: number }>
  total: number
}

export type RecordUnits = {
  paragraphs: Array<{ text: string; unit: number }>
  entries: Array<{ label: string; value: string; unit: number }>
  total: number
}

export type MessageUnits = {
  paragraphs: Array<{ text: string; unit: number }>
  total: number
}

export type DocumentSectionUnits = {
  heading?: string
  /** 有 heading 时它自己占一个单元，整条立即显示，不逐字。 */
  headingUnit?: number
  lines: Array<{ text: string; unit: number }>
}

export type DocumentUnits = {
  sections: DocumentSectionUnits[]
  total: number
}

/** 只有空白的文本视为没有内容。 */
export function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

/** entry 的值允许是数组，与既有渲染保持一致，用顿号连接。 */
export function formatEntryValue(value: string | string[]): string {
  return Array.isArray(value) ? value.filter(hasText).join('，') : value
}

export function getSystemUnits(block: SystemBlock): SystemUnits {
  const lines: SystemUnits['lines'] = []

  for (const line of block.lines ?? []) {
    if (!hasText(line.value) && !hasText(line.label)) continue

    lines.push({
      label: hasText(line.label) ? line.label : undefined,
      value: line.value ?? '',
      unit: lines.length,
    })
  }

  return { lines, total: lines.length }
}

export function getRecordUnits(block: RecordBlock): RecordUnits {
  const paragraphs: RecordUnits['paragraphs'] = []

  for (const paragraph of block.paragraphs ?? []) {
    if (!hasText(paragraph)) continue
    paragraphs.push({ text: paragraph, unit: paragraphs.length })
  }

  const entries: RecordUnits['entries'] = []

  for (const entry of block.entries ?? []) {
    const value = formatEntryValue(entry.value)

    if (!hasText(entry.label) && !hasText(value)) continue

    entries.push({
      label: entry.label,
      value,
      unit: paragraphs.length + entries.length,
    })
  }

  return { paragraphs, entries, total: paragraphs.length + entries.length }
}

export function getMessageUnits(block: MessageBlock): MessageUnits {
  const paragraphs: MessageUnits['paragraphs'] = []

  for (const paragraph of block.paragraphs ?? []) {
    if (!hasText(paragraph)) continue
    paragraphs.push({ text: paragraph, unit: paragraphs.length })
  }

  return { paragraphs, total: paragraphs.length }
}

export function getDocumentUnits(block: DocumentBlock): DocumentUnits {
  const sections: DocumentSectionUnits[] = []
  let total = 0

  for (const section of block.sections ?? []) {
    const heading = hasText(section.heading) ? section.heading : undefined
    const lines: DocumentSectionUnits['lines'] = []

    // 先占位 heading 的单元号，再顺序排 line。
    const headingUnit = heading === undefined ? undefined : total
    let cursor = heading === undefined ? total : total + 1

    for (const line of section.lines ?? []) {
      if (!hasText(line)) continue
      lines.push({ text: line, unit: cursor })
      cursor += 1
    }

    // 既没有标题也没有正文的 section 不产生任何单元。
    if (heading === undefined && lines.length === 0) continue

    sections.push({ heading, headingUnit, lines })
    total = cursor
  }

  return { sections, total }
}

/** 面板类块的语义单元总数；正文类块返回 0。 */
export function getBlockUnitTotal(block: StoryBlock): number {
  switch (block.kind) {
    case 'system':
      return getSystemUnits(block).total
    case 'record':
      return getRecordUnits(block).total
    case 'message':
      return getMessageUnits(block).total
    case 'document':
      return getDocumentUnits(block).total
    default:
      return 0
  }
}

/**
 * 没有任何可显示内容的块。
 *
 * 空块会被阅读状态机自动跳过，不占用一次点击。
 * divider 例外：它本身就是一条视觉分隔线，没有 label 也仍然是内容。
 */
export function isBlockEmpty(block: StoryBlock): boolean {
  switch (block.kind) {
    case 'narration':
    case 'quote':
    case 'dialogue':
      return !hasText(block.text)
    case 'divider':
      return false
    default:
      return getBlockUnitTotal(block) === 0
  }
}
