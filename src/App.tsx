import { useEffect, useState } from 'react'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import EndingPage from './pages/EndingPage'
import DataErrorPage from './pages/DataErrorPage'
import { getChapterById, storyDataErrors } from './data/story'
import { applyChoice, createInitialGameState } from './utils/gameState'
import type { GameState, StoryChoice } from './types/game'

type Screen = 'start' | 'game' | 'ending'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [gameState, setGameState] = useState<GameState>(createInitialGameState)
  const [dataError, setDataError] = useState<string | null>(null)

  // 切换章节后把阅读区域滚回顶部。
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [gameState.currentChapterId])

  function handleStart() {
    if (storyDataErrors.length > 0) {
      setDataError('剧情数据未通过完整性检查，详见开发控制台。')
      return
    }

    setGameState(createInitialGameState())
    setScreen('game')
  }

  function handleChoose(choice: StoryChoice) {
    const chapter = getChapterById(gameState.currentChapterId)

    if (!chapter) {
      setDataError(`无法找到当前章节：${gameState.currentChapterId}。`)
      return
    }

    // 结束选项之外，必须先确认下一章存在，否则停在原地并报错，不掩盖脏数据。
    if (choice.endsGame !== true && getChapterById(choice.nextChapterId ?? '') === undefined) {
      setDataError(
        `选项 ${choice.id} 指向的下一章节不存在：${choice.nextChapterId ?? '未定义'}。`,
      )
      return
    }

    setGameState((previous) => applyChoice(previous, chapter, choice))

    if (choice.endsGame === true) {
      setScreen('ending')
    }
  }

  function handleRestart() {
    setGameState(createInitialGameState())
    setDataError(null)
    setScreen('start')
  }

  function renderScreen() {
    if (dataError) {
      return <DataErrorPage message={dataError} onRestart={handleRestart} />
    }

    if (screen === 'start') {
      return <StartPage onStart={handleStart} />
    }

    if (screen === 'ending') {
      return (
        <EndingPage
          stats={gameState.stats}
          choices={gameState.choices}
          finalChoice={gameState.finalChoice}
          onRestart={handleRestart}
        />
      )
    }

    const chapter = getChapterById(gameState.currentChapterId)

    if (!chapter) {
      return (
        <DataErrorPage
          message={`无法找到当前章节：${gameState.currentChapterId}。`}
          onRestart={handleRestart}
        />
      )
    }

    if (chapter.choices.length === 0) {
      return (
        <DataErrorPage
          message={`章节 ${chapter.id} 没有任何可用选项。`}
          onRestart={handleRestart}
        />
      )
    }

    return <GamePage chapter={chapter} onChoose={handleChoose} />
  }

  return <div className="app-shell">{renderScreen()}</div>
}
