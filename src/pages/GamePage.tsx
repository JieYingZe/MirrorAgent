import { useEffect, useRef, useState } from 'react'
import type {
  StoryBlock,
  StoryChapterMeta,
  StoryChoice,
  StoryNode,
  StoryState,
} from '../types/story'
import { StoryBlockList } from '../components/story/StoryBlockRenderer'
import { ChoiceList } from '../components/story/ChoiceList'
import {
  getChapterPhaseLabel,
  getChapterProgressLabel,
  getVisibleBlocks,
  getVisibleChoices,
} from '../utils/story'
import { gameContent, statusPanelPlaceholder } from '../data/uiContent'

type GamePageProps = {
  node: StoryNode
  chapter: StoryChapterMeta
  /** 用于条件过滤的状态；显示选项专属回应时是选择前的快照，避免正文中途变化。 */
  state: StoryState
  /** 非 null 表示正在显示选项专属回应，此时隐藏选项、只显示继续。 */
  responseBlocks: StoryBlock[] | null
  onChoose: (choice: StoryChoice) => void
  onContinue: () => void
}

/**
 * 剧情游玩页。
 *
 * 只做三件事：显示当前节点的可见文本块、显示可见选项、把点击交回上层。
 * 不针对具体节点 ID 编写剧情逻辑，所有分支判断都在数据和引擎里。
 */
export default function GamePage({
  node,
  chapter,
  state,
  responseBlocks,
  onChoose,
  onContinue,
}: GamePageProps) {
  // 提交后短暂上锁，避免快速重复点击写入多条选择记录。
  // ref 拦截同一帧内的重复事件，state 只负责按钮的禁用样式。
  const lockedRef = useRef(false)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    lockedRef.current = false
    setLocked(false)
  }, [node.id, responseBlocks])

  function withLock(action: () => void) {
    if (lockedRef.current) return
    lockedRef.current = true
    setLocked(true)
    action()
  }

  const showingResponse = responseBlocks !== null
  const blocks = getVisibleBlocks(node.blocks, state)
  const choices = showingResponse ? [] : getVisibleChoices(node.choices, state)
  const showContinue = showingResponse || choices.length === 0

  const continueLabel =
    !showingResponse && node.role === 'ending_gate'
      ? gameContent.endingGateAction
      : gameContent.continueAction

  return (
    <main className="screen screen--game fade-in" data-mode={node.ui?.mode ?? 'normal'}>
      <div className="game__layout">
        <section className="game__main" aria-labelledby="chapter-title">
          <header className="game__header">
            <p className="eyebrow">{getChapterPhaseLabel(chapter)}</p>
            <span className="game__progress">{getChapterProgressLabel(chapter, node)}</span>
          </header>

          <h1 id="chapter-title" className="game__title">
            {node.sectionTitle ?? chapter.title}
          </h1>

          <div className="panel game__text">
            <StoryBlockList blocks={blocks} idPrefix={node.id} className="story-blocks" />

            {showingResponse && (
              <StoryBlockList
                blocks={responseBlocks}
                idPrefix={`${node.id}-response`}
                className="story-blocks story-blocks--response"
              />
            )}
          </div>

          {choices.length > 0 && (
            <ChoiceList
              choices={choices}
              disabled={locked}
              onSelect={(choice) => withLock(() => onChoose(choice))}
            />
          )}

          {showContinue && (
            <button
              type="button"
              className="button button--primary game__continue"
              disabled={locked}
              onClick={() => withLock(onContinue)}
            >
              {continueLabel}
            </button>
          )}
        </section>

        {node.ui?.hideStatusPanel !== true && (
          <aside className="panel status" aria-label="AI 状态面板">
            <h2 className="status__title">{statusPanelPlaceholder.title}</h2>
            <dl className="status__list">
              {statusPanelPlaceholder.items.map((item) => (
                <div key={item.label} className="status__item">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </main>
  )
}
