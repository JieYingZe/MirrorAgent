import { useEffect, useState } from 'react'
import { startupGateContent } from '../../data/uiContent'

type StartupGateProps = {
  /** 点击「启动实验」：按当前音频偏好解锁音频并关闭遮罩，不读写剧情存档。 */
  onEnter: () => void
  /** 点击「静默启动」：把 BGM 与 SFX 都设为关闭，不解锁音频，直接关闭遮罩。 */
  onSilentStart: () => void
}

/**
 * 启动遮罩（A01）。
 *
 * 应用级覆盖层，不是第四个核心业务页面：它只负责拿到一次用户手势，
 * 让浏览器允许播放有声音频，然后就消失。整个页面生命周期里只出现一次。
 *
 * 遮罩显示期间业务页面被 `inert` 关掉（见 App），因此下面的按钮既点不到也 Tab 不到，
 * 屏幕阅读器也只会读到这一层，符合 `aria-modal` 的语义。
 *
 * 「点击进入实验」与 StartPage 的「开始初始化／继续实验」是两个独立动作，
 * 这里不碰任何剧情状态。
 */
export function StartupGate({ onEnter, onSilentStart }: StartupGateProps) {
  /*
    自动聚焦留下的那一圈焦点描边。

    浏览器把 autoFocus 当成键盘焦点，页面一打开就在按钮外面画一圈亮环，
    可这时玩家还没碰过键盘，那圈只是噪点。所以先把描边压掉，
    等真的按下任意一个键（说明确实在用键盘）再恢复。

    压掉的只有描边这一层：聚焦时按钮的边框与底色仍然会提亮，焦点位置一直看得见。
    鼠标点击不需要恢复 —— 点击本来就不匹配 :focus-visible，不会画环。
  */
  const [keyboardUsed, setKeyboardUsed] = useState(false)

  useEffect(() => {
    if (keyboardUsed) return

    const handleKeyDown = () => setKeyboardUsed(true)

    window.addEventListener('keydown', handleKeyDown, { once: true })

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyboardUsed])

  return (
    <div
      className="startup-gate"
      data-focus-ring={keyboardUsed ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="startup-gate-title"
    >
      <div className="startup-gate__inner">
        <p id="startup-gate-title" className="startup-gate__title">
          {startupGateContent.title}
        </p>

        {/*
          两个按钮同一种形状（与开始页同族的圆角、字距与深色底，遮罩上不发光、不带图标），
          「启动实验」再单独提一档亮度：它是这一页的默认路径，静默启动是让路的那一个。
        */}
        <div className="startup-gate__actions">
          <button
            type="button"
            className="button startup-gate__action startup-gate__action--primary"
            // 遮罩是这一刻唯一可操作的东西，键盘用户不该先 Tab 一次才能进入。
            autoFocus
            onClick={onEnter}
          >
            {startupGateContent.action}
          </button>

          <button
            type="button"
            className="button startup-gate__action"
            onClick={onSilentStart}
          >
            {startupGateContent.silentAction}
          </button>
        </div>

        <p className="startup-gate__hint">{startupGateContent.hint}</p>
      </div>
    </div>
  )
}
