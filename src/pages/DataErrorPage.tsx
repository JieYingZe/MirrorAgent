import { dataErrorContent } from '../data/uiContent'

type DataErrorPageProps = {
  message: string
  onRestart: () => void
}

/** 剧情数据异常时的可恢复兜底页，不做错误边界，只让玩家能回到开始页。 */
export default function DataErrorPage({ message, onRestart }: DataErrorPageProps) {
  return (
    <main className="screen screen--error fade-in">
      <div className="error__inner">
        <p className="eyebrow">{dataErrorContent.eyebrow}</p>

        <h1 className="ending__title">{dataErrorContent.title}</h1>

        <p className="panel error__message" role="alert">
          {message}
        </p>

        <p className="error__hint">{dataErrorContent.hint}</p>

        <button type="button" className="button button--primary" onClick={onRestart}>
          {dataErrorContent.primaryAction}
        </button>
      </div>
    </main>
  )
}
