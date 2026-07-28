import { validateStory } from '../src/utils/story/validateStory'

/**
 * 剧情数据验证入口：npm run validate:story
 *
 * 通过 tsx 直接运行 TypeScript，不引入测试框架。
 * 有 error 时以退出码 1 结束，warning 只提示不阻断。
 */

const report = validateStory()

console.log('=== 剧情图结构报告 ===')
for (const line of report.summary) {
  console.log(`  ${line}`)
}

if (report.warnings.length > 0) {
  console.log('')
  console.log(`=== 警告（${report.warnings.length}）===`)
  for (const line of report.warnings) {
    console.warn(`  ! ${line}`)
  }
}

console.log('')

if (report.errors.length > 0) {
  console.error(`=== 错误（${report.errors.length}）===`)
  for (const line of report.errors) {
    console.error(`  x ${line}`)
  }
  console.error('')
  console.error('剧情数据未通过验证。')
  process.exit(1)
}

console.log('剧情数据验证通过。')
