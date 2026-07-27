import type { ChoiceRecord, FinalChoice, Stats } from '../types/game'
import { STAT_KEYS } from '../data/initialGameState'
import { endingPlaceholder } from '../data/uiContent'

type EndingPageProps = {
  stats: Stats
  choices: ChoiceRecord[]
  finalChoice?: FinalChoice
  onRestart: () => void
}

export default function EndingPage({ stats, choices, finalChoice, onRestart }: EndingPageProps) {
  return (
    <main className="screen screen--ending fade-in">
      <div className="ending__inner">
        <p className="eyebrow">SESSION CLOSED</p>

        <h1 className="ending__title">{endingPlaceholder.title}</h1>

        <div className="ending__description">
          {endingPlaceholder.description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <section className="panel report" aria-labelledby="report-title">
          <h2 id="report-title" className="report__title">
            {endingPlaceholder.report.title}
          </h2>
          {endingPlaceholder.report.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>

        {/*
          开发验证区（G02）。
          这是整个项目中唯一允许出现变量裸数字的位置，只用于人工核对变量累计、
          选择记录和 finalChoice 是否正确。
          等 R01 的结局判断、C02 的正式结局文案和 I02 的状态描述系统实现后，
          这一整块会被正式的镜像报告替换掉，不要在这里投入视觉设计。
        */}
        <section className="panel dev-summary" aria-labelledby="dev-summary-title">
          <h2 id="dev-summary-title" className="dev-summary__title">
            开发验证 / DEV SUMMARY
          </h2>

          <p className="dev-summary__line">已记录选择：{choices.length}</p>

          <ol className="dev-summary__path">
            {choices.map((record) => (
              <li key={`${record.chapterId}:${record.choiceId}`}>
                <span className="dev-summary__mono">{record.chapterId}</span> → {record.choiceText}
              </li>
            ))}
          </ol>

          <p className="dev-summary__line">
            finalChoice：
            <span className="dev-summary__mono">{finalChoice ?? '未记录'}</span>
          </p>

          <dl className="dev-summary__stats">
            {STAT_KEYS.map((key) => (
              <div key={key} className="dev-summary__stat">
                <dt className="dev-summary__mono">{key}</dt>
                <dd>{stats[key]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <button type="button" className="button button--primary" onClick={onRestart}>
          {endingPlaceholder.primaryAction}
        </button>
      </div>
    </main>
  )
}
