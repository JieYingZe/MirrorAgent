import { useEffect, useRef, useState } from 'react'
import type { StoryChapter, StoryChoice } from '../types/game'
import { statusPanelPlaceholder } from '../data/uiContent'

type GamePageProps = {
  chapter: StoryChapter
  onChoose: (choice: StoryChoice) => void
}

export default function GamePage({ chapter, onChoose }: GamePageProps) {
  // 选择提交后短暂上锁，避免快速重复点击写入多条选择记录。
  // ref 负责拦截同一帧内的重复事件，state 只负责按钮的禁用样式。
  const lockedRef = useRef(false)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    lockedRef.current = false
    setLocked(false)
  }, [chapter.id])

  function handleSelect(choice: StoryChoice) {
    if (lockedRef.current) return
    lockedRef.current = true
    setLocked(true)
    onChoose(choice)
  }

  return (
    <main className="screen screen--game fade-in">
      <div className="game__layout">
        <section className="game__main" aria-labelledby="chapter-title">
          <header className="game__header">
            <p className="eyebrow">{chapter.phaseLabel}</p>
            <span className="game__progress">{chapter.progressLabel}</span>
          </header>

          <h1 id="chapter-title" className="game__title">
            {chapter.title}
          </h1>

          <div className="panel game__text">
            {chapter.paragraphs.map((paragraph, index) => (
              <p key={`${chapter.id}-p${index}`}>{paragraph}</p>
            ))}
          </div>

          <ul className="game__choices">
            {chapter.choices.map((choice, index) => (
              <li key={choice.id}>
                <button
                  type="button"
                  className="button button--choice"
                  disabled={locked}
                  onClick={() => handleSelect(choice)}
                >
                  <span className="button__index">{String(index + 1).padStart(2, '0')}</span>
                  <span>{choice.text}</span>
                  {choice.label && <span className="button__label">{choice.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="panel status" aria-label="AI 状态面板">
          <h2 className="status__title">{statusPanelPlaceholder.title}</h2>
          <dl className="status__list">
            {statusPanelPlaceholder.items.map((item) => (
              <div key={item.label} className="status__item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </main>
  )
}
