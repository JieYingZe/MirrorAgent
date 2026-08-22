import type { StoryBlock } from '../../types/story'
import {
  getDocumentUnits,
  getMessageUnits,
  getRecordUnits,
  getSystemUnits,
  hasText,
} from './readingUnits'

/**
 * 文本块 → 纯文本。
 *
 * 只服务于「复制我的镜像报告」：玩家粘贴出去的应该是可读的段落，
 * 不是 JSON，也不是带标记的富文本。

 * 单元划分复用 readingUnits 的那几个函数 —— 打字机、渲染组件和这里
 * 读的是同一份「什么算内容」，所以界面上看得见的每一条都会被复制到，
 * 空字符串、空数组这类空内容三处一致地跳过。
 */

/** 一个块拍平成若干行；空块返回空数组。 */
function blockToLines(block: StoryBlock): string[] {
  switch (block.kind) {
    case 'narration':
    case 'quote':
      return hasText(block.text) ? block.text.split('\n').filter(hasText) : []

    case 'dialogue': {
      if (!hasText(block.text)) return []

      const lines = block.text.split('\n').filter(hasText)
      const speaker = block.speakerLabel

      // 说话者标签跟在第一行前面，与界面上「标签在上、正文在下」表达同一件事。
      return hasText(speaker) ? [`${speaker}：${lines[0]}`, ...lines.slice(1)] : lines
    }

    case 'system': {
      const units = getSystemUnits(block)
      const lines = units.lines.map((line) =>
        hasText(line.label) ? `${line.label}：${line.value}` : line.value,
      )

      return hasText(block.title) ? [block.title, ...lines] : lines
    }

    case 'record': {
      const units = getRecordUnits(block)
      const lines = [
        ...units.paragraphs.map((item) => item.text),
        ...units.entries.map((item) => `${item.label}：${item.value}`),
      ]

      return hasText(block.title) ? [block.title, ...lines] : lines
    }

    case 'message': {
      const units = getMessageUnits(block)
      const lines = units.paragraphs.map((item) => item.text)

      return hasText(block.sender) ? [`${block.sender}：`, ...lines] : lines
    }

    case 'document': {
      const units = getDocumentUnits(block)
      const lines = units.sections.flatMap((section) => [
        ...(hasText(section.heading) ? [section.heading] : []),
        ...section.lines.map((line) => line.text),
      ])

      return hasText(block.title) ? [block.title, ...lines] : lines
    }

    case 'divider':
      // 分隔线是视觉元素，纯文本里只保留它带的标签（大多数没有）。
      return hasText(block.label) ? [block.label] : []
  }
}

/** 多个块拍平成纯文本：块之间空一行，块内部按行换行。 */
export function blocksToPlainText(blocks: readonly StoryBlock[]): string {
  return blocks
    .map(blockToLines)
    .filter((lines) => lines.length > 0)
    .map((lines) => lines.join('\n'))
    .join('\n\n')
}
