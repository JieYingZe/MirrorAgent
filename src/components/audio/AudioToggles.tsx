import { Music, Volume2 } from 'lucide-react'
import { audioContent } from '../../data/uiContent'

type AudioTogglesProps = {
  bgmEnabled: boolean
  sfxEnabled: boolean
  onBgmEnabledChange: (next: boolean) => void
  onSfxEnabledChange: (next: boolean) => void
  /**
   * 定位方式（V03）。
   *
   * - `floating`（默认）：固定在视口右上角，用于开始页与结局页；
   * - `inline`：不定位，交给外层容器排版，用于剧情页顶栏。
   *
   * 只影响这一层容器的定位，按钮本身两种情况完全一样。
   */
  variant?: 'floating' | 'inline'
}

type ChannelToggleProps = {
  enabled: boolean
  shortName: string
  ariaOn: string
  ariaOff: string
  icon: typeof Volume2
  onChange: (next: boolean) => void
}

/**
 * 单个音频通道开关。
 *
 * 原生 button + `aria-pressed`（按下 = 这个通道开着），键盘可用并保留 focus-visible。
 *
 * 状态由**可见的「开／关」文字**承担，不是图标：两个通道各自保留一个固定的图标
 * （音符 / 喇叭）用来区分「这是哪个通道」，状态则由文字、颜色和边框一起表达。
 * 刻意不做「图标划一道斜线」的开关状态 —— 14px 的图标在移动端并不总能一眼分辨，
 * 而这两个按钮又必须在很小的角落里同时存在。
 */
function ChannelToggle({
  enabled,
  shortName,
  ariaOn,
  ariaOff,
  icon: Icon,
  onChange,
}: ChannelToggleProps) {
  const label = enabled ? ariaOn : ariaOff

  return (
    <button
      type="button"
      className="audio-toggle"
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      onClick={() => onChange(!enabled)}
    >
      <Icon className="audio-toggle__icon" size={13} aria-hidden="true" />
      <span className="audio-toggle__name">{shortName}</span>
      <span className="audio-toggle__state">
        {enabled ? audioContent.stateOn : audioContent.stateOff}
      </span>
    </button>
  )
}

/**
 * 背景音乐与音效的两个独立开关（A01 建立，A03 试玩修订拆分，V03 改定位）。
 *
 * 开始页与结局页仍然由 App 固定在视口右上角；剧情页把它放进顶栏的按钮组里
 * （`variant="inline"`），不再悬浮在正文之上 —— 悬浮时章节头必须靠一段
 * 写死的 padding 给它让位，页面结构一变让位量就要跟着改。
 *
 * 为什么是两个而不是「两个 + 一个总开关」：三个状态之间需要互相同步，
 * 玩家还要先理解它们的优先级；两个独立开关已经能表达全部四种组合。
 *
 * 只切换偏好。真正的停止与恢复由各自的播放器根据最新状态决定，
 * 这个组件不认识任何曲目，也不持有任何 Audio 实例。
 */
export function AudioToggles({
  bgmEnabled,
  sfxEnabled,
  onBgmEnabledChange,
  onSfxEnabledChange,
  variant = 'floating',
}: AudioTogglesProps) {
  return (
    <div
      className={`audio-toggles audio-toggles--${variant}`}
      role="group"
      aria-label={audioContent.groupLabel}
    >
      <ChannelToggle
        enabled={bgmEnabled}
        shortName={audioContent.bgm.shortName}
        ariaOn={audioContent.bgm.ariaOn}
        ariaOff={audioContent.bgm.ariaOff}
        icon={Music}
        onChange={onBgmEnabledChange}
      />

      <ChannelToggle
        enabled={sfxEnabled}
        shortName={audioContent.sfx.shortName}
        ariaOn={audioContent.sfx.ariaOn}
        ariaOff={audioContent.sfx.ariaOff}
        icon={Volume2}
        onChange={onSfxEnabledChange}
      />
    </div>
  )
}
