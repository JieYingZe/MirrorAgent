import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent, UIEvent } from 'react'
import type { Stats } from '../types/game'
import type {
  StoryBlock,
  StoryChapterMeta,
  StoryChoice,
  StoryNode,
  StoryState,
} from '../types/story'
import { StoryBlockList } from '../components/story/StoryBlockRenderer'
import { ChoiceList } from '../components/story/ChoiceList'
import { AutoplayToggle } from '../components/story/AutoplayToggle'
import { AiStatusPanel } from '../components/status/AiStatusPanel'
import { AudioToggles } from '../components/audio/AudioToggles'
import {
  getChapterPhaseLabel,
  getVisibleBlocks,
  getVisibleChoices,
  nodeSequenceKey,
} from '../utils/story'
import type { ReadingRevealEvent } from '../utils/story/readingReveal'
import { useStoryReadingSequence } from '../hooks/useStoryReadingSequence'
import {
  PROGRAMMATIC_SCROLL_GUARD_MS,
  classifyReadingScroll,
  isTargetVisibleInContainer,
  resolveContainerScrollDelta,
} from '../utils/readingScroll'
import type { PendingProgrammaticScroll } from '../utils/readingScroll'
import { gameContent } from '../data/uiContent'

type GamePageProps = {
  node: StoryNode
  chapter: StoryChapterMeta
  /** 用于条件过滤的状态；显示选项专属回应时是选择前的快照，避免正文中途变化。 */
  state: StoryState
  /**
   * 面板使用的最新变量值。
   *
   * 不能用 `state.stats`：显示选项专属回应时 `state` 是选择前的快照，
   * 而状态面板必须在点击选择后立即反映新值。
   */
  currentStats: Stats
  /** 非 null 表示正在显示选项专属回应，此时隐藏选项、只显示继续。 */
  responseBlocks: StoryBlock[] | null
  /** 回应的展示序列标识；与 responseBlocks 同时存在，只用于阅读状态，不进存档。 */
  responseKey: string | null
  /** 自动播放偏好。由应用层持有并持久化，节点切换不会重置。 */
  autoplayEnabled: boolean
  onAutoplayEnabledChange: (next: boolean) => void
  /**
   * 音频通道偏好与切换（V03）。
   *
   * 剧情页把两个音频开关排进顶栏，所以它需要拿到这几个值。
   * 页面仍然只是转发：偏好的所有者是 App，这里既不持有状态也不碰播放器。
   */
  bgmEnabled: boolean
  sfxEnabled: boolean
  onBgmEnabledChange: (next: boolean) => void
  onSfxEnabledChange: (next: boolean) => void
  onChoose: (choice: StoryChoice) => void
  onContinue: () => void
  /**
   * 揭示进度的订阅者（A03）。
   *
   * 页面只是把它原样交给阅读 hook，自己不解释、不判断、不持有任何音频对象。
   * 应用层用它驱动打字机音效；不传时阅读行为与 I01 完全一致。
   */
  onReadingReveal?: (event: ReadingRevealEvent) => void
}

/**
 * 不该触发阅读推进的目标。
 *
 * 所有排除规则集中在这一个选择器里，不散落到各个 handler。
 * 需要新增例外时给元素加 `data-no-story-advance`，不要再写按 class 名的判断。
 */
const NON_ADVANCING_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [data-no-story-advance]'

function isNonAdvancingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(NON_ADVANCING_SELECTOR) !== null
}

/*
  这里曾经有一个 hasTextSelection()：玩家正在划选文字时不推进阅读，
  否则一次划选结束就会吃掉整页正文。

  现在整个业务层是 user-select: none（见 global.css 的 .app-shell），
  玩家已经不可能产生选区，这个判断永远为假，所以删掉了。
  如果以后某个区域重新允许划选，需要连同这个判断一起恢复。
*/

/** 超过这个位移就当成滚动或拖动，随后的 click 不推进。 */
const POINTER_DRAG_THRESHOLD_PX = 10

/** 按在滚动条上（内容区右侧）不是阅读推进。 */
function isScrollbarPress(event: PointerEvent<HTMLElement>): boolean {
  const target = event.target

  if (!(target instanceof HTMLElement)) return false
  if (target.scrollHeight <= target.clientHeight) return false

  return event.clientX > target.getBoundingClientRect().left + target.clientWidth
}

/**
 * 在剧情容器内部做一次最小滚动，把目标块带进视野。
 *
 * 只改容器的 scrollTop，不用 scrollIntoView —— 后者会连带滚动外层页面。
 * 几何计算在 utils/readingScroll.ts，这里只负责读矩形和发起滚动。
 *
 * 滚动是瞬时的（behavior: 'auto'）。这不是省事，是为了不抖：
 * 这次滚动发生在 layout effect 里，也就是新块已经进 DOM、浏览器还没绘制的时候。
 * 瞬时滚动会和新块在同一帧落定，玩家看到的是一次干净的位移；
 * 换成平滑滚动，浏览器就必须先按「内容变长了、位置还没动」画出一帧
 * —— 滚动条在那一帧缩短并往回跳，然后再随动画滑回来，这就是那下抖动。
 *
 * 返回这次滚动的目标位置；已经在视野里、不需要滚时返回 null。
 * 调用方拿它给程序滚动立护栏。
 */
function scrollBlockIntoContainerView(container: HTMLElement, target: Element): number | null {
  const delta = resolveContainerScrollDelta(
    container.getBoundingClientRect(),
    target.getBoundingClientRect(),
  )

  if (Math.abs(delta) < 1) return null

  const top = Math.round(container.scrollTop + delta)

  container.scrollTo({ top, behavior: 'auto' })

  return top
}

/** 会滚动阅读区的按键；其余按键不是滚动意图，不该留下滚动痕迹。 */
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
])

/**
 * 剧情游玩页。
 *
 * 显示当前展示序列的文本块、显示可见选项、把点击交回上层。
 * 不针对具体节点 ID 编写剧情逻辑，所有分支判断都在数据和引擎里。
 *
 * 布局（I01 建立，V03 改成上下结构）：舞台先横着切一条顶栏，
 * 顶栏左边是章节标记与标题、右边是进度与全部开关（自动播放、音乐、音效）；
 * 顶栏下面才分左右两列 —— 左列是剧情面板，右列是 AI 状态面板。
 *
 * 剧情面板本身是那块半透明底：阅读区与交互区（继续／选项）都在它里面，
 * 因此滚动条也落在面板内部，不会像原来那样贴着面板外沿。
 * 阅读区仍然是唯一高度受控的滚动容器，正文变长只在它内部滚动，
 * 不会把顶栏、状态面板和交互区推到页面下方。
 *
 * 阅读节奏（I01）：当前 block 始终自动逐字揭示；完成后是否自动进入下一个 block
 * 由自动播放偏好决定，默认关闭。开启时一次点击直接看完当前展示序列。
 * 两种情况都在继续按钮、探索入口、选项和 response 结束处停止。
 * 阅读进度只属于这一层，不进入 StoryState，也不写存档。
 */
export default function GamePage({
  node,
  chapter,
  state,
  currentStats,
  responseBlocks,
  responseKey,
  autoplayEnabled,
  onAutoplayEnabledChange,
  bgmEnabled,
  sfxEnabled,
  onBgmEnabledChange,
  onSfxEnabledChange,
  onChoose,
  onContinue,
  onReadingReveal,
}: GamePageProps) {
  // 提交后短暂上锁，避免快速重复点击写入多条选择记录。
  // ref 拦截同一帧内的重复事件，state 只负责按钮的禁用样式。
  const lockedRef = useRef(false)
  const [locked, setLocked] = useState(false)

  const readingAreaRef = useRef<HTMLDivElement | null>(null)
  /** 最近一次推进是否来自键盘，决定要不要在换段后接回焦点。 */
  const keyboardModeRef = useRef(false)
  /** 玩家是否还在跟读当前块；主动往回翻历史后置为 false。 */
  const followCurrentBlockRef = useRef(true)
  /**
   * 最近一次真实滚动输入（滚轮、触摸、滚动键）的时间戳。
   *
   * 用时间戳而不是布尔量：已经滚到底还继续滚轮时不会有任何 scroll 事件，
   * 布尔量会一直停在 true，随后被某次程序滚动的中间帧认领，
   * 自动跟随就此被自己关掉 —— 这正是「点下一段却不滚下去」的来源。
   */
  const lastUserScrollIntentAtRef = useRef(0)
  /** 进行中的程序滚动；它发出的 scroll 事件不参与跟随判断。 */
  const programmaticScrollRef = useRef<PendingProgrammaticScroll | null>(null)
  /** 本次 pointer 交互是不是滚动／拖动／按滚动条，是的话随后的 click 不推进。 */
  const pointerBlockedRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  const showingResponse = responseBlocks !== null && responseKey !== null

  // 条件过滤的结果必须保持引用稳定，否则每次重渲染都会重建揭示计划。
  const nodeBlocks = useMemo(() => getVisibleBlocks(node.blocks, state), [node.blocks, state])

  const sequenceBlocks = showingResponse ? responseBlocks : nodeBlocks
  const sequenceKey = showingResponse ? responseKey : nodeSequenceKey(node.id)

  const reading = useStoryReadingSequence(sequenceBlocks, sequenceKey, {
    autoplayEnabled,
    onReveal: onReadingReveal,
  })

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

  const markUserScrollIntent = useCallback(() => {
    lastUserScrollIntentAtRef.current = Date.now()
  }, [])

  /**
   * 阅读推进的统一入口。
   *
   * 除了推进本身，还负责一件事：玩家主动要下一段，就是要看下一段。
   * 因此每次真的消费了输入都恢复自动跟随，并清掉过期的滚动意图；
   * 「往回翻历史就不要把我拉回去」只对自动播放这种玩家没出手的推进有意义。
   */
  const advanceReading = useCallback(() => {
    const consumed = reading.advance()

    if (!consumed) return false

    followCurrentBlockRef.current = true
    lastUserScrollIntentAtRef.current = 0

    return true
  }, [reading.advance])

  /* ---------- 阅读推进：整个舞台的非交互空白都算热区 ---------- */

  const handleStagePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    pointerBlockedRef.current = isScrollbarPress(event)
  }, [])

  const handleStagePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const start = pointerStartRef.current

    if (!start || pointerBlockedRef.current) return

    // 触摸滑动、鼠标拖选、拖动滚动条都会走到这里。
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > POINTER_DRAG_THRESHOLD_PX) {
      pointerBlockedRef.current = true
    }
  }, [])

  const handleStageClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const blockedByPointer = pointerBlockedRef.current

      pointerBlockedRef.current = false
      pointerStartRef.current = null

      if (blockedByPointer) return
      if (isNonAdvancingTarget(event.target)) return

      advanceReading()
    },
    [advanceReading],
  )

  const handleStageKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
        // 方向键、PageUp/PageDown、Home/End 是玩家在自己滚动阅读区；
        // 其余按键既不推进也不滚动，不留下滚动意图。
        if (SCROLL_KEYS.has(event.key)) markUserScrollIntent()
        return
      }

      // 焦点在开关、继续按钮或选项上时，只执行那个按钮自己的行为。
      if (isNonAdvancingTarget(event.target)) return

      // 空格不能顺带滚动阅读区域或页面。
      event.preventDefault()

      // 长按自动重复不算独立输入。
      if (event.repeat) return

      keyboardModeRef.current = true
      advanceReading()
    },
    [advanceReading, markUserScrollIntent],
  )

  /* ---------- 内部滚动跟随 ---------- */

  /** 当前正在揭示的块元素；整段完成后取最后一块。 */
  const currentBlockElement = useCallback((): Element | null => {
    const container = readingAreaRef.current

    if (!container) return null

    const activeList = container.querySelector('[data-reading="active"]')

    if (activeList) return activeList.lastElementChild

    const lists = container.querySelectorAll('.story-blocks')

    return lists[lists.length - 1]?.lastElementChild ?? null
  }, [])

  /**
   * 只要当前块还在视野里，就认为玩家在跟读。
   *
   * 这样判断的好处：程序自己的跟随滚动结束时当前块必定可见，不会误判成
   * 「玩家离开了」；玩家主动往上翻历史时当前块移出视野，自动跟随立刻停止；
   * 玩家再滚回来时又恢复跟随。
   */
  const handleReadingScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const container = event.currentTarget
      const decision = classifyReadingScroll({
        now: Date.now(),
        lastUserIntentAt: lastUserScrollIntentAtRef.current,
        pending: programmaticScrollRef.current,
        scrollTop: container.scrollTop,
      })

      // 到位、超时或被玩家接管，护栏就此结束。
      if (!decision.keepPending) programmaticScrollRef.current = null

      // 不是玩家滚的就不改跟随状态：程序滚动不该关掉自动跟随。
      if (!decision.fromUser) return

      const target = currentBlockElement()

      if (!target) return

      followCurrentBlockRef.current = isTargetVisibleInContainer(
        container.getBoundingClientRect(),
        target.getBoundingClientRect(),
      )
    },
    [currentBlockElement],
  )

  // 换展示序列时恢复自动跟随，旧序列的滚动判断不会影响新序列。
  useEffect(() => {
    followCurrentBlockRef.current = true
    lastUserScrollIntentAtRef.current = 0
    programmaticScrollRef.current = null
  }, [reading.sequenceKey])

  // 用键盘读到一半时换了展示序列，焦点会掉回 body；这里只接回丢掉的焦点。
  useEffect(() => {
    if (!keyboardModeRef.current) return

    const area = readingAreaRef.current
    const active = document.activeElement

    if (!area) return
    if (active !== null && active !== document.body) return

    area.focus({ preventScroll: true })
  }, [reading.sequenceKey])

  /**
   * 内部自动跟随。
   *
   * 只在开始新块、当前块被补全和整段完成时检查，不逐字滚动；
   * 只调整剧情容器的 scrollTop，不动 window；
   * 玩家主动往回读时不把他拉回来。
   * 用 layout effect 是为了在绘制前完成，避免新块先闪一下再跳位。
   */
  useLayoutEffect(() => {
    const container = readingAreaRef.current

    if (!container) return
    if (!followCurrentBlockRef.current) return

    const target = currentBlockElement()

    if (!target) return

    const top = scrollBlockIntoContainerView(container, target)

    if (top === null) return

    // 立护栏：这次滚动自己发出的 scroll 事件不能被当成「玩家翻走了」。
    programmaticScrollRef.current = { top, deadline: Date.now() + PROGRAMMATIC_SCROLL_GUARD_MS }
  }, [
    currentBlockElement,
    reading.sequenceKey,
    reading.blockIndex,
    reading.blockComplete,
    reading.sequenceComplete,
  ])

  const visibleChoices = showingResponse ? [] : getVisibleChoices(node.choices, state)

  // 正文没读完之前，选项与继续按钮既不渲染也就无法点击或聚焦。
  const interactionsReady = reading.sequenceComplete
  const choices = interactionsReady ? visibleChoices : []
  const showContinue = interactionsReady && (showingResponse || visibleChoices.length === 0)

  const continueLabel =
    !showingResponse && node.role === 'ending_gate'
      ? gameContent.endingGateAction
      : gameContent.continueAction

  // 只播报一句状态，不逐字播报正文。
  const liveMessage = !interactionsReady
    ? ''
    : visibleChoices.length > 0
      ? gameContent.choicesReadyHint
      : gameContent.readingCompleteHint

  return (
    <main
      className="screen screen--game fade-in"
      data-mode={node.ui?.mode ?? 'normal'}
      onClick={handleStageClick}
      onKeyDown={handleStageKeyDown}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
    >
      <div className="game__stage">
        {/* 顶栏横跨整个舞台：标题在左，开关全部收在右边，不再悬浮在正文之上。 */}
        <header className="game__topbar">
          <div className="game__topbar-lead">
            <p className="eyebrow game__phase">{getChapterPhaseLabel(chapter)}</p>
            <h1 id="chapter-title" className="game__title">
              {node.sectionTitle ?? chapter.title}
            </h1>
          </div>

          <div className="game__topbar-actions">
            <AutoplayToggle enabled={autoplayEnabled} onChange={onAutoplayEnabledChange} />
            <AudioToggles
              variant="inline"
              bgmEnabled={bgmEnabled}
              sfxEnabled={sfxEnabled}
              onBgmEnabledChange={onBgmEnabledChange}
              onSfxEnabledChange={onSfxEnabledChange}
            />
          </div>
        </header>

        <div className="game__layout">
          {/* 这块 panel 就是左侧的半透明底：阅读区与交互区都在它内部。 */}
          <section className="panel game__main" aria-labelledby="chapter-title">
            {/* 高度受控的独立滚动容器：正文只在这里面滚，滚动条落在面板内。 */}
            <div
              ref={readingAreaRef}
              className="game__text"
              tabIndex={0}
              onScroll={handleReadingScroll}
              // 玩家自己滚动的信号：滚轮、触摸拖动。
              onWheel={markUserScrollIntent}
              onTouchMove={markUserScrollIntent}
            >
              <StoryBlockList
                blocks={nodeBlocks}
                idPrefix={node.id}
                className="story-blocks"
                // 显示回应时，节点正文早已读完，保持完整显示。
                reveal={showingResponse ? undefined : reading}
              />

              {showingResponse && (
                <StoryBlockList
                  blocks={responseBlocks}
                  idPrefix={`${node.id}-response`}
                  className="story-blocks story-blocks--response"
                  reveal={reading}
                />
              )}
            </div>

            {/* 交互区整体不参与阅读推进：点选项或继续按钮不会同时快进正文。 */}
            <div className="game__interactions" data-no-story-advance="true">
              {!interactionsReady && (
                <p className="game__reading-hint">
                  {autoplayEnabled ? gameContent.readingHintAutoplay : gameContent.readingHintManual}
                </p>
              )}

              {choices.length > 0 && (
                <div className="reading-reveal">
                  <ChoiceList
                    choices={choices}
                    disabled={locked}
                    onSelect={(choice, event) => {
                      keyboardModeRef.current = event.detail === 0
                      withLock(() => onChoose(choice))
                    }}
                  />
                </div>
              )}

              {showContinue && (
                <button
                  type="button"
                  className="button button--primary game__continue reading-reveal"
                  disabled={locked}
                  onClick={(event) => {
                    event.stopPropagation()
                    keyboardModeRef.current = event.detail === 0
                    withLock(onContinue)
                  }}
                >
                  {continueLabel}
                </button>
              )}
            </div>

            <p className="sr-only" aria-live="polite">
              {liveMessage}
            </p>
          </section>

          {node.ui?.hideStatusPanel !== true && (
            <AiStatusPanel stats={currentStats} mode={node.ui?.mode} />
          )}
        </div>
      </div>
    </main>
  )
}
