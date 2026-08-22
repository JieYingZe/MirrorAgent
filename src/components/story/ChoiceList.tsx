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
 *
 * 排版（V03）：选项不再竖着堆叠，改成网格。列数由 `data-count` 决定，
 * 具体的列数与等高规则全部在 CSS 里（.game__choices），这里只如实报出数量 ——
 * 组件不算宽度、不判断断点，因此换布局不需要改这个文件。
 * 正式剧情的选项一律是四条，桌面端排成 2×2；文案放不下时按钮内部折行，
 * 网格保证同一批按钮尺寸完全一致。
 */
export function ChoiceList({ choices, disabled, onSelect }: ChoiceListProps) {
  return (
    <ul className="game__choices" data-count={choices.length}>
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
            <span className="button__index">{index + 1}</span>
            {/* 文案与语气标签上下叠放：横排的按钮没有多余的横向空间放第二列。 */}
            <span className="button__body">
              <span className="button__text">{choice.text}</span>
              {choice.label && <span className="button__label">{choice.label}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
