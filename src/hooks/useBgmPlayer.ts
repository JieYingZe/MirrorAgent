import { useCallback, useEffect, useRef } from 'react'
import type { BgmTrackKey } from '../types/audio'
import { createBgmPlayer } from '../utils/audio/bgmPlayer'
import type { BgmPlayerHandle } from '../utils/audio/bgmPlayer'

type UseBgmPlayerOptions = {
  track: BgmTrackKey | null
  muted: boolean
  masterVolume: number
  /** 是否已经过首次用户手势解锁（StartupGate）。 */
  unlocked: boolean
}

/**
 * 把播放器接到 React 生命周期上（A01）。
 *
 * 只在应用层调用一次，是全局唯一的音频状态所有者。
 *
 * 两个 effect 的顺序是有意的：先建实例，再同步状态。Strict Mode 下
 * 「建 → 同步 → 卸载 → 建 → 同步」，第二次挂载会把完整状态重新声明一遍，
 * 因此不会遗留实例，也不会出现两首同时在放。
 *
 * 依赖写成四个标量而不是整个对象：调用方每次渲染都会构造新对象，
 * 用对象做依赖会让每次渲染都重跑一次 sync。
 */
export function useBgmPlayer({ track, muted, masterVolume, unlocked }: UseBgmPlayerOptions) {
  const playerRef = useRef<BgmPlayerHandle | null>(null)

  useEffect(() => {
    const player = createBgmPlayer()

    playerRef.current = player

    return () => {
      player.dispose()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    playerRef.current?.sync({ track, muted, masterVolume, unlocked })
  }, [track, muted, masterVolume, unlocked])

  /**
   * 在用户手势里立即解锁并播放。
   *
   * 不等 React 状态更新后的 effect：浏览器的自动播放策略认的是用户手势，
   * 这一步必须发生在点击处理函数内部。调用方随后仍然会把 `unlocked` 置为 true，
   * 后续 sync 与这里的结果一致，不会互相覆盖。
   */
  const unlock = useCallback(() => {
    playerRef.current?.unlock()
  }, [])

  return { unlock }
}
