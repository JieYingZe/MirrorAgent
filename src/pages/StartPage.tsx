import { startContent } from '../data/uiContent'

type StartPageProps = {
  /** 存在有效的未完成存档：显示“继续实验”和“重新初始化”，不再显示“开始初始化”。 */
  canContinue: boolean
  /** 「开始初始化」与「重新初始化」是同一个处理流程。 */
  onStart: () => void
  onContinue: () => void
}

export default function StartPage({ canContinue, onStart, onContinue }: StartPageProps) {
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

        <div className="start__actions">
          {canContinue ? (
            <>
              <button type="button" className="button button--primary" onClick={onContinue}>
                {startContent.continueAction}
              </button>

              <button type="button" className="button button--ghost" onClick={onStart}>
                {startContent.restartAction}
              </button>
            </>
          ) : (
            <button type="button" className="button button--primary" onClick={onStart}>
              {startContent.primaryAction}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
