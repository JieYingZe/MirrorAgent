import { startupGateContent } from '../../data/uiContent'

type StartupGateProps = {
  /** 点击「点击进入实验」：解锁音频并关闭遮罩，不读写剧情存档。 */
  onEnter: () => void
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
export function StartupGate({ onEnter }: StartupGateProps) {
  return (
    <div
      className="startup-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="startup-gate-title"
    >
      <div className="startup-gate__inner">
        <p id="startup-gate-title" className="startup-gate__title">
          {startupGateContent.title}
        </p>

        <button
          type="button"
          className="button button--primary startup-gate__action"
          // 遮罩是这一刻唯一可操作的东西，键盘用户不该先 Tab 一次才能进入。
          autoFocus
          onClick={onEnter}
        >
          {startupGateContent.action}
        </button>

        <p className="startup-gate__hint">{startupGateContent.hint}</p>
      </div>
    </div>
  )
}
