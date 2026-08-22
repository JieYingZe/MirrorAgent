import { useCallback, useEffect, useRef, useState } from 'react'

/** idle：还没点过；copied：这一次成功了；failed：写剪贴板失败，需要手动复制。 */
export type CopyStatus = 'idle' | 'copied' | 'failed'

/** 成功提示显示多久后自动消失。失败提示不自动消失 —— 那时页面上还有待复制的文本框。 */
const COPIED_RESET_MS = 2600

/**
 * 复制到剪贴板，失败时降级为「请手动复制」。
 *
 * 为什么需要一个 hook 而不是一行 navigator.clipboard.writeText：
 * - 结果要变成界面上的一句提示，也就是状态；
 * - 成功提示要在几秒后自己消失，涉及一个必须在卸载时清掉的定时器；
 * - 失败必须是可预期的分支，不是异常。剪贴板在 http 页面、
 *   iframe、被拒绝授权时都会失败，这里一律吞掉错误并返回 false，
 *   由页面显示手动复制的文本框（docs/03 §6.3）。
 *
 * 复制失败不影响任何其他操作：这个 hook 不碰存档、不碰剧情状态。
 */
export function useClipboardCopy() {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return

    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const copy = useCallback(
    async (text: string) => {
      clearTimer()

      try {
        // 没有 clipboard API 时直接走失败分支，不去构造隐藏 textarea 再 execCommand：
        // 那条路径在现代浏览器上同样会被拒绝，只是失败得更晚、更难解释。
        if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')

        await navigator.clipboard.writeText(text)
        setStatus('copied')
        timerRef.current = setTimeout(() => setStatus('idle'), COPIED_RESET_MS)
        return true
      } catch {
        setStatus('failed')
        return false
      }
    },
    [clearTimer],
  )

  /** 换结局、重新开始时把提示收掉，旧的一次复制结果不该跨场景留着。 */
  const reset = useCallback(() => {
    clearTimer()
    setStatus('idle')
  }, [clearTimer])

  return { status, copy, reset }
}
