/**
 * 公开资源路径（A01）。
 *
 * `public/` 下的文件不经过 Vite 的资源处理，运行时必须自己拼上 base：
 * 开发时 base 是 `/`，部署到 GitHub Pages 子路径时是 `/<repo>/`。
 * 写死 `/audio/...` 在子路径部署下会 404，写 `./audio/...` 又会跟着当前页面路径漂移。
 *
 * 拼接本身是纯函数，便于测试；只有 `publicAssetUrl` 读环境变量。
 */

/**
 * 把相对资源路径接到 base 后面。
 *
 * base 缺少结尾斜杠、资源路径带开头斜杠都能正确处理，不会拼出 `//` 或漏掉分隔符。
 */
export function joinPublicPath(base: string, relativePath: string): string {
  const normalizedBase = base === '' ? '/' : base.endsWith('/') ? base : `${base}/`
  const normalizedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath

  return `${normalizedBase}${normalizedPath}`
}

/** 读取当前构建的 base 并拼出可用的运行时 URL。 */
export function publicAssetUrl(relativePath: string): string {
  const base = import.meta.env?.BASE_URL

  return joinPublicPath(typeof base === 'string' ? base : '/', relativePath)
}
