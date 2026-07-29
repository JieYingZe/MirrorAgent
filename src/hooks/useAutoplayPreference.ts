import { useCallback, useState } from 'react'
import { loadUserPreferences, saveUserPreferences } from '../utils/userPreferences'

/**
 * 自动播放偏好。
 *
 * 放在应用级组件里读一次，再往下传：这样它不会因为节点切换、
 * responseStage 出现或 sequenceKey 变化而重置。
 * 偏好即时写回本地存储，保存失败也不影响本次会话继续使用。
 */
export function useAutoplayPreference(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState(() => loadUserPreferences().autoplayEnabled)

  const update = useCallback((next: boolean) => {
    setEnabled(next)
    saveUserPreferences({ version: 1, autoplayEnabled: next })
  }, [])

  return [enabled, update]
}
