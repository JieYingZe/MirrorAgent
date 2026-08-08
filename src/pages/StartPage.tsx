import { ArrowRight, RotateCcw } from 'lucide-react'
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

type StartActionProps = {
  label: string
  /** 次要动作（重新初始化）：同一族按钮，但不发光、图标换成回转。 */
  secondary?: boolean
  onClick: () => void
}

/**
 * 开始页的操作按钮。
 *
 * 主次两个变体共用同一套尺寸、圆角、字体与深色底，差别只有两处：
 * 次按钮不渲染外发光层（内发光与边框渐变由 `.start__cta--secondary` 关掉），
 * 图标由「往前走」的箭头换成「回到起点」的回转。
 * 三个按钮（开始初始化／继续实验／重新初始化）因此只有一份结构。
 */
function StartAction({ label, secondary = false, onClick }: StartActionProps) {
  const Icon = secondary ? RotateCcw : ArrowRight

  return (
    <button
      type="button"
      className={`button start__cta${secondary ? ' start__cta--secondary' : ''}`}
      onClick={onClick}
    >
      {/*
        外发光层。它需要一条横向 mask，box-shadow 做不到，只能单独占一层。
        次按钮静息态没有外发光，整层直接不渲染，不靠把强度调成 0。
      */}
      {!secondary && <span className="start__cta-glow" aria-hidden="true" />}
      {/* 文案单独包一层，才能压在按钮的内发光层之上。 */}
      <span className="start__cta-label">{label}</span>
      <Icon className="start__cta-icon" size={18} strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
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
              <StartAction label={startContent.continueAction} onClick={onContinue} />

              {/* 行为不变：仍然是「清除剧情存档并从序章重新开始」那一个入口。 */}
              <StartAction secondary label={startContent.restartAction} onClick={onStart} />
            </>
          ) : (
            <StartAction label={startContent.primaryAction} onClick={onStart} />
          )}
        </div>
      </div>
    </main>
  )
}
