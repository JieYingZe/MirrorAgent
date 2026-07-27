import { STAT_KEYS } from './initialGameState'

/**
 * 开发期剧情数据完整性检查。
 *
 * 只做结构校验，不引入 schema 库；返回人类可读的错误列表，空列表表示数据可用。
 * 生产构建中不调用（见 story.ts）。
 */
export function validateStoryData(raw: unknown): string[] {
  const errors: string[] = []

  if (!isPlainObject(raw)) {
    return ['story.json 的 chapters 必须是一个对象。']
  }

  const entries = Object.entries(raw)
  if (entries.length === 0) {
    return ['story.json 中没有任何章节。']
  }

  const chapterIds = new Set<string>()

  for (const [key, value] of entries) {
    if (!isPlainObject(value)) {
      errors.push(`章节 ${key}：必须是一个对象。`)
      continue
    }

    // 章节 ID 唯一，且对象 key 与章节自身 id 一致。
    if (typeof value.id !== 'string' || value.id.length === 0) {
      errors.push(`章节 ${key}：缺少字符串类型的 id。`)
    } else if (value.id !== key) {
      errors.push(`章节 ${key}：对象 key 与自身 id（${value.id}）不一致。`)
    } else if (chapterIds.has(value.id)) {
      errors.push(`章节 ${key}：章节 id 重复。`)
    } else {
      chapterIds.add(value.id)
    }

    if (typeof value.order !== 'number') {
      errors.push(`章节 ${key}：order 必须是数字。`)
    }

    for (const field of ['phaseLabel', 'progressLabel', 'title'] as const) {
      if (typeof value[field] !== 'string' || (value[field] as string).length === 0) {
        errors.push(`章节 ${key}：${field} 必须是非空字符串。`)
      }
    }

    if (!Array.isArray(value.paragraphs) || value.paragraphs.length === 0) {
      errors.push(`章节 ${key}：paragraphs 不能为空。`)
    } else if (value.paragraphs.some((p) => typeof p !== 'string' || p.length === 0)) {
      errors.push(`章节 ${key}：paragraphs 中存在非字符串或空段落。`)
    }

    if (!Array.isArray(value.choices) || value.choices.length === 0) {
      errors.push(`章节 ${key}：choices 不能为空。`)
      continue
    }

    const choiceIds = new Set<string>()

    value.choices.forEach((choice, index) => {
      const where = `章节 ${key} 的第 ${index + 1} 个选项`

      if (!isPlainObject(choice)) {
        errors.push(`${where}：必须是一个对象。`)
        return
      }

      if (typeof choice.id !== 'string' || choice.id.length === 0) {
        errors.push(`${where}：缺少字符串类型的 id。`)
      } else if (choiceIds.has(choice.id)) {
        errors.push(`${where}：选项 id ${choice.id} 在同一章节内重复。`)
      } else {
        choiceIds.add(choice.id)
      }

      if (typeof choice.text !== 'string' || choice.text.length === 0) {
        errors.push(`${where}：text 必须是非空字符串。`)
      }

      // effects 中不能出现四个核心变量以外的字段。
      if (!isPlainObject(choice.effects)) {
        errors.push(`${where}：effects 必须是一个对象。`)
      } else {
        for (const [statKey, delta] of Object.entries(choice.effects)) {
          if (!STAT_KEYS.includes(statKey as never)) {
            errors.push(`${where}：effects 中出现未知变量 ${statKey}。`)
          } else if (typeof delta !== 'number' || !Number.isFinite(delta)) {
            errors.push(`${where}：effects.${statKey} 必须是有限数字。`)
          }
        }
      }

      const endsGame = choice.endsGame === true
      const nextChapterId = choice.nextChapterId

      if (endsGame) {
        // 结束选项不应再依赖一个不存在的下一章节。
        if (nextChapterId !== undefined && !isKnownChapter(raw, nextChapterId)) {
          errors.push(`${where}：结束选项声明了不存在的 nextChapterId（${String(nextChapterId)}）。`)
        }
      } else if (typeof nextChapterId !== 'string' || nextChapterId.length === 0) {
        errors.push(`${where}：非结束选项必须提供 nextChapterId。`)
      } else if (!isKnownChapter(raw, nextChapterId)) {
        errors.push(`${where}：nextChapterId 指向不存在的章节 ${nextChapterId}。`)
      }
    })
  }

  return errors
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isKnownChapter(chapters: Record<string, unknown>, id: unknown): boolean {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(chapters, id)
}
