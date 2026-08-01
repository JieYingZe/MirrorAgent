import type { ReadingRevealEvent } from '../story/readingReveal'

/**
 * 打字机音效的触发策略（A03）。
 *
 * 纯函数与纯状态，不认识 React、timer、DOM 和 Audio。它做的唯一一件事是：
 * 拿到一次已经发生的揭示事件，回答「这次要不要响一下」。
 *
 * 为什么不是每个字符响一次：
 * 正文速度是 18–32ms 一个字素，逐字响会变成一段连续的机械噪声，
 * 而且素材本身就是一段真实的连续打字，叠起来只会更糊。因此这里按
 * 「累计字素数 + 最小间隔」抽样，让打字声听起来像有人在旁边打字，
 * 而不是屏幕在滋滋作响。
 *
 * 三条不响的规则，全部由 `cause` 决定，与具体参数无关：
 * - 只有 `tick`（按揭示计划走出来的一步）才可能发声；
 * - 补全当前块、看完整段、关自动播放刹车、减少动态模式的立即完整显示，
 *   都属于「一次跨过一段内容」，绝不为被跳过的字符补声；
 * - 进入新的一块本身不发声，随后的逐字步骤才会。
 *
 * 限频状态跟着展示序列走：`sequenceKey` 一变就整份重置，
 * 因此节点切换、responseStage 切换都不会把上一段的累计带过来。
 */

/**
 * 抽样参数。
 *
 * 集中在这里，不散落到 hook 或组件里；调整听感只需要改这三个数字。
 *
 * 按 22ms/字素的普通正文估算：每 6 个字素约 132ms，被 160ms 的最小间隔进一步
 * 压到大约每秒 6 次以内。素材被截成 110ms 一次击键（见 data/audioTracks.ts 的
 * `maxDurationMs`），因此相邻两次几乎不重叠，快速揭示时也不会连成噪声。
 */
export const TYPING_SFX_POLICY = {
  /** chars 模式：累计揭示这么多字素才允许响一次。 */
  graphemesPerSound: 6,
  /** chars 模式两次打字声之间的最小间隔。 */
  charsMinIntervalMs: 160,
  /**
   * units 模式两次打字声之间的最小间隔。
   *
   * 明显大于逐字模式：system / record / message / document 是整行揭示，
   * 每行 180ms，若每行都响会变成一串密集的敲击。450ms 意味着大约每两三行
   * 才有一次，听感上只是「面板在往下写」。
   */
  unitsMinIntervalMs: 450,
} as const

export type TypingSfxState = {
  /** chars 模式下累计但还没换成一次声音的字素数。 */
  pendingGraphemes: number
  /** 上一次真正发声的时刻。 */
  lastPlayedAt: number
  /** 当前限频状态属于哪个展示序列。 */
  sequenceKey: string | null
}

export type TypingSfxDecision = {
  state: TypingSfxState
  play: boolean
}

export function createTypingSfxState(): TypingSfxState {
  return { pendingGraphemes: 0, lastPlayedAt: Number.NEGATIVE_INFINITY, sequenceKey: null }
}

/**
 * 这次揭示要不要响。
 *
 * `now` 由调用方传入（运行时是 `Date.now()`，测试里是可控的数字），
 * 这样整个策略是可确定复现的纯函数。
 */
export function decideTypingSfx(
  state: TypingSfxState,
  event: ReadingRevealEvent,
  now: number,
): TypingSfxDecision {
  // 换了展示序列：上一段的累计与间隔一律作废，不带进新序列。
  const base: TypingSfxState =
    state.sequenceKey === event.sequenceKey
      ? state
      : { ...createTypingSfxState(), sequenceKey: event.sequenceKey }

  // 被跳过的内容不补声；进入新块本身也不发声。
  if (event.cause !== 'tick') {
    return { state: { ...base, pendingGraphemes: 0 }, play: false }
  }

  if (event.mode === 'instant' || event.delta <= 0) {
    return { state: base, play: false }
  }

  if (event.mode === 'units') {
    if (now - base.lastPlayedAt < TYPING_SFX_POLICY.unitsMinIntervalMs) {
      return { state: base, play: false }
    }

    return { state: { ...base, pendingGraphemes: 0, lastPlayedAt: now }, play: true }
  }

  // 累计上限就是阈值本身：揭示得再快，也只是「够响一次」，不会攒出一串补播。
  const pending = Math.min(
    base.pendingGraphemes + event.delta,
    TYPING_SFX_POLICY.graphemesPerSound,
  )

  if (pending < TYPING_SFX_POLICY.graphemesPerSound) {
    return { state: { ...base, pendingGraphemes: pending }, play: false }
  }

  if (now - base.lastPlayedAt < TYPING_SFX_POLICY.charsMinIntervalMs) {
    // 攒够了但离上一次太近：保留累计，等间隔到了再响，绝不在这里补一串。
    return { state: { ...base, pendingGraphemes: pending }, play: false }
  }

  return { state: { ...base, pendingGraphemes: 0, lastPlayedAt: now }, play: true }
}
