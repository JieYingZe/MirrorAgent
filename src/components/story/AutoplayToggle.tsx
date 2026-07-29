import type { MouseEvent } from 'react'
import { gameContent } from '../../data/uiContent'

type AutoplayToggleProps = {
  enabled: boolean
  onChange: (next: boolean) => void
}

/**
 * 自动播放开关。
 *
 * 原生 button + `aria-pressed`，键盘可用，保留 focus-visible。
 * 放在章节头部这一行：不在剧情滚动容器里，不会随正文滚走，也不会挡住滚动条或选项。
 *
 * `data-no-story-advance` 与 stopPropagation 双保险：
 * 点开关只切换偏好，绝不同时触发阅读推进。
 */
export function AutoplayToggle({ enabled, onChange }: AutoplayToggleProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onChange(!enabled)
  }

  return (
    <button
      type="button"
      className="autoplay-toggle"
      aria-pressed={enabled}
      aria-label={enabled ? gameContent.autoplayAriaOn : gameContent.autoplayAriaOff}
      data-no-story-advance="true"
      onClick={handleClick}
    >
      <span className="autoplay-toggle__label">{gameContent.autoplayLabel}</span>
      <span className="autoplay-toggle__state">
        {enabled ? gameContent.autoplayStateOn : gameContent.autoplayStateOff}
      </span>
    </button>
  )
}
