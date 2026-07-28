import type { StoryChoice } from '../../types/story'

type ChoiceListProps = {
  choices: readonly StoryChoice[]
  disabled: boolean
  onSelect: (choice: StoryChoice) => void
}

/**
 * 选项列表。
 *
 * 只渲染传入的选项，条件过滤在上层完成；
 * 不展示选择类型，也不展示变量变化（保持沉浸感，见 docs/03-interaction-design.md §4.3）。
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
            onClick={() => onSelect(choice)}
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
