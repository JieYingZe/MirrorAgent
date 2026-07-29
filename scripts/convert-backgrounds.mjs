#!/usr/bin/env node
/**
 * 背景素材转换：把源图（PNG 等）转成运行时使用的 WebP。
 *
 * 用法：
 *   npm run assets:convert -- <源文件> [目标文件] [--quality 100]
 *
 * 不给目标文件时，输出到**源文件所在目录**，同名换成 `.webp`：
 *   npm run assets:convert -- src/assets/backgrounds/desktop/bg-prologue.png
 *   → src/assets/backgrounds/desktop/bg-prologue.webp
 *
 * 转换完成后源 PNG 由人工决定是删掉还是移出仓库，脚本不动它。
 *
 * 约定：
 * - 只做格式转换，不缩放、不裁切、不锐化、不调色；
 * - 默认 quality 100（近无损），需要时可以显式覆盖；
 * - 目标目录不存在会自动创建；
 * - 转换完成后回读输出文件，确认能解码且宽高与源图一致。
 *
 * 这个脚本是通用工具，不绑定任何一张具体的图。运行时背景资源清单见
 * docs/05-assets-map.md §3，代码里的映射在 src/data/visualScenes.ts。
 */

import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const DEFAULT_QUALITY = 100

function fail(message) {
  console.error(`[convert-backgrounds] ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const positional = []
  let quality = DEFAULT_QUALITY

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--quality' || arg === '-q') {
      const raw = argv[++i]
      const parsed = Number(raw)

      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        fail(`--quality 需要 1–100 的整数，收到：${raw}`)
      }

      quality = parsed
      continue
    }

    if (arg.startsWith('--quality=')) {
      const parsed = Number(arg.slice('--quality='.length))

      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        fail(`--quality 需要 1–100 的整数，收到：${arg}`)
      }

      quality = parsed
      continue
    }

    positional.push(arg)
  }

  return { positional, quality }
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`
}

/** 同目录、同文件名、扩展名换成 .webp。 */
function defaultTarget(source) {
  const parsed = path.parse(source)

  return path.join(parsed.dir, `${parsed.name}.webp`)
}

async function main() {
  const { positional, quality } = parseArgs(process.argv.slice(2))

  if (positional.length < 1 || positional.length > 2) {
    fail(
      '用法：<源文件> [目标文件] [--quality 100]\n' +
        '  例：npm run assets:convert -- src/assets/backgrounds/desktop/bg-prologue.png\n' +
        '  不给目标文件时输出到源文件所在目录，同名 .webp。',
    )
  }

  const [sourceArg, targetArg] = positional
  const source = path.resolve(sourceArg)
  const target = path.resolve(targetArg ?? defaultTarget(sourceArg))

  if (source === target) {
    fail('源文件与目标文件不能是同一个路径。')
  }

  let sourceStat
  try {
    sourceStat = await stat(source)
  } catch {
    fail(`源文件不存在：${sourceArg}`)
  }

  if (!sourceStat.isFile()) {
    fail(`源路径不是文件：${sourceArg}`)
  }

  const sourceMeta = await sharp(source).metadata()

  await mkdir(path.dirname(target), { recursive: true })

  // 只转格式：不调用 resize / sharpen / modulate 等任何会改变画面的操作。
  await sharp(source).webp({ quality, effort: 6 }).toFile(target)

  // 回读输出，确认能解码且尺寸没变。
  const targetMeta = await sharp(target).metadata()
  const targetStat = await stat(target)

  if (targetMeta.width !== sourceMeta.width || targetMeta.height !== sourceMeta.height) {
    fail(
      `输出尺寸与源图不一致：${sourceMeta.width}×${sourceMeta.height} → ` +
        `${targetMeta.width}×${targetMeta.height}`,
    )
  }

  const targetDisplay = path.relative(process.cwd(), target).split(path.sep).join('/')

  console.log('[convert-backgrounds] 完成')
  console.log(`  源文件  ${sourceArg}`)
  console.log(
    `          ${sourceMeta.format} ${sourceMeta.width}×${sourceMeta.height} ${formatBytes(sourceStat.size)}`,
  )
  console.log(`  目标    ${targetDisplay}`)
  console.log(
    `          ${targetMeta.format} ${targetMeta.width}×${targetMeta.height} ${formatBytes(targetStat.size)}`,
  )
  console.log(`  quality ${quality}`)
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
