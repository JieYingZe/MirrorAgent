import type { SfxKey } from '../../types/audio'

/**
 * 界面动作 → 音效（A03）。
 *
 * 业务层说的是「发生了哪个动作」，由这里决定该响什么、要不要响。
 * 好处有三个：
 *
 * 1. 全项目的按钮清单只有这一张表，加按钮时不会漏、也不会为了覆盖率
 *    给每一个小控件都机械配一个声音；
 * 2. 「剧情选项只播 choice_select、绝不同时播普通 click」是一条可测的映射，
 *    而不是散落在若干个事件处理器里的约定；
 * 3. 静音按钮这种需要特殊处理的控件，把「为什么这样」写在映射旁边，
 *    不必在页面组件里解释。
 *
 * 这张表不负责「这次动作有没有被接受」。disabled 按钮、被逻辑拒绝的操作
 * （没有存档时的继续、已上锁的重复提交）根本不会走到调用点 ——
 * 调用点一律放在各个 handler 的前置校验之后，见 App.tsx。
 */

export type SfxAction =
  /** 启动遮罩的「点击进入实验」。 */
  | 'gate_enter'
  /** 开始初始化 / 重新初始化（开始页与结局页共用同一个流程）。 */
  | 'start_new_run'
  /** 继续实验：恢复已通过校验的存档。 */
  | 'resume_run'
  /** 数据错误页返回开始页。 */
  | 'exit_to_start'
  /** 剧情页的「继续」「查看镜像报告」，以及读完选项回应后的继续。 */
  | 'continue_reading'
  /** 一次真正生效的剧情选择（普通、探索、关键、最终选择都用它）。 */
  | 'select_choice'
  /** 自动播放开关。 */
  | 'toggle_autoplay'
  /** 背景音乐开关（开或关都一样）：它是普通操作按钮，不依赖 BGM 自己的反馈。 */
  | 'toggle_bgm'
  /** 点击关闭音效，即将进入无音效态。 */
  | 'sfx_off'
  /** 点击开启音效，已经回到有音效态。 */
  | 'sfx_on'

/**
 * 动作与音效的完整映射。null 表示这个动作刻意不发声。
 *
 * 两处刻意的例外：
 *
 * - `select_choice` 走 `choice_select` 而不是 `click_soft`。选项按钮在 ChoiceList
 *   里就 stopPropagation，提交走的是独立的 handler，因此两种声音不会叠在一起。
 *   第四章的选项同样走这里：warning 表达的是「进入异常接管状态」，
 *   不是普通的选择确认，反复播放只会削弱语义并打扰阅读。
 * - `sfx_off` 不发声。点击「关闭音效」的那一刻短音效正要全部停下，
 *   再补一声点击要么被立刻掐断成拖尾，要么变成无音效态里残留的一响；
 *   反过来 `sfx_on` 给一声轻点击，是「音效回来了」的确认，
 *   此时通道状态已经先一步应用（见 sfxPlayer.setMuted），不存在状态倒置。
 * - `toggle_bgm` 两个方向都发声。它是一个普通操作按钮，
 *   而且刻意不依赖 BGM 自己的起停作为反馈 —— 关掉背景音乐时如果一点声音都没有，
 *   玩家无法确认这次点击是不是生效了。前提是音效通道本身开着；
 *   音效关掉时它自然也不响，那是玩家自己的选择。
 */
export const SFX_ACTION_MAP: Record<SfxAction, SfxKey | null> = {
  gate_enter: 'click_soft',
  start_new_run: 'click_soft',
  resume_run: 'click_soft',
  exit_to_start: 'click_soft',
  continue_reading: 'click_soft',
  select_choice: 'choice_select',
  toggle_autoplay: 'click_soft',
  toggle_bgm: 'click_soft',
  sfx_off: null,
  sfx_on: 'click_soft',
}

export function resolveActionSfx(action: SfxAction): SfxKey | null {
  return SFX_ACTION_MAP[action] ?? null
}

/** 供测试与文档使用的完整清单，运行时不需要遍历。 */
export const SFX_ACTIONS = Object.keys(SFX_ACTION_MAP) as SfxAction[]
