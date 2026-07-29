import { startContent } from '../data/uiContent'

type StartPageProps = {
  /** 存在有效的未完成存档：显示“继续实验”和“重新初始化”，不再显示“开始初始化”。 */
  canContinue: boolean
  /**
   * 背景成稿是否没能显示出来。
   *
   * 开始页的可见标题、副标题和说明都画在 `bg-start` 成稿里，页面本身不再重复渲染一遍。
   * 成稿加载失败时必须把同一份文字变成可见兜底，否则页面上只剩两个孤立按钮。
   */
  backgroundUnavailable: boolean
  /** 「开始初始化」与「重新初始化」是同一个处理流程。 */
  onStart: () => void
  onContinue: () => void
}

/**
 * 开始页。
 *
 * 视觉主体是 `bg-start` 成稿本身：英文标题、中文标题、副标题、右侧终端、
 * 渐变与光效都在图里，页面只负责把操作按钮放到成稿预留的留白处，不重复画一遍标题。
 *
 * 文字并没有从 DOM 里消失，只是默认视觉隐藏（`.sr-only`）：
 * 屏幕阅读器仍然读得到完整的标题、副标题和说明，图片里的文字它读不到。
 * 成稿加载失败时同一段 DOM 变成可见兜底，不需要第二份文案。
 */
export default function StartPage({
  canContinue,
  backgroundUnavailable,
  onStart,
  onContinue,
}: StartPageProps) {
  return (
    <main
      className="screen screen--start fade-in"
      data-fallback={backgroundUnavailable ? 'true' : 'false'}
    >
      <div className="start__inner">
        <div className={`start__intro${backgroundUnavailable ? '' : ' sr-only'}`}>
          <p className="eyebrow">EXPERIMENT / 001</p>

          <h1 className="start__title">
            <span className="start__title-en">{startContent.titleEn}</span>
            <span className="start__title-zh">{startContent.titleZh}</span>
          </h1>

          <p className="start__subtitle">{startContent.subtitle}</p>

          <hr className="start__rule" />

          <div className="start__description">
            {startContent.description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
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
