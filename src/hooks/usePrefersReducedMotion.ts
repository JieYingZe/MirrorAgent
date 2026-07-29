import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function matchQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null

  try {
    return window.matchMedia(QUERY)
  } catch {
    return null
  }
}

/**
 * 是否处于「减少动态效果」模式。
 *
 * 玩家在页面运行期间切换系统设置时也会跟着变，不需要刷新。
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => matchQuery()?.matches ?? false)

  useEffect(() => {
    const query = matchQuery()

    if (!query) return

    // 订阅之前先对齐一次，避免首次渲染到订阅之间的设置变化被漏掉。
    setReduced(query.matches)

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches)

    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [])

  return reduced
}
