import type { DocumentBlock, MessageBlock, RecordBlock, SystemBlock } from '../../types/story'
import { emphasisClass } from './TextBlocks'

/**
 * 面板类文本块：系统状态、记录、聊天消息、文件。
 *
 * 和正文块一样，只根据块自身字段渲染，不认识任何节点 ID。
 */

export function SystemBlockView({ block }: { block: SystemBlock }) {
  return (
    <div
      className={`block block--system block--system-${block.variant}${emphasisClass(block)}`}
      role={block.variant === 'warning' ? 'alert' : undefined}
    >
      {block.title && <p className="block__label">{block.title}</p>}
      <dl className="block__lines">
        {block.lines.map((line, index) => (
          <div key={`${line.label ?? 'line'}-${index}`} className="block__line">
            {line.label && <dt>{line.label}</dt>}
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function RecordBlockView({ block }: { block: RecordBlock }) {
  return (
    <div className={`block block--record block--record-${block.recordType}${emphasisClass(block)}`}>
      {block.title && <p className="block__label">{block.title}</p>}

      {block.paragraphs?.map((paragraph, index) => (
        <p key={`p-${index}`} className="block__text">
          {paragraph}
        </p>
      ))}

      {block.entries && block.entries.length > 0 && (
        <dl className="block__lines">
          {block.entries.map((entry, index) => (
            <div key={`${entry.label}-${index}`} className="block__line">
              <dt>{entry.label}</dt>
              <dd>{Array.isArray(entry.value) ? entry.value.join('，') : entry.value}</dd>
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

export function MessageBlockView({ block }: { block: MessageBlock }) {
  return (
    <div
      className={`block block--message block--message-${block.side ?? 'neutral'}${emphasisClass(block)}`}
    >
      <p className="block__label">
        <span>{block.sender}</span>
        {block.timestamp && <span className="block__timestamp">{block.timestamp}</span>}
      </p>

      {block.paragraphs.map((paragraph, index) => (
        <p key={`p-${index}`} className="block__text">
          {paragraph}
        </p>
      ))}

      {block.status && (
        <p className="block__status">{MESSAGE_STATUS_LABELS[block.status]}</p>
      )}
    </div>
  )
}

export function DocumentBlockView({ block }: { block: DocumentBlock }) {
  return (
    <div
      className={`block block--document block--document-${block.documentType}${emphasisClass(block)}`}
    >
      {block.title && <p className="block__label">{block.title}</p>}

      {block.sections.map((section, index) => (
        <section key={`section-${index}`} className="block__section">
          {section.heading && <h3 className="block__heading">{section.heading}</h3>}
          {section.lines.map((line, lineIndex) => (
            <p key={`line-${lineIndex}`} className="block__text">
              {line}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}
