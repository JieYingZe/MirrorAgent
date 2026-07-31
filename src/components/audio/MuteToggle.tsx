import { Volume2, VolumeX } from 'lucide-react'
import { audioContent } from '../../data/uiContent'

type MuteToggleProps = {
  muted: boolean
  onMutedChange: (next: boolean) => void
}

/**
 * 全局静音／恢复声音（A01）。
 *
 * 由 App 渲染一次并固定在右上角，因此 StartPage、GamePage、EndingPage 上
 * 位置完全一致，不会随页面结构变化跳动，也不会被剧情正文推走。
 *
 * 原生 button + `aria-pressed` + 明确的 aria-label，键盘可用并保留 focus-visible。
 * 它在剧情舞台之外，点击不会冒泡到 GamePage 的阅读推进热区。
 *
 * 只切换偏好。真正的停止与恢复由音频层根据最新的静音状态和当前场景决定，
 * 这个组件不认识任何曲目。
 */
export function MuteToggle({ muted, onMutedChange }: MuteToggleProps) {
  const label = muted ? audioContent.muteAriaSoundOff : audioContent.muteAriaSoundOn

  return (
    <button
      type="button"
      className="audio-toggle"
      aria-pressed={muted}
      aria-label={label}
      title={label}
      onClick={() => onMutedChange(!muted)}
    >
      {muted ? (
        <VolumeX className="audio-toggle__icon" size={18} aria-hidden="true" />
      ) : (
        <Volume2 className="audio-toggle__icon" size={18} aria-hidden="true" />
      )}
    </button>
  )
}
