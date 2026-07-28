/** 剧情引擎的统一出口。页面组件只从这里导入运行逻辑。 */

export { evaluateCondition } from './evaluateCondition'
export { resolveRoute, listRouteTargets } from './resolveRoute'
export { getStoryNode, getChapterMeta } from './getStoryNode'
export { getVisibleBlocks, getVisibleChoices, getVisibleGroupBlocks } from './getVisibleBlocks'
export { selectEndingPathEchoes } from './selectEndingPathEchoes'
export {
  createInitialStoryState,
  applyStatChanges,
  mergeTags,
  markVisited,
} from './storyState'
export { applyChoice, advanceToNext } from './applyChoice'
export type { ApplyChoiceResult } from './applyChoice'
export { getEnding, getEndingDefinition, buildEndingView } from './getEnding'
export type { EndingResolution, EndingView } from './getEnding'
export { getChapterPhaseLabel, getChapterProgressLabel } from './chapterLabels'
export { describeNodeIssue } from './nodeIssue'
