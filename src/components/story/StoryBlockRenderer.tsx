import type { StoryBlock } from '../../types/story'
import {
  DialogueBlockView,
  DividerBlockView,
  NarrationBlockView,
  QuoteBlockView,
} from './TextBlocks'
import {
  DocumentBlockView,
  MessageBlockView,
  RecordBlockView,
  SystemBlockView,
} from './PanelBlocks'
import type { BlockRevealState, SequenceRevealState } from './blockReveal'

/**
 * 文本块渲染分发。
 *
 * 只根据 block.kind 选择组件，不写任何与具体节点或章节相关的剧情逻辑。
 * 条件过滤在渲染之前完成（见 utils/story/getVisibleBlocks.ts），这里拿到的都是应当显示的块。
 * 打字机（I01）只通过 reveal 影响「画多少」，不传 reveal 时行为与之前完全一致。
 */
export function StoryBlockRenderer({
  block,
  reveal,
}: {
  block: StoryBlock
  reveal?: BlockRevealState
}) {
  switch (block.kind) {
    case 'narration':
      return <NarrationBlockView block={block} reveal={reveal} />
    case 'dialogue':
      return <DialogueBlockView block={block} reveal={reveal} />
    case 'system':
      return <SystemBlockView block={block} reveal={reveal} />
    case 'record':
      return <RecordBlockView block={block} reveal={reveal} />
    case 'message':
      return <MessageBlockView block={block} reveal={reveal} />
    case 'document':
      return <DocumentBlockView block={block} reveal={reveal} />
    case 'quote':
      return <QuoteBlockView block={block} reveal={reveal} />
    case 'divider':
      return <DividerBlockView block={block} reveal={reveal} />
  }
}

type StoryBlockListProps = {
  blocks: readonly StoryBlock[]
  /** 用于生成稳定 key 的前缀，通常是节点 ID 或选择 ID。 */
  idPrefix: string
  className?: string
  /**
   * 阅读进度。不传表示一次性完整显示（结局页等场景）。
   *
   * 传入时按三段划分：已完成的块完整显示、当前块按进度显示、
   * 还没开始的块完全不渲染。
   */
  reveal?: SequenceRevealState
}

export function StoryBlockList({ blocks, idPrefix, className, reveal }: StoryBlockListProps) {
  if (blocks.length === 0) return null

  // 只有正在逐步揭示的那一段才是「当前阅读段」，内部自动滚动据此找当前块。
  const reading = reveal !== undefined && !reveal.sequenceComplete

  return (
    <div className={className} data-reading={reading ? 'active' : undefined}>
      {blocks.map((block, index) => {
        const key = block.id ?? `${idPrefix}-${index}`

        if (!reveal || reveal.sequenceComplete || index < reveal.blockIndex) {
          return <StoryBlockRenderer key={key} block={block} />
        }

        if (index > reveal.blockIndex) return null

        const blockPlan = reveal.plan.blocks[index]

        if (!blockPlan) return <StoryBlockRenderer key={key} block={block} />

        return (
          <StoryBlockRenderer
            key={key}
            block={block}
            reveal={{
              plan: blockPlan,
              revealed: reveal.revealed,
              complete: reveal.blockComplete,
            }}
          />
        )
      })}
    </div>
  )
}
