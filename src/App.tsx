import { useEffect, useState } from 'react'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import EndingPage from './pages/EndingPage'
import DataErrorPage from './pages/DataErrorPage'
import type { EndingDefinition, StoryBlock, StoryChoice, StoryState } from './types/story'
import type { EndingResolution } from './utils/story'
import {
  advanceToNext,
  applyChoice,
  clearStorySave,
  createInitialStoryState,
  describeNodeIssue,
  getChapterMeta,
  getEnding,
  getEndingDefinition,
  getStoryNode,
  loadStorySave,
  responseSequenceKey,
  saveStorySave,
} from './utils/story'
import { useAutoplayPreference } from './hooks/useAutoplayPreference'

type Screen = 'start' | 'game' | 'ending'

/** 选项专属回应属于临时 UI 阶段，不写入 StoryState，也不进入存档。 */
type ResponseStage = {
  nodeId: string
  blocks: StoryBlock[]
  /**
   * 阅读序列标识（I01），形如 `response:${choiceId}:${下一稳定节点}`。
   * 只用于让打字机识别「换了一段要重新播放的文本」，同样不进存档。
   */
  sequenceKey: string
  /** 选择前的状态快照，保证正文的条件文本在阅读回应时不会中途变化。 */
  snapshot: StoryState
}

type EndingStage = {
  resolution: EndingResolution
  definition: EndingDefinition
}

type BootSession = {
  screen: Screen
  state: StoryState
  ending: EndingStage | null
  /** 有效的未完成存档，等玩家点击“继续实验”后才恢复。 */
  resumable: StoryState | null
}

/**
 * 启动时读取一次存档。
 *
 * - 无存档 / 损坏 / 旧版本 / storage 不可用：全部按无存档处理，停在 StartPage；
 * - 未完成存档：先留在 StartPage，由玩家决定继续还是重新初始化；
 * - 完成存档：用正式状态重新推导结局，直接恢复 EndingPage，不回到第五章旧节点。
 */
function createBootSession(): BootSession {
  const fresh: BootSession = {
    screen: 'start',
    state: createInitialStoryState(),
    ending: null,
    resumable: null,
  }

  const result = loadStorySave()

  if (result.status !== 'valid') return fresh

  const saved = result.state

  if (!saved.completed) {
    return { ...fresh, resumable: saved }
  }

  const resolution = getEnding(saved)
  const definition = getEndingDefinition(resolution.endingId)

  // 校验时已确认完成存档能推导出结局，这里只是不信任地再确认一次。
  if (!definition) {
    clearStorySave()
    return fresh
  }

  return {
    screen: 'ending',
    state: saved,
    ending: { resolution, definition },
    resumable: null,
  }
}

export default function App() {
  const [boot] = useState(createBootSession)
  const [screen, setScreen] = useState<Screen>(boot.screen)
  const [state, setState] = useState<StoryState>(boot.state)
  const [resumable, setResumable] = useState<StoryState | null>(boot.resumable)
  const [responseStage, setResponseStage] = useState<ResponseStage | null>(null)
  const [ending, setEnding] = useState<EndingStage | null>(boot.ending)
  const [dataError, setDataError] = useState<string | null>(null)

  /**
   * 自动播放偏好（I01）。
   *
   * 属于用户偏好而不是剧情进度：存在独立的 localStorage key 里，
   * 由应用层持有，因此节点切换、responseStage、重新初始化、通关重开都不会重置。
   * 它不进入 StoryState，也不进 I03 存档。
   */
  const [autoplayEnabled, setAutoplayEnabled] = useAutoplayPreference()

  /**
   * 切换节点后把阅读区域滚回顶部。
   *
   * 显示选项专属回应时不滚：此时正文没有换，回应接在原文下面逐段显示，
   * 拉回顶部反而会把刚出现的回应推出视野。回应结束、真正换到下一个稳定节点时，
   * 这个 effect 会因为 responseStage 变回 null 再跑一次。
   */
  useEffect(() => {
    if (responseStage) return

    window.scrollTo({ top: 0 })
  }, [state.currentNodeId, responseStage])

  /** 统一的数据错误出口：界面只显示“实验数据损坏”，细节留给开发控制台。 */
  function reportDataError(detail: string) {
    console.error(`[story] ${detail}`)
    setDataError(detail)
  }

  /**
   * 正式状态的唯一提交口：提交内存状态并立即写入存档。
   *
   * 到达结局门时把“计算结局 → 标记 completed → 保存”合成同一次提交，
   * 避免把 `completed: false` 且停在结局门的中间态写进存档。
   * 存档写入失败不影响内存状态，游戏照常继续。
   */
  function commitStoryState(next: StoryState): boolean {
    const node = getStoryNode(next.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${next.currentNodeId}。`)
      return false
    }

    if (node.role !== 'ending_gate') {
      setState(next)
      saveStorySave(next)
      return true
    }

    const resolution = getEnding(next)
    const definition = getEndingDefinition(resolution.endingId)

    if (!definition) {
      reportDataError(`找不到结局定义：${resolution.endingId}（规则 ${resolution.ruleId}）。`)
      return false
    }

    const completed: StoryState = { ...next, completed: true }

    setState(completed)
    setEnding({ resolution, definition })
    saveStorySave(completed)
    return true
  }

  /** 清空一次会话的全部临时 UI 状态：回应阶段、结局结果、错误页和可恢复存档。 */
  function clearSessionUi() {
    setResponseStage(null)
    setEnding(null)
    setDataError(null)
  }

  /**
   * 「开始初始化」与「重新初始化」共用的入口。
   *
   * 先清除旧剧情存档，再建立全新初始状态并直接进入序章；
   * 清除或保存失败时，内存中的重新初始化仍然成功。
   * 只处理剧情存档，不涉及音频偏好（音频偏好属于 A01，使用独立存储键）。
   */
  function handleStartNewRun() {
    clearStorySave()

    const fresh = createInitialStoryState()

    clearSessionUi()
    setResumable(null)
    setState(fresh)
    setScreen('game')
    saveStorySave(fresh)
  }

  /** 「继续实验」：恢复已通过校验的存档，临时 UI 状态一律从零开始。 */
  function handleResume() {
    if (!resumable) return

    clearSessionUi()
    setState(resumable)
    setScreen('game')
  }

  /** 数据损坏出口：清掉可能有问题的存档，回到开始页。 */
  function handleExitToStart() {
    clearStorySave()
    clearSessionUi()
    setResumable(null)
    setState(createInitialStoryState())
    setScreen('start')
  }

  function handleChoose(choice: StoryChoice) {
    const node = getStoryNode(state.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${state.currentNodeId}。`)
      return
    }

    const result = applyChoice(state, node, choice)

    // 路由目标必须存在，否则停在原地报错，不掩盖脏数据。
    if (!getStoryNode(result.state.currentNodeId)) {
      reportDataError(
        `选项 ${choice.id} 指向的节点不存在：${result.state.currentNodeId}（来自节点 ${node.id}）。`,
      )
      return
    }

    // 正式状态先提交并保存：即使玩家还在读选项专属回应，刷新也只会前进不会回退。
    if (!commitStoryState(result.state)) return

    // 有专属回应时先停留在原节点显示回应，玩家点击继续后才显示新节点。
    setResponseStage(
      result.response.length > 0
        ? {
            nodeId: result.previousNodeId,
            blocks: result.response,
            sequenceKey: responseSequenceKey(choice.id, result.state.currentNodeId),
            snapshot: state,
          }
        : null,
    )
  }

  function handleContinue() {
    // 正在显示选项专属回应：只关闭回应，状态早已在选择时提交并保存。
    if (responseStage) {
      setResponseStage(null)
      return
    }

    const node = getStoryNode(state.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${state.currentNodeId}。`)
      return
    }

    // 结局在进入结局门时已经作为同一次事务提交，这里只负责切页。
    if (node.role === 'ending_gate') {
      if (!ending && !commitStoryState(state)) return

      setScreen('ending')
      return
    }

    const nextState = advanceToNext(state, node)

    if (!nextState) {
      reportDataError(`节点 ${node.id} 没有 next，无法继续。`)
      return
    }

    if (!getStoryNode(nextState.currentNodeId)) {
      reportDataError(`节点 ${node.id} 的 next 指向不存在的节点：${nextState.currentNodeId}。`)
      return
    }

    commitStoryState(nextState)
  }

  function renderGame() {
    // 显示回应时继续渲染上一个节点，并使用选择前的状态快照做条件过滤。
    const viewNodeId = responseStage?.nodeId ?? state.currentNodeId
    const viewState = responseStage?.snapshot ?? state
    const node = getStoryNode(viewNodeId)

    if (!node) {
      return (
        <DataErrorPage message={`找不到当前节点：${viewNodeId}。`} onRestart={handleExitToStart} />
      )
    }

    const chapter = getChapterMeta(node.chapterId)

    if (!chapter) {
      return (
        <DataErrorPage
          message={`节点 ${node.id} 的章节 ${node.chapterId} 不在 manifest 中。`}
          onRestart={handleExitToStart}
        />
      )
    }

    const issue = responseStage ? undefined : describeNodeIssue(node, viewState)

    if (issue) {
      console.error(`[story] ${issue}`)
      return <DataErrorPage message={issue} onRestart={handleExitToStart} />
    }

    return (
      <GamePage
        node={node}
        chapter={chapter}
        state={viewState}
        // 状态面板始终读最新变量，即使正文停留在回应前的快照上。
        currentStats={state.stats}
        responseBlocks={responseStage?.blocks ?? null}
        responseKey={responseStage?.sequenceKey ?? null}
        autoplayEnabled={autoplayEnabled}
        onAutoplayEnabledChange={setAutoplayEnabled}
        onChoose={handleChoose}
        onContinue={handleContinue}
      />
    )
  }

  function renderScreen() {
    if (dataError) {
      return <DataErrorPage message={dataError} onRestart={handleExitToStart} />
    }

    if (screen === 'start') {
      return (
        <StartPage
          canContinue={resumable !== null}
          onStart={handleStartNewRun}
          onContinue={handleResume}
        />
      )
    }

    if (screen === 'ending') {
      if (!ending) {
        return (
          <DataErrorPage message="结局数据缺失，无法生成报告。" onRestart={handleExitToStart} />
        )
      }

      return (
        <EndingPage
          ending={ending.definition}
          resolution={ending.resolution}
          state={state}
          onRestart={handleStartNewRun}
        />
      )
    }

    return renderGame()
  }

  return <div className="app-shell">{renderScreen()}</div>
}
