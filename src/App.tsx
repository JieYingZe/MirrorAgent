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
  createInitialStoryState,
  describeNodeIssue,
  getChapterMeta,
  getEnding,
  getEndingDefinition,
  getStoryNode,
} from './utils/story'

type Screen = 'start' | 'game' | 'ending'

/** 选项专属回应属于临时 UI 阶段，不写入 StoryState，也不进入以后的存档。 */
type ResponseStage = {
  nodeId: string
  blocks: StoryBlock[]
  /** 选择前的状态快照，保证正文的条件文本在阅读回应时不会中途变化。 */
  snapshot: StoryState
}

type EndingStage = {
  resolution: EndingResolution
  definition: EndingDefinition
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [state, setState] = useState<StoryState>(createInitialStoryState)
  const [responseStage, setResponseStage] = useState<ResponseStage | null>(null)
  const [ending, setEnding] = useState<EndingStage | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)

  // 切换节点后把阅读区域滚回顶部。
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [state.currentNodeId, responseStage])

  /** 统一的数据错误出口：界面只显示“实验数据损坏”，细节留给开发控制台。 */
  function reportDataError(detail: string) {
    console.error(`[story] ${detail}`)
    setDataError(detail)
  }

  function resetSession() {
    setState(createInitialStoryState())
    setResponseStage(null)
    setEnding(null)
    setDataError(null)
  }

  function handleStart() {
    resetSession()
    setScreen('game')
  }

  function handleRestart() {
    resetSession()
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

    setState(result.state)

    // 有专属回应时先停留在原节点显示回应，玩家点击继续后才进入新节点。
    setResponseStage(
      result.response.length > 0
        ? { nodeId: result.previousNodeId, blocks: result.response, snapshot: state }
        : null,
    )
  }

  function handleEnterEnding(currentState: StoryState) {
    const resolution = getEnding(currentState)
    const definition = getEndingDefinition(resolution.endingId)

    if (!definition) {
      reportDataError(`找不到结局定义：${resolution.endingId}（规则 ${resolution.ruleId}）。`)
      return
    }

    setState({ ...currentState, completed: true })
    setEnding({ resolution, definition })
    setScreen('ending')
  }

  function handleContinue() {
    // 正在显示选项专属回应：只关闭回应，状态早已在选择时提交。
    if (responseStage) {
      setResponseStage(null)
      return
    }

    const node = getStoryNode(state.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${state.currentNodeId}。`)
      return
    }

    if (node.role === 'ending_gate') {
      handleEnterEnding(state)
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

    setState(nextState)
  }

  function renderGame() {
    // 显示回应时继续渲染上一个节点，并使用选择前的状态快照做条件过滤。
    const viewNodeId = responseStage?.nodeId ?? state.currentNodeId
    const viewState = responseStage?.snapshot ?? state
    const node = getStoryNode(viewNodeId)

    if (!node) {
      return <DataErrorPage message={`找不到当前节点：${viewNodeId}。`} onRestart={handleRestart} />
    }

    const chapter = getChapterMeta(node.chapterId)

    if (!chapter) {
      return (
        <DataErrorPage
          message={`节点 ${node.id} 的章节 ${node.chapterId} 不在 manifest 中。`}
          onRestart={handleRestart}
        />
      )
    }

    const issue = responseStage ? undefined : describeNodeIssue(node, viewState)

    if (issue) {
      console.error(`[story] ${issue}`)
      return <DataErrorPage message={issue} onRestart={handleRestart} />
    }

    return (
      <GamePage
        node={node}
        chapter={chapter}
        state={viewState}
        // 状态面板始终读最新变量，即使正文停留在回应前的快照上。
        currentStats={state.stats}
        responseBlocks={responseStage?.blocks ?? null}
        onChoose={handleChoose}
        onContinue={handleContinue}
      />
    )
  }

  function renderScreen() {
    if (dataError) {
      return <DataErrorPage message={dataError} onRestart={handleRestart} />
    }

    if (screen === 'start') {
      return <StartPage onStart={handleStart} />
    }

    if (screen === 'ending') {
      if (!ending) {
        return (
          <DataErrorPage message="结局数据缺失，无法生成报告。" onRestart={handleRestart} />
        )
      }

      return (
        <EndingPage
          ending={ending.definition}
          resolution={ending.resolution}
          state={state}
          onRestart={handleRestart}
        />
      )
    }

    return renderGame()
  }

  return <div className="app-shell">{renderScreen()}</div>
}
