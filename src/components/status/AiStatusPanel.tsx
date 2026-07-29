import type { Stats } from '../../types/game'
import type { NodeUiHints } from '../../types/story'
import { deriveAiStatusItems } from '../../utils/aiStatus'
import { statusPanelContent } from '../../data/uiContent'

type AiStatusPanelProps = {
  /** 当前变量值；显示选项专属回应时也应传入选择之后的最新值。 */
  stats: Stats
  /** 当前节点的 ui.mode，只用于克制的 warning 状态，不参与状态映射。 */
  mode?: NodeUiHints['mode']
}

/**
 * AI 状态面板。
 *
 * 纯展示：不更新变量、不查结局、不解析路由、不写存档，也不认识任何节点 ID。
 * 变量到状态文案的映射全部在 utils/aiStatus.ts，这里只把结果排版成系统日志的样子。
 */
export function AiStatusPanel({ stats, mode }: AiStatusPanelProps) {
  const items = deriveAiStatusItems(stats)
  const hint = mode === 'control' ? statusPanelContent.hints.control : statusPanelContent.hints.normal

  // 状态文案变化时列表重新挂载，播放一次很短的刷新动效；文案不变时不重放。
  const signature = items.map((item) => item.value).join('|')

  return (
    <aside
      className="panel status"
      data-mode={mode ?? 'normal'}
      aria-label={statusPanelContent.ariaLabel}
      // 面板整体不参与阅读推进：点状态面板不该快进正文（I01）。
      data-no-story-advance="true"
    >
      <h2 className="status__title">{statusPanelContent.title}</h2>

      <dl key={signature} className="status__list">
        {items.map((item) => (
          <div key={item.key} className="status__item">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <p className="status__hint">{hint}</p>
    </aside>
  )
}
