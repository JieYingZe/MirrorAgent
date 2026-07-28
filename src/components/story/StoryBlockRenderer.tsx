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

/**
 * 文本块渲染分发。
 *
 * 只根据 block.kind 选择组件，不写任何与具体节点或章节相关的剧情逻辑。
 * 条件过滤在渲染之前完成（见 utils/story/getVisibleBlocks.ts），这里拿到的都是应当显示的块。
 * 本阶段直接展示完整文本，打字机效果属于 I01。
 */
export function StoryBlockRenderer({ block }: { block: StoryBlock }) {
  switch (block.kind) {
    case 'narration':
      return <NarrationBlockView block={block} />
    case 'dialogue':
      return <DialogueBlockView block={block} />
    case 'system':
      return <SystemBlockView block={block} />
    case 'record':
      return <RecordBlockView block={block} />
    case 'message':
      return <MessageBlockView block={block} />
    case 'document':
      return <DocumentBlockView block={block} />
    case 'quote':
      return <QuoteBlockView block={block} />
    case 'divider':
      return <DividerBlockView block={block} />
  }
}

type StoryBlockListProps = {
  blocks: readonly StoryBlock[]
  /** 用于生成稳定 key 的前缀，通常是节点 ID 或选择 ID。 */
  idPrefix: string
  className?: string
}

export function StoryBlockList({ blocks, idPrefix, className }: StoryBlockListProps) {
  if (blocks.length === 0) return null

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <StoryBlockRenderer key={block.id ?? `${idPrefix}-${index}`} block={block} />
      ))}
    </div>
  )
}
