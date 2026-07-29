import { useEffect, useState } from 'react'

function matchQuery(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null

  try {
    return window.matchMedia(query)
  } catch {
    return null
  }
}

/**
 * 订阅一条媒体查询。
 *
 * 与 usePrefersReducedMotion 同一套写法：先对齐一次再订阅，
 * 运行期间旋转屏幕或改窗口大小都会跟着变，不需要刷新。
 * matchMedia 不可用时一律返回 false，由 CSS 那边继续兜底。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => matchQuery(query)?.matches ?? false)

  useEffect(() => {
    const list = matchQuery(query)

    if (!list) return

    setMatches(list.matches)

    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    list.addEventListener('change', handleChange)

    return () => list.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
