/**
 * 本地用户偏好（I01 验收修订）。
 *
 * 与 I03 的剧情存档完全分开：不同的 key、不同的模块、不同的生命周期。
 * 偏好描述的是「这个人喜欢怎么读」，不是「这一轮玩到哪了」，
 * 因此重新初始化剧情、通关后开新一轮都不会清除它。
 *
 * 本阶段只有 autoplayEnabled 一个字段。音频偏好（静音、音量）属于 A01，
 * 以后可以扩展同一个模块，但现在不提前加字段。
 *
 * 任何一步失败都只影响「能不能记住偏好」，不会影响读剧情：
 * 读取 localStorage 属性本身、getItem、setItem、JSON 解析都各自容错。
 * 这里刻意不复用 storySave.ts 的私有 storage 工具，避免为了共享几行代码
 * 去改动已经验收过的 I03 模块。
 */

export const USER_PREFERENCES_KEY = 'mirror-agent:user-preferences'

export type UserPreferences = {
  version: 1
  /** 当前 block 显示完后是否自动进入下一个 block。默认关闭。 */
  autoplayEnabled: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  version: 1,
  autoplayEnabled: false,
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

/**
 * 把任意输入收敛成一份可用偏好。
 *
 * 逐字段校验并与默认值合并：缺字段用默认值，类型不对忽略该值，多余字段丢弃。
 * 版本号不认识时也只是回落到「只取认得的字段」，不会把整份偏好判死。
 */
export function normalizeUserPreferences(raw: unknown): UserPreferences {
  if (!isRecord(raw)) return { ...DEFAULT_USER_PREFERENCES }

  return {
    version: 1,
    autoplayEnabled:
      typeof raw.autoplayEnabled === 'boolean'
        ? raw.autoplayEnabled
        : DEFAULT_USER_PREFERENCES.autoplayEnabled,
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

/** 保存偏好。失败只返回 false，不抛错、不阻断游玩。 */
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
