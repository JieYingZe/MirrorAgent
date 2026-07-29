import type { MouseEvent } from 'react'
import type { StoryChoice } from '../../types/story'

type ChoiceListProps = {
  choices: readonly StoryChoice[]
  disabled: boolean
  onSelect: (choice: StoryChoice, event: MouseEvent<HTMLButtonElement>) => void
}

/**
 * 选项列表。
 *
 * 只渲染传入的选项，条件过滤与「正文是否读完」的判断都在上层完成；
 * 不展示选择类型，也不展示变量变化（保持沉浸感，见 docs/03-interaction-design.md §4.3）。
 *
 * 点击事件在这里就停止冒泡，避免同一次点击既提交选择又推进阅读区域的文字。
 */
export function ChoiceList({ choices, disabled, onSelect }: ChoiceListProps) {
  return (
    <ul className="game__choices">
      {choices.map((choice, index) => (
        <li key={choice.id}>
          <button
            type="button"
            className={`button button--choice${
              choice.ui?.emphasis && choice.ui.emphasis !== 'normal'
                ? ` button--choice-${choice.ui.emphasis}`
                : ''
            }`}
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(choice, event)
            }}
          >
            <span className="button__index">{String(index + 1).padStart(2, '0')}</span>
            <span>{choice.text}</span>
            {choice.label && <span className="button__label">{choice.label}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}
