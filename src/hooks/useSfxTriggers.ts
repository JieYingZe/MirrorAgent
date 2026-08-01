import { useCallback, useEffect, useRef } from 'react'
import type { SfxKey } from '../types/audio'
import type { ReadingRevealEvent } from '../utils/story/readingReveal'
import { createTypingSfxState, decideTypingSfx } from '../utils/audio/typingSfx'
import { createOneShotGate, stepOneShotGate } from '../utils/audio/sfxTriggers'

/**
 * 两个 SFX 触发器的 React 外壳（A03）。
 *
 * 判定逻辑全部在 utils/audio 的纯函数里，这里只负责「把上一次的判定结果存住」
 * 和「在正确的时机调用一次」。两个 hook 都不创建任何 timer、不订阅任何事件，
 * 因此不存在需要清理的调度，也不会在卸载后留下待播放队列。
 */

/**
 * 打字机音效。
 *
 * 返回一个稳定的回调，交给阅读 hook 作为揭示进度的订阅者。它是完全被动的：
 * 只在一次揭示已经提交之后被调用，不参与调度，也不能反过来影响阅读推进。
 *
 * 限频状态放在 ref 里而不是 state：它每秒变化好几次，进 state 会带来
 * 一串毫无意义的重渲染，还会把阅读调度的依赖搅乱。
 */
export function useTypingSfx(playSfx: (key: SfxKey) => void) {
  const stateRef = useRef(createTypingSfxState())

  return useCallback(
    (event: ReadingRevealEvent) => {
      const decision = decideTypingSfx(stateRef.current, event, Date.now())

      stateRef.current = decision.state

      if (decision.play) playSfx('text_type')
    },
    [playSfx],
  )
}

/**
 * 进入某个场景时响一次。
 *
 * `active` 从 false 变 true 时触发一次，之后一直为 true 都不会再触发；
 * 回到 false 时闸门重新装填。Strict Mode 下同一个 effect 会执行两次，
 * 但闸门在 ref 里，第二次执行看到的已经是「响过了」。
 *
 * 静音时播放器会丢掉这次触发，闸门仍然记为已触发 —— 这正是
 * 「恢复声音后不补播已经错过的一次性音效」想要的结果。
 */
export function useOneShotSfx(active: boolean, fire: () => void) {
  const gateRef = useRef(createOneShotGate())
  const fireRef = useRef(fire)

  fireRef.current = fire

  useEffect(() => {
    const result = stepOneShotGate(gateRef.current, active)

    gateRef.current = result.gate

    if (result.fire) fireRef.current()
  }, [active])
}
