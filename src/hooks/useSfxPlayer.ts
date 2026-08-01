import { useCallback, useEffect, useRef } from 'react'
import type { SfxKey } from '../types/audio'
import type { SfxPlayerHandle } from '../utils/audio/sfxPlayer'
import { createSfxPlayer } from '../utils/audio/sfxPlayer'
import type { SfxAction } from '../utils/audio/sfxActions'
import { resolveActionSfx } from '../utils/audio/sfxActions'

type UseSfxPlayerOptions = {
  muted: boolean
  masterVolume: number
  /** 是否已经过首次用户手势解锁（StartupGate）。 */
  unlocked: boolean
}

export type SfxController = {
  /** 语义化入口：业务层说发生了哪个动作，由音频层决定响什么。 */
  playAction: (action: SfxAction) => void
  /** 按键触发：只给音频层内部的触发器用（打字、警告、结局揭示）。 */
  playSfx: (key: SfxKey) => void
  /** 在用户手势里解锁，使同一个调用栈里紧接着的触发能发声。 */
  unlock: () => void
  /** 立即应用新的静音状态（偏好仍是唯一来源，这里只是提前一步下发）。 */
  setMuted: (muted: boolean) => void
}

/**
 * 把 SFX 播放器接到 React 生命周期上（A03）。
 *
 * 与 `useBgmPlayer` 是并列的两个执行器，只在应用层各调用一次。
 * 两者读的是同一份偏好（静音、主音量）和同一个解锁标记，因此不存在
 * 第二套静音状态，也不会出现只静了一半的情况。
 *
 * 三个返回值都是稳定引用：调用方可以直接放进事件处理器和 effect 依赖，
 * 不会因为音频状态变化而让阅读调度重新排队。
 */
export function useSfxPlayer({ muted, masterVolume, unlocked }: UseSfxPlayerOptions): SfxController {
  const playerRef = useRef<SfxPlayerHandle | null>(null)

  useEffect(() => {
    const player = createSfxPlayer()

    playerRef.current = player

    return () => {
      player.dispose()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    playerRef.current?.sync({ muted, masterVolume, unlocked })
  }, [muted, masterVolume, unlocked])

  const playSfx = useCallback((key: SfxKey) => {
    playerRef.current?.play(key)
  }, [])

  const playAction = useCallback((action: SfxAction) => {
    const key = resolveActionSfx(action)

    if (key === null) return

    playerRef.current?.play(key)
  }, [])

  /**
   * 解锁必须发生在用户手势的调用栈里，不能等 React 状态更新后的 effect：
   * 与 BGM 同理，浏览器的自动播放策略认的是手势本身。
   */
  const unlock = useCallback(() => {
    playerRef.current?.unlock()
  }, [])

  const setMuted = useCallback((next: boolean) => {
    playerRef.current?.setMuted(next)
  }, [])

  return { playAction, playSfx, unlock, setMuted }
}
