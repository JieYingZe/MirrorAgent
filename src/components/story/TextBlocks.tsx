import type {
  DialogueBlock,
  DividerBlock,
  NarrationBlock,
  QuoteBlock,
  StoryBlock,
} from '../../types/story'
import type { BlockRevealState } from './blockReveal'

/**
 * 正文类文本块：旁白、对话、引语、分隔。
 *
 * 这些组件只根据块自身的字段渲染，不认识任何节点 ID，也不读取游戏状态。
 * 传入 reveal 时按 grapheme 逐字显示，不传时一次显示完整文本。
 */

/** 把 emphasis 转成语义类名，具体样式留给 global.css。 */
export function emphasisClass(block: StoryBlock): string {
  return block.emphasis && block.emphasis !== 'normal' ? ` block--${block.emphasis}` : ''
}

/**
 * 逐字显示中的文本。
 *
 * 三层结构，各管一件事：
 * - `.sr-only` 承载完整语义文本，屏幕阅读器读到的始终是完整句子，不是一个个字；
 * - 已显示部分正常渲染；
 * - 未显示部分保留在文档流里但不可见，因此换行位置从一开始就固定，不会抖动。
 *
 * 后两层都是 aria-hidden，未显示部分本身 `visibility: hidden`，
 * 不会被重复读出，也不响应鼠标。块显示完成后回到单层普通渲染。
 */
export function RevealedText({
  text,
  reveal,
}: {
  text: string
  reveal?: BlockRevealState
}) {
  if (!reveal || reveal.complete || reveal.plan.mode !== 'chars') {
    return <>{text}</>
  }

  const { graphemes } = reveal.plan
  const cut = Math.min(Math.max(reveal.revealed, 0), graphemes.length)

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{graphemes.slice(0, cut).join('')}</span>
      <span aria-hidden="true" data-pending="true">
        {graphemes.slice(cut).join('')}
      </span>
    </>
  )
}

type RevealProps = { reveal?: BlockRevealState }

export function NarrationBlockView({
  block,
  reveal,
}: { block: NarrationBlock } & RevealProps) {
  return (
    <p className={`block block--narration${emphasisClass(block)}`}>
      <RevealedText text={block.text} reveal={reveal} />
    </p>
  )
}

const SPEAKER_LABELS: Record<DialogueBlock['speaker'], string> = {
  agent: 'MIRROR AGENT',
  player: '你',
  other: '对方',
}

export function DialogueBlockView({ block, reveal }: { block: DialogueBlock } & RevealProps) {
  const label = block.speakerLabel ?? SPEAKER_LABELS[block.speaker]

  return (
    <div
      className={`block block--dialogue block--dialogue-${block.speaker}${emphasisClass(block)}`}
      data-delivery={block.delivery ?? 'calm'}
    >
      {/* 说话者等元信息立即显示，只有正文逐字。 */}
      <span className="block__speaker">{label}</span>
      <p className="block__text">
        <RevealedText text={block.text} reveal={reveal} />
      </p>
    </div>
  )
}

export function QuoteBlockView({ block, reveal }: { block: QuoteBlock } & RevealProps) {
  return (
    <p className={`block block--quote${emphasisClass(block)}`}>
      <RevealedText text={block.text} reveal={reveal} />
    </p>
  )
}

/** 分隔线整体立即显示，只做一次很轻的淡入。 */
export function DividerBlockView({ block, reveal }: { block: DividerBlock } & RevealProps) {
  return (
    <div
      className={`block block--divider${emphasisClass(block)}${reveal ? ' reading-reveal' : ''}`}
      role="separator"
    >
      {block.label && <span className="block__divider-label">{block.label}</span>}
    </div>
  )
}
