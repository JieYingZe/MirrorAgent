import { demoChapter, demoStatus } from '../data/demoFlow'

type GamePageProps = {
  onChoose: () => void
}

export default function GamePage({ onChoose }: GamePageProps) {
  return (
    <main className="screen screen--game fade-in">
      <div className="game__layout">
        <section className="game__main" aria-labelledby="chapter-title">
          <header className="game__header">
            <p className="eyebrow">{demoChapter.stageLabel}</p>
            <span className="game__progress">{demoChapter.progress}</span>
          </header>

          <h1 id="chapter-title" className="game__title">
            {demoChapter.title}
          </h1>

          <div className="panel game__text">
            {demoChapter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className="game__choices">
            {demoChapter.choices.map((choice, index) => (
              <li key={choice.id}>
                <button type="button" className="button button--choice" onClick={onChoose}>
                  <span className="button__index">{String(index + 1).padStart(2, '0')}</span>
                  <span>{choice.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="panel status" aria-label="AI 状态面板">
          <h2 className="status__title">{demoStatus.title}</h2>
          <dl className="status__list">
            {demoStatus.items.map((item) => (
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
