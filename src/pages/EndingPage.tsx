import { useEffect, useMemo, useRef } from 'react'
import { Copy, RotateCcw } from 'lucide-react'
import type { EndingDefinition, EndingVariant, StoryState } from '../types/story'
import type { EndingResolution } from '../utils/story'
import { endingRates } from '../data/story'
import {
  buildEndingReportText,
  buildEndingView,
  logEndingSummary,
  toEndingRatePercent,
} from '../utils/story'
import { StoryBlockList } from '../components/story/StoryBlockRenderer'
import { EndingStatSummary } from '../components/status/EndingStatSummary'
import { useClipboardCopy } from '../hooks/useClipboardCopy'
import { endingContent, endingReportLabels } from '../data/uiContent'

type EndingPageProps = {
  /** 结局家族：正文与共用报告。 */
  ending: EndingDefinition
  /** 命中的玩家可见结局。页面不参与判断，只渲染上层已经解析好的结果。 */
  variant: EndingVariant
  resolution: EndingResolution
  state: StoryState
  onRestart: () => void
}

/**
 * 结局页。
 *
 * 布局（V03，对齐 design/ui-mockups/ui-ending-desktop.webp）：
 * 一屏三块 —— 标题区在最上，中间左右并排是结局正文与 AI 镜像报告，
 * 下面一条矮的状态摘要，最后是两个操作按钮。
 *
 * 两块文本各自独立滚动：结局正文与镜像报告都可能很长，
 * 让它们在自己内部滚，整页就不会变成一条几屏高的长卷 ——
 * 状态摘要和按钮始终留在视野里，玩家不必翻到底才能重新开始。
 * 这与剧情页是同一套「固定舞台 + 内部滚动」的做法。
 */
export default function EndingPage({
  ending,
  variant,
  resolution,
  state,
  onRestart,
}: EndingPageProps) {
  const view = useMemo(() => buildEndingView(ending, variant, state), [ending, variant, state])

  // 只能显示“理论路径占比”，不是玩家达成率（docs/06 §15）。按玩家可见结局取值。
  const rate = endingRates.rates[variant.id]
  const ratePercent = toEndingRatePercent(rate)

  const { status: copyStatus, copy, reset: resetCopy } = useClipboardCopy()
  const fallbackRef = useRef<HTMLTextAreaElement | null>(null)

  /*
    可复制的报告全文（S01）。

    纯函数生成，内容全部来自页面上已经渲染的那些块与四个变量的状态映射；
    规则 ID、节点 ID 和变量裸数字不在里面（那些只进控制台）。
  */
  const reportText = useMemo(
    () => buildEndingReportText(view, state.stats, endingReportLabels),
    [view, state.stats],
  )

  /*
    开发验证输出（原来是页面上的「开发验证 / DEV SUMMARY」面板）。

    变量裸数字、规则 ID 和整条选择路径只进控制台，不再出现在结局页上 ——
    结局是一次安静的收尾，一块调试面板会把它直接拆穿。
    依赖只有结局与状态，因此同一个结局不会重复打印。
  */
  useEffect(() => {
    logEndingSummary(resolution, state, rate)
  }, [resolution, state, rate])

  // 换了结局就把上一次的复制提示收掉，旧结果不跨场景留着。
  useEffect(() => {
    resetCopy()
  }, [variant.id, resetCopy])

  /*
    降级路径（docs/03 §6.3）：写剪贴板失败时把全文放进一个只读文本框并选中，
    玩家一个 Ctrl+C 就能拿走。复制失败不影响重新初始化。
  */
  useEffect(() => {
    if (copyStatus !== 'failed') return

    const field = fallbackRef.current

    if (!field) return

    field.focus()
    field.select()
  }, [copyStatus])

  const copyFeedback =
    copyStatus === 'copied'
      ? endingContent.copiedFeedback
      : copyStatus === 'failed'
        ? endingContent.copyFailedFeedback
        : ''

  return (
    <main className="screen screen--ending fade-in">
      <div className="ending__stage">
        {/* 标题区居中，两块正文保持左对齐：仪式感来自留白与层级，不靠特效（V01）。 */}
        <header className="ending__header">
          <p className="eyebrow">{endingContent.eyebrow}</p>

          <h1 className="ending__title">{view.title}</h1>

          {/*
            副标题与理论占比（docs/06 §15）同一行。

            结局页是固定舞台，标题区每多一行，两块正文的可读高度就少一行，
            所以占比不单独占一行。排布交给 CSS 的三列网格：副标题仍然相对整个舞台
            居中，与标题、正文对在同一条中轴上；占比靠到最右，与两块正文面板的
            右缘齐平，像页眉右上角的一条系统读数。

            两者不会被看成同一句话 —— 中间隔着大片留白，
            占比又是一颗带描边的等宽胶囊，与副标题的正文字体明显不是一路。
          */}
          <div className="ending__meta">
            <p className="ending__description">{view.subtitle}</p>

            <p className="ending__rate" title={endingContent.rateHint}>
              <span className="ending__rate-label">{endingContent.rateLabel}</span>
              <span className="ending__rate-value">
                {endingContent.rateValuePrefix}
                {ratePercent}%
              </span>
            </p>
          </div>
        </header>

        <div className="ending__columns">
          <section className="panel ending__panel" aria-labelledby="ending-body-title">
            <h2 id="ending-body-title" className="ending__panel-title">
              {endingContent.bodyTitle}
            </h2>

            <div className="ending__scroll">
              <StoryBlockList
                blocks={view.bodyBlocks}
                idPrefix={`${variant.id}-body`}
                className="story-blocks"
              />

              <StoryBlockList
                blocks={view.finalLineBlocks}
                idPrefix={`${variant.id}-final`}
                className="story-blocks ending__final"
              />
            </div>
          </section>

          <section className="panel ending__panel" aria-labelledby="report-title">
            <h2 id="report-title" className="ending__panel-title">
              {ending.report.title ?? endingContent.reportTitle}
            </h2>

            <div className="ending__scroll">
              {/* 状态摘要按变体取：同一家族的不同结局在这里就应该看出差别。 */}
              {view.statusLines.length > 0 && (
                <dl className="block__lines report__lines">
                  {view.statusLines.map((line) => (
                    <div key={line.label} className="block__line">
                      <dt>{line.label}</dt>
                      <dd>{line.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <StoryBlockList
                blocks={view.reportBlocks}
                idPrefix={`${variant.id}-report`}
                className="story-blocks"
              />

              <StoryBlockList
                blocks={view.echoBlocks}
                idPrefix={`${variant.id}-echo`}
                className="story-blocks"
              />
            </div>
          </section>
        </div>

        <EndingStatSummary stats={state.stats} />

        <div className="ending__actions">
          <button
            type="button"
            className="button button--ghost ending__action"
            onClick={() => void copy(reportText)}
          >
            <Copy size={16} strokeWidth={1.6} aria-hidden="true" />
            <span>{endingContent.copyAction}</span>
          </button>

          <button
            type="button"
            className="button button--primary ending__action"
            onClick={onRestart}
          >
            <RotateCcw size={16} strokeWidth={1.6} aria-hidden="true" />
            <span>{endingContent.primaryAction}</span>
          </button>
        </div>

        <p className="ending__feedback" aria-live="polite" data-state={copyStatus}>
          {copyFeedback || endingContent.primaryHint}
        </p>

        {copyStatus === 'failed' && (
          <label className="ending__fallback">
            <span className="sr-only">{endingContent.copyFallbackLabel}</span>
            <textarea
              ref={fallbackRef}
              className="ending__fallback-field"
              readOnly
              rows={6}
              value={reportText}
            />
          </label>
        )}
      </div>
    </main>
  )
}
