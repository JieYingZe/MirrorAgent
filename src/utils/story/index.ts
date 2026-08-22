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
export { logEndingSummary } from './endingSummaryLog'
export { blocksToPlainText } from './blockText'
export { buildEndingReportText } from './endingReportText'
export type { EndingReportLabels } from './endingReportText'
export {
  STORY_SAVE_KEY,
  loadStorySave,
  saveStorySave,
  clearStorySave,
  validateStorySave,
} from './storySave'
export type { StorySaveLoadResult, StorySaveValidation } from './storySave'
export { getChapterPhaseLabel } from './chapterLabels'
export { describeNodeIssue } from './nodeIssue'

/* 阅读节奏（I01）：只影响展示层，不进入 StoryState，也不写存档。 */
export {
  hasText,
  formatEntryValue,
  getSystemUnits,
  getRecordUnits,
  getMessageUnits,
  getDocumentUnits,
  getBlockUnitTotal,
  isBlockEmpty,
} from './readingUnits'
export type {
  SystemUnits,
  RecordUnits,
  MessageUnits,
  DocumentUnits,
  DocumentSectionUnits,
} from './readingUnits'
export {
  READING_TIMING,
  resolveCharBaseMs,
  resolveInterBlockDelay,
  buildRevealSteps,
  buildBlockRevealPlan,
  buildSequencePlan,
} from './readingPlan'
export type { RevealStep, BlockRevealMode, BlockRevealPlan, SequencePlan } from './readingPlan'
export {
  nodeSequenceKey,
  responseSequenceKey,
  getSequenceStage,
  createReadingSequenceState,
  syncReadingSequence,
  tickReadingSequence,
  skipCurrentBlock,
  advanceToNextBlock,
  completeSequence,
  applyReadingInput,
  resolveReadingTick,
  getReadingPhase,
  getCompletedBlockCount,
  getGraphemeProgress,
  getUnitProgress,
} from './readingSequence'
export type {
  ReadingStage,
  ReadingPhase,
  ReadingOptions,
  ReadingSequenceState,
  ReadingInputAction,
  ReadingInputResult,
  ReadingTick,
} from './readingSequence'
