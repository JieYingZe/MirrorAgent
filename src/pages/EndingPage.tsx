import { useMemo } from 'react'
import type { EndingDefinition, StoryState } from '../types/story'
import type { EndingResolution } from '../utils/story'
import { STAT_KEYS } from '../data/initialGameState'
import { endingRates } from '../data/story'
import { buildEndingView } from '../utils/story'
import { StoryBlockList } from '../components/story/StoryBlockRenderer'
import { endingContent } from '../data/uiContent'

type EndingPageProps = {
  ending: EndingDefinition
  resolution: EndingResolution
  state: StoryState
  onRestart: () => void
}

export default function EndingPage({ ending, resolution, state, onRestart }: EndingPageProps) {
  const view = useMemo(() => buildEndingView(ending, state), [ending, state])

  // 只能显示“理论路径占比”，不是玩家达成率（docs/06 §15）。
  const rate = endingRates.rates[ending.id]

  return (
    <main className="screen screen--ending fade-in">
      <div className="ending__inner">
        <p className="eyebrow">SESSION CLOSED</p>

        <h1 className="ending__title">{ending.title}</h1>

        {ending.subtitle && <p className="ending__description">{ending.subtitle}</p>}

        <StoryBlockList
          blocks={view.bodyBlocks}
          idPrefix={`${ending.id}-body`}
          className="story-blocks"
        />

        <section className="panel report" aria-labelledby="report-title">
          <h2 id="report-title" className="report__title">
            {ending.report.title ?? endingContent.reportTitle}
          </h2>

          {ending.report.statusLines.length > 0 && (
            <dl className="block__lines">
              {ending.report.statusLines.map((line) => (
                <div key={line.label} className="block__line">
                  <dt>{line.label}</dt>
                  <dd>{line.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <StoryBlockList
            blocks={view.reportBlocks}
            idPrefix={`${ending.id}-report`}
            className="story-blocks"
          />

          <StoryBlockList
            blocks={view.echoBlocks}
            idPrefix={`${ending.id}-echo`}
            className="story-blocks"
          />
        </section>

        <StoryBlockList
          blocks={view.finalLineBlocks}
          idPrefix={`${ending.id}-final`}
          className="story-blocks"
        />

        {/*
          开发验证区（G02 / G03）。
          这是整个项目中唯一允许出现变量裸数字和规则 ID 的位置，只用于人工核对
          变量累计、标签、flags、finalChoice 和结局判断路径。
          等 C02 的正式结局文案和 I02 的状态描述系统实现后，这一整块会被移除，
          不要在这里投入视觉设计。
        */}
        <section className="panel dev-summary" aria-labelledby="dev-summary-title">
          <h2 id="dev-summary-title" className="dev-summary__title">
            开发验证 / DEV SUMMARY
          </h2>

          <p className="dev-summary__line">
            结局判断：
            <span className="dev-summary__mono">
              {resolution.endingId} / {resolution.ruleId}
              {resolution.usedFallback ? ' / 安全兜底' : ''}
            </span>
          </p>

          <p className="dev-summary__line">
            {endingContent.rateLabel}
            {(rate * 100).toFixed(1)}%
          </p>

          <p className="dev-summary__line">
            finalChoice：
            <span className="dev-summary__mono">{state.finalChoice ?? '未记录'}</span>
          </p>

          <p className="dev-summary__line">已记录选择：{state.choiceHistory.length}</p>

          <ol className="dev-summary__path">
            {state.choiceHistory.map((record) => (
              <li key={`${record.nodeId}:${record.choiceId}`}>
                <span className="dev-summary__mono">{record.nodeId}</span> →{' '}
                <span className="dev-summary__mono">{record.choiceId}</span>（{record.choiceType}）
              </li>
            ))}
          </ol>

          <dl className="dev-summary__stats">
            {STAT_KEYS.map((key) => (
              <div key={key} className="dev-summary__stat">
                <dt className="dev-summary__mono">{key}</dt>
                <dd>{state.stats[key]}</dd>
              </div>
            ))}
          </dl>

          <p className="dev-summary__line">
            tags：<span className="dev-summary__mono">{state.tags.join('、') || '无'}</span>
          </p>

          <p className="dev-summary__line">
            flags：
            <span className="dev-summary__mono">
              {Object.entries(state.flags)
                .map(([key, value]) => `${key}=${String(value)}`)
                .join('、') || '无'}
            </span>
          </p>

          <p className="dev-summary__line">
            访问节点：{state.visitedNodeIds.length} / schemaVersion {state.schemaVersion}
          </p>
        </section>

        <button type="button" className="button button--primary" onClick={onRestart}>
          {endingContent.primaryAction}
        </button>
      </div>
    </main>
  )
}
