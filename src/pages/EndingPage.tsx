import { demoEnding } from '../data/demoFlow'

type EndingPageProps = {
  onRestart: () => void
}

export default function EndingPage({ onRestart }: EndingPageProps) {
  return (
    <main className="screen screen--ending fade-in">
      <div className="ending__inner">
        <p className="eyebrow">SESSION CLOSED</p>

        <h1 className="ending__title">{demoEnding.title}</h1>

        <div className="ending__description">
          {demoEnding.description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <section className="panel report" aria-labelledby="report-title">
          <h2 id="report-title" className="report__title">
            {demoEnding.report.title}
          </h2>
          {demoEnding.report.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>

        <button type="button" className="button button--primary" onClick={onRestart}>
          {demoEnding.primaryAction}
        </button>
      </div>
    </main>
  )
}
