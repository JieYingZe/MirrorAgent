import type {
  DialogueBlock,
  DividerBlock,
  NarrationBlock,
  QuoteBlock,
  StoryBlock,
} from '../../types/story'

/**
 * 正文类文本块：旁白、对话、引语、分隔。
 *
 * 这些组件只根据块自身的字段渲染，不认识任何节点 ID，也不读取游戏状态。
 */

/** 把 emphasis 转成语义类名，具体样式留给 global.css。 */
export function emphasisClass(block: StoryBlock): string {
  return block.emphasis && block.emphasis !== 'normal' ? ` block--${block.emphasis}` : ''
}

export function NarrationBlockView({ block }: { block: NarrationBlock }) {
  return <p className={`block block--narration${emphasisClass(block)}`}>{block.text}</p>
}

const SPEAKER_LABELS: Record<DialogueBlock['speaker'], string> = {
  agent: 'MIRROR AGENT',
  player: '你',
  other: '对方',
}

export function DialogueBlockView({ block }: { block: DialogueBlock }) {
  const label = block.speakerLabel ?? SPEAKER_LABELS[block.speaker]

  return (
    <div
      className={`block block--dialogue block--dialogue-${block.speaker}${emphasisClass(block)}`}
      data-delivery={block.delivery ?? 'calm'}
    >
      <span className="block__speaker">{label}</span>
      <p className="block__text">{block.text}</p>
    </div>
  )
}

export function QuoteBlockView({ block }: { block: QuoteBlock }) {
  return <p className={`block block--quote${emphasisClass(block)}`}>{block.text}</p>
}

export function DividerBlockView({ block }: { block: DividerBlock }) {
  return (
    <div className={`block block--divider${emphasisClass(block)}`} role="separator">
      {block.label && <span className="block__divider-label">{block.label}</span>}
    </div>
  )
}
