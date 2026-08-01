/**
 * 一次性音效的触发判定（A03）。
 *
 * 第四章的失控模式警告与结局揭示都是「进入某个场景时响一次」。
 * 这类语义最容易出错的地方不是播放，而是判定：React 会因为状态面板更新、
 * 打字揭示、自动播放切换、Strict Mode 的重复 effect 反复重新执行同一段代码，
 * 稍不小心就会重复播放。
 *
 * 因此这里把判定拆成两个纯粹的部分：
 * - 「现在算不算在这个场景里」：只看数据，不看历史（`shouldPlayControlWarning`）；
 * - 「这个场景我响过了没有」：一个只认上升沿的小闸门（`stepOneShotGate`）。
 *
 * 两者都是纯函数，可以直接按一串输入回放整轮游戏来验证，不需要渲染任何组件。
 */

/**
 * 第四章失控模式的入口节点。
 *
 * 与 `docs/05-assets-map.md` §6.2 里 `bgm-control-mode` 的切入边界是同一个节点：
 * 警告音与失控模式 BGM 在同一刻开始，玩家听到的是一次完整的场景切换，
 * 而不是两个先后到达的提示。节点 ID 只写在这一处，不散落到组件里；
 * 它是否仍然存在由 tests/sfxTriggers.test.ts 对着剧情索引校验。
 */
export const CONTROL_WARNING_NODE_ID = 'ch4.protection_protocol'

/**
 * 当前显示的节点是否处于「刚进入失控模式警告场景」的状态。
 *
 * 只认入口节点本身：第四章内部后续的普通节点、分支结果、汇流节点都不算，
 * 因此同一个 control 场景里换节点不会再响；进入第五章之后自然为 false。
 *
 * `restoredNodeId` 是本次会话「从存档恢复时停在的那个节点」。刷新后恢复到
 * 入口节点上**不**播放警告，理由是这个音效表达的是「进入警告场景」，
 * 而恢复存档的玩家并没有进入，他本来就在里面；何况在这个节点上每刷新一次
 * 就惊一次，属于重复惊扰。真正走剧情进来时 `restoredNodeId` 不等于入口节点，
 * 警告照常响一次；重新初始化后再玩到这里也照常响（那时 `restoredNodeId` 是 null）。
 */
export function shouldPlayControlWarning(
  nodeId: string,
  restoredNodeId: string | null,
): boolean {
  if (nodeId !== CONTROL_WARNING_NODE_ID) return false

  return nodeId !== restoredNodeId
}

/**
 * 只认上升沿的一次性闸门。
 *
 * `fired` 记录「当前这一段 active 期间已经触发过了」。active 一直为 true 时
 * 重复调用不会再触发（rerender、Strict Mode 的重复 effect 都落在这里），
 * active 回到 false 时闸门重新装填（重新初始化后再次通关可以再响一次）。
 */
export type OneShotGate = { fired: boolean }

export function createOneShotGate(): OneShotGate {
  return { fired: false }
}

export function stepOneShotGate(
  gate: OneShotGate,
  active: boolean,
): { gate: OneShotGate; fire: boolean } {
  if (!active) return { gate: gate.fired ? { fired: false } : gate, fire: false }
  if (gate.fired) return { gate, fire: false }

  return { gate: { fired: true }, fire: true }
}
