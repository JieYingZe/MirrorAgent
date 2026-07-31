import { useCallback, useRef, useState } from 'react'
import type { UserPreferences, UserPreferencesPatch } from '../utils/userPreferences'
import {
  loadUserPreferences,
  normalizeUserPreferences,
  saveUserPreferences,
} from '../utils/userPreferences'

/**
 * 本地用户偏好（I01 的自动播放 + A01 的音频偏好）。
 *
 * 全项目唯一的偏好写入口。之前自动播放有自己的 hook，直接写 `{ version, autoplayEnabled }`；
 * 加入音频字段后那种写法会在切换自动播放时把静音状态抹掉，所以合并成这一个 hook：
 * 每次都基于最新的完整偏好打补丁再整份写回，两类偏好互不覆盖。
 *
 * 放在应用级组件里读一次再往下传，因此节点切换、responseStage、sequenceKey 变化、
 * 重新初始化、通关重开都不会重置它。保存失败不影响本次会话继续使用。
 */
export function useUserPreferences(): [UserPreferences, (patch: UserPreferencesPatch) => void] {
  const [preferences, setPreferences] = useState<UserPreferences>(loadUserPreferences)

  /**
   * 最新值的同步副本。
   *
   * 不用 setState 的函数式更新：那个回调必须是纯函数，而写 localStorage 是副作用
   * （Strict Mode 下还会被调用两次）。这里由 ref 提供「上一次的完整偏好」，
   * 副作用留在事件处理里，更新器只负责换值。
   */
  const latestRef = useRef(preferences)

  const update = useCallback((patch: UserPreferencesPatch) => {
    const next = normalizeUserPreferences({ ...latestRef.current, ...patch })

    latestRef.current = next
    setPreferences(next)
    saveUserPreferences(next)
  }, [])

  return [preferences, update]
}
