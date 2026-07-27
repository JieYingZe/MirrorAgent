import { startContent } from '../data/demoFlow'

type StartPageProps = {
  onStart: () => void
}

export default function StartPage({ onStart }: StartPageProps) {
  return (
    <main className="screen screen--start fade-in">
      <div className="start__inner">
        <p className="eyebrow">EXPERIMENT / 001</p>

        <h1 className="start__title">
          <span className="start__title-en">{startContent.titleEn}</span>
          <span className="start__title-zh">{startContent.titleZh}</span>
        </h1>

        <p className="start__subtitle">{startContent.subtitle}</p>

        <div className="start__description">
          {startContent.description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <button type="button" className="button button--primary" onClick={onStart}>
          {startContent.primaryAction}
        </button>
      </div>
    </main>
  )
}
