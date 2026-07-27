import { useState } from 'react'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import EndingPage from './pages/EndingPage'

type Screen = 'start' | 'game' | 'ending'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')

  return (
    <div className="app-shell">
      {screen === 'start' && <StartPage onStart={() => setScreen('game')} />}
      {screen === 'game' && <GamePage onChoose={() => setScreen('ending')} />}
      {screen === 'ending' && <EndingPage onRestart={() => setScreen('start')} />}
    </div>
  )
}
