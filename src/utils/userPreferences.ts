import { DEFAULT_MASTER_VOLUME } from '../data/audioTracks'

/**
 * 本地用户偏好（I01 建立，A01 扩展）。
 *
 * 与 I03 的剧情存档完全分开：不同的 key、不同的模块、不同的生命周期。
 * 偏好描述的是「这个人喜欢怎么读、要不要有声音」，不是「这一轮玩到哪了」，
 * 因此重新初始化剧情、通关后开新一轮都不会清除它。
 *
 * 当前字段：
 * - `autoplayEnabled`：阅读自动播放（I01），默认关闭；
 * - `muted`：全局静音（A01），默认有声；
 * - `masterVolume`：主音量（A01），默认值集中定义在 data/audioTracks.ts。
 *
 * 版本升级策略（A01）：
 * `version` 只记录「写入时是哪一版结构」，读取一律逐字段校验后与默认值合并，
 * 因此升级不需要一串 migrate 函数 —— v1 的偏好里没有音频字段，读出来就是
 * 「保留原来的 autoplayEnabled + 音频取默认值」，这正是期望的升级结果。
 * 版本号更高（来自未来版本或被人手改过）时同样按字段回收，不整份判死。
 *
 * 写入必须整份写：全项目只有一个写入口（hooks/useUserPreferences.ts），
 * 任何一处只写一个字段都会把别的偏好抹掉。
 *
 * 任何一步失败都只影响「能不能记住偏好」，不会影响读剧情，也不会影响听不听得到声音：
 * 读取 localStorage 属性本身、getItem、setItem、JSON 解析都各自容错。
 * 这里刻意不复用 storySave.ts 的私有 storage 工具，避免为了共享几行代码
 * 去改动已经验收过的 I03 模块。
 */

export const USER_PREFERENCES_KEY = 'mirror-agent:user-preferences'

/** 当前结构版本。v1 只有 autoplayEnabled，v2 起加入音频偏好。 */
export const USER_PREFERENCES_VERSION = 2

export type UserPreferences = {
  version: typeof USER_PREFERENCES_VERSION
  /** 当前 block 显示完后是否自动进入下一个 block。默认关闭。 */
  autoplayEnabled: boolean
  /** 全局静音。默认有声；静音时 BGM 立即停止。 */
  muted: boolean
  /** 主音量，0–1。本轮没有音量 UI，实际值就是默认值。 */
  masterVolume: number
}

/** 只允许改这三个字段；version 由本模块自己维护。 */
export type UserPreferencesPatch = Partial<Omit<UserPreferences, 'version'>>

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  version: USER_PREFERENCES_VERSION,
  autoplayEnabled: false,
  muted: false,
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
 * 把任意输入收敛成一份可用偏好。
 *
 * 逐字段校验并与默认值合并：缺字段用默认值（这同时就是旧版本升级），
 * 类型不对忽略该值，多余字段丢弃，输出的 version 永远是当前版本。
 */
export function normalizeUserPreferences(raw: unknown): UserPreferences {
  if (!isRecord(raw)) return { ...DEFAULT_USER_PREFERENCES }

  return {
    version: USER_PREFERENCES_VERSION,
    autoplayEnabled: readBoolean(raw.autoplayEnabled, DEFAULT_USER_PREFERENCES.autoplayEnabled),
    muted: readBoolean(raw.muted, DEFAULT_USER_PREFERENCES.muted),
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
