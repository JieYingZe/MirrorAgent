import type { Stats } from '../../types/game'
import { deriveAiStatusMeters } from '../../utils/aiStatus'
import { endingContent } from '../../data/uiContent'
import { STATUS_ICONS } from './statusIcons'

type EndingStatSummaryProps = {
  stats: Stats
}

/**
 * 结局页底部的状态摘要（对齐 design/ui-mockups/ui-ending-desktop.webp）。
 *
 * 一项一格：图标、中文标签与英文副标、一排档位点、状态文案。
 * 与剧情页的 AI 状态面板读同一份映射、用同一套图标，
 * 玩家在通关那一刻看到的四个词，和他一路上看到的是同一批词。
 *
 * 档位点是这个页面独有的一层：结局页允许把结果说得更明确一些
 * （docs/04 §5.3），但它画的是**第几档**，不是变量值 —— 变量没有上下限，
 * 也就没有可以归一化的量程。点本身 aria-hidden：右边那四个字
 * 已经把同一件事说完整了，屏幕阅读器不需要再听一遍「第四个点亮着」。
 */
export function EndingStatSummary({ stats }: EndingStatSummaryProps) {
  const meters = deriveAiStatusMeters(stats)

  return (
    <section className="panel stat-summary" aria-labelledby="stat-summary-title">
      <h2 id="stat-summary-title" className="stat-summary__title">
        {endingContent.statSummaryTitle}
      </h2>

      <dl className="stat-summary__list">
        {meters.map((item) => {
          const Icon = STATUS_ICONS[item.key]

          return (
            <div key={item.key} className="stat-summary__item">
              <dt className="stat-summary__term">
                <span className="stat-summary__icon" aria-hidden="true">
                  <Icon size={15} strokeWidth={1.6} />
                </span>
                <span className="stat-summary__label">
                  <span className="stat-summary__label-zh">{item.label}</span>
                  <span className="stat-summary__label-en">{item.labelEn}</span>
                </span>
              </dt>

              <dd className="stat-summary__value">
                <span className="stat-summary__dots" aria-hidden="true">
                  {Array.from({ length: item.levels }, (_, index) => (
                    <span
                      key={index}
                      className="stat-summary__dot"
                      data-on={index < item.level}
                    />
                  ))}
                </span>
                <span className="stat-summary__text">{item.value}</span>
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
