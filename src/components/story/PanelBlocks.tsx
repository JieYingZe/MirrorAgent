import type { DocumentBlock, MessageBlock, RecordBlock, SystemBlock } from '../../types/story'
import {
  getDocumentUnits,
  getMessageUnits,
  getRecordUnits,
  getSystemUnits,
} from '../../utils/story'
import { emphasisClass } from './TextBlocks'
import type { BlockRevealState } from './blockReveal'
import { pendingAttr, revealedUnitCount } from './blockReveal'

/**
 * 面板类文本块：系统状态、记录、聊天消息、文件。
 *
 * 和正文块一样，只根据块自身字段渲染，不认识任何节点 ID。
 *
 * 这些块不逐字显示：标题、说话人、时间戳、状态等元信息立即显示，
 * 内容按数据结构里的 line / paragraph / entry / section line 整条显示。
 * 单元划分统一来自 utils/story/readingUnits.ts，与揭示计划用的是同一套函数，
 * 因此「计划里有几个单元」和「界面上画了几个单元」不会漂移。
 */

type RevealProps = { reveal?: BlockRevealState }

export function SystemBlockView({ block, reveal }: { block: SystemBlock } & RevealProps) {
  const units = getSystemUnits(block)
  const revealed = revealedUnitCount(reveal, units.total)

  return (
    <div
      className={`block block--system block--system-${block.variant}${emphasisClass(block)}`}
      role={block.variant === 'warning' ? 'alert' : undefined}
    >
      {block.title && <p className="block__label">{block.title}</p>}
      <dl className="block__lines">
        {units.lines.map((line) => (
          <div
            key={`${line.label ?? 'line'}-${line.unit}`}
            className="block__line"
            data-pending={pendingAttr(line.unit, revealed)}
          >
            {line.label && <dt>{line.label}</dt>}
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function RecordBlockView({ block, reveal }: { block: RecordBlock } & RevealProps) {
  const units = getRecordUnits(block)
  const revealed = revealedUnitCount(reveal, units.total)

  return (
    <div className={`block block--record block--record-${block.recordType}${emphasisClass(block)}`}>
      {block.title && <p className="block__label">{block.title}</p>}

      {units.paragraphs.map((paragraph) => (
        <p
          key={`p-${paragraph.unit}`}
          className="block__text"
          data-pending={pendingAttr(paragraph.unit, revealed)}
        >
          {paragraph.text}
        </p>
      ))}

      {units.entries.length > 0 && (
        <dl className="block__lines">
          {units.entries.map((entry) => (
            <div
              key={`${entry.label}-${entry.unit}`}
              className="block__line"
              data-pending={pendingAttr(entry.unit, revealed)}
            >
              <dt>{entry.label}</dt>
              <dd>{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/** 消息状态是语义枚举，界面上不直接显示英文原值。 */
const MESSAGE_STATUS_LABELS: Record<NonNullable<MessageBlock['status']>, string> = {
  draft: '草稿',
  sent: '已发送',
  delivered: '已送达',
  read: '已读',
  unsent: '未发送',
}

export function MessageBlockView({ block, reveal }: { block: MessageBlock } & RevealProps) {
  const units = getMessageUnits(block)
  const revealed = revealedUnitCount(reveal, units.total)

  return (
    <div
      className={`block block--message block--message-${block.side ?? 'neutral'}${emphasisClass(block)}`}
    >
      {/* 发信人、时间戳与发送状态属于元信息，立即显示。 */}
      <p className="block__label">
        <span>{block.sender}</span>
        {block.timestamp && <span className="block__timestamp">{block.timestamp}</span>}
      </p>

      {units.paragraphs.map((paragraph) => (
        <p
          key={`p-${paragraph.unit}`}
          className="block__text"
          data-pending={pendingAttr(paragraph.unit, revealed)}
        >
          {paragraph.text}
        </p>
      ))}

      {block.status && <p className="block__status">{MESSAGE_STATUS_LABELS[block.status]}</p>}
    </div>
  )
}

export function DocumentBlockView({ block, reveal }: { block: DocumentBlock } & RevealProps) {
  const units = getDocumentUnits(block)
  const revealed = revealedUnitCount(reveal, units.total)

  return (
    <div
      className={`block block--document block--document-${block.documentType}${emphasisClass(block)}`}
    >
      {block.title && <p className="block__label">{block.title}</p>}

      {units.sections.map((section, index) => (
        <section key={`section-${index}`} className="block__section">
          {section.heading !== undefined && (
            <h3
              className="block__heading"
              data-pending={pendingAttr(section.headingUnit ?? 0, revealed)}
            >
              {section.heading}
            </h3>
          )}
          {section.lines.map((line) => (
            <p
              key={`line-${line.unit}`}
              className="block__text"
              data-pending={pendingAttr(line.unit, revealed)}
            >
              {line.text}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}
