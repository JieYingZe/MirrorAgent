import { DEFAULT_MASTER_VOLUME } from '../data/audioTracks'

/**
 * 本地用户偏好（I01 建立，A01 扩展，A03 修订）。
 *
 * 与 I03 的剧情存档完全分开：不同的 key、不同的模块、不同的生命周期。
 * 偏好描述的是「这个人喜欢怎么读、要不要有声音」，不是「这一轮玩到哪了」，
 * 因此重新初始化剧情、通关后开新一轮都不会清除它。
 *
 * 当前字段：
 * - `autoplayEnabled`：阅读自动播放（I01），默认关闭；
 * - `bgmMuted`：背景音乐是否关闭（A03 修订），默认有声；
 * - `sfxMuted`：交互音效是否关闭（A03 修订），默认有声；
 * - `masterVolume`：主音量（A01），默认值集中定义在 data/audioTracks.ts。
 *
 * 为什么拆成两个字段（A03 试玩修订）：
 * 原来只有一个 `muted`，玩家要么全有声要么全静音。实际试玩里这两类声音的
 * 取舍是独立的 —— 有人想留着按钮和选择的反馈但不要背景音乐，也有人相反。
 * 因此拆成两个语义明确的开关，并且**不**再保留第三个「全部静音」总开关：
 * 三个状态之间会产生同步成本，而两个独立开关已经能表达全部四种组合。
 *
 * 版本升级策略（A01 建立，A03 沿用）：
 * `version` 只记录「写入时是哪一版结构」，读取一律逐字段校验后与默认值合并。
 * A03 的迁移就落在 `readChannelMuted` 上：新字段缺失时回落到旧的 `muted`，
 * 旧的 `muted` 也没有才用默认值。因此
 * - v1（只有 autoplayEnabled）→ 两个通道都有声；
 * - v2 `muted: true` → 两个通道都关闭；
 * - v2 `muted: false` → 两个通道都开启；
 * - v3 → 原样读取。
 * 三种情况下 `autoplayEnabled` 与 `masterVolume` 都原样保留，不会因为版本变化被重置。
 * 版本号更高（来自未来版本或被人手改过）时同样按字段回收，不整份判死。
 *
 * 写入必须整份写：全项目只有一个写入口（hooks/useUserPreferences.ts），
 * 任何一处只写一个字段都会把别的偏好抹掉。写回时旧的 `muted` 字段会自然消失
 * （normalize 只输出当前结构），因此迁移是一次性的，不会两份状态长期并存。
 *
 * 任何一步失败都只影响「能不能记住偏好」，不会影响读剧情，也不会影响听不听得到声音：
 * 读取 localStorage 属性本身、getItem、setItem、JSON 解析都各自容错。
 * 这里刻意不复用 storySave.ts 的私有 storage 工具，避免为了共享几行代码
 * 去改动已经验收过的 I03 模块。
 */

export const USER_PREFERENCES_KEY = 'mirror-agent:user-preferences'

/**
 * 当前结构版本。
 *
 * v1 只有 autoplayEnabled；v2 加入 `muted` / `masterVolume`；
 * v3 把单一的 `muted` 拆成 `bgmMuted` / `sfxMuted`。
 */
export const USER_PREFERENCES_VERSION = 3

export type UserPreferences = {
  version: typeof USER_PREFERENCES_VERSION
  /** 当前 block 显示完后是否自动进入下一个 block。默认关闭。 */
  autoplayEnabled: boolean
  /** 关闭背景音乐。默认有声；关闭时 BGM 立即停止。只影响 BGM。 */
  bgmMuted: boolean
  /** 关闭交互音效。默认有声；关闭时短音效立即停止并丢弃后续触发。只影响 SFX。 */
  sfxMuted: boolean
  /** 主音量，0–1。两类音频共用。本轮没有音量 UI，实际值就是默认值。 */
  masterVolume: number
}

/** 只允许改这三个字段；version 由本模块自己维护。 */
export type UserPreferencesPatch = Partial<Omit<UserPreferences, 'version'>>

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  version: USER_PREFERENCES_VERSION,
  autoplayEnabled: false,
  bgmMuted: false,
  sfxMuted: false,
  masterVolume: DEFAULT_MASTER_VOLUME,
}

type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

let warnedAboutStorage = false

function warnOnce(detail: string) {
  if (warnedAboutStorage) return
  warnedAboutStorage = true
  console.warn(`[preferences] 本地偏好不可用，本次会话不保存：${detail}`)
}

/** 不在模块顶层访问：隐私模式或被策略禁用时，读取这个属性本身就会抛错。 */
function getStorage(): StorageLike | null {
  try {
    const candidate = (globalThis as { localStorage?: StorageLike | null }).localStorage

    if (!candidate) return null
    if (typeof candidate.getItem !== 'function' || typeof candidate.setItem !== 'function') {
      return null
    }

    return candidate
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

/**
 * 音量只接受有限数字，并夹到 0–1。
 *
 * 夹取而不是判死：超出区间大多来自手改或未来版本的不同刻度，
 * 落到边界仍然是一个合理的可用值；NaN / Infinity / 非数字才回落默认。
 */
function readVolume(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback

  return Math.min(1, Math.max(0, value))
}

/**
 * 读取一个音频通道的关闭状态，并顺带完成 v2 → v3 的迁移。
 *
 * 回落顺序是「新字段 → 旧的单一 muted → 默认值」。写成一条回落链而不是一个
 * migrate 函数，是因为它同时覆盖了三种情况：正常的 v3 偏好、需要迁移的 v2 偏好、
 * 以及只坏了其中一个字段的半损坏偏好（另一个字段仍然按同样的规则各自恢复）。
 */
function readChannelMuted(raw: Record<string, unknown>, key: 'bgmMuted' | 'sfxMuted'): boolean {
  const legacy = readBoolean(raw.muted, DEFAULT_USER_PREFERENCES[key])

  return readBoolean(raw[key], legacy)
}

/**
 * 把任意输入收敛成一份可用偏好。
 *
 * 逐字段校验并与默认值合并：缺字段用默认值（这同时就是旧版本升级），
 * 类型不对忽略该值，多余字段丢弃，输出的 version 永远是当前版本。
 * 旧的 `muted` 只在读取时被消费一次，不会出现在输出里，因此下一次写回之后
 * 存储里就只剩当前结构，两份状态不会长期并存。
 */
export function normalizeUserPreferences(raw: unknown): UserPreferences {
  if (!isRecord(raw)) return { ...DEFAULT_USER_PREFERENCES }

  return {
    version: USER_PREFERENCES_VERSION,
    autoplayEnabled: readBoolean(raw.autoplayEnabled, DEFAULT_USER_PREFERENCES.autoplayEnabled),
    bgmMuted: readChannelMuted(raw, 'bgmMuted'),
    sfxMuted: readChannelMuted(raw, 'sfxMuted'),
    masterVolume: readVolume(raw.masterVolume, DEFAULT_USER_PREFERENCES.masterVolume),
  }
}

/** 读取偏好。storage 不可用、JSON 损坏、结构异常一律回落到默认值。 */
export function loadUserPreferences(): UserPreferences {
  const storage = getStorage()

  if (!storage) return { ...DEFAULT_USER_PREFERENCES }

  let raw: string | null

  try {
    raw = storage.getItem(USER_PREFERENCES_KEY)
  } catch {
    return { ...DEFAULT_USER_PREFERENCES }
  }

  if (raw === null || raw === undefined) return { ...DEFAULT_USER_PREFERENCES }

  try {
    return normalizeUserPreferences(JSON.parse(raw))
  } catch {
    // 损坏的偏好不影响剧情存档，直接按默认值继续。
    return { ...DEFAULT_USER_PREFERENCES }
  }
}

/** 保存偏好。失败只返回 false，不抛错、不阻断游玩，也不影响当前会话的声音。 */
export function saveUserPreferences(preferences: UserPreferences): boolean {
  const storage = getStorage()

  if (!storage) {
    warnOnce('localStorage 不可用。')
    return false
  }

  try {
    storage.setItem(USER_PREFERENCES_KEY, JSON.stringify(normalizeUserPreferences(preferences)))
    return true
  } catch (error) {
    warnOnce(error instanceof Error ? error.message : String(error))
    return false
  }
}
