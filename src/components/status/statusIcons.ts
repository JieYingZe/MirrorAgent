import { AudioLines, Lock, MessageSquare, ShieldHalf } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StatKey } from '../../types/game'

/**
 * 四个状态项的图标（V03）。
 *
 * 图标只是识别性的线性符号：它固定属于「哪一项」，不表达数值高低，
 * 也不随变量变化。剧情页的 AI 状态面板与结局页的状态摘要共用这一份，
 * 同一个变量在两处永远是同一个符号。
 *
 * 放在组件层而不是 utils/aiStatus.ts：那里是纯文案映射，不出现 React 组件。
 */
export const STATUS_ICONS: Record<StatKey, LucideIcon> = {
  gentleness: AudioLines,
  honesty: MessageSquare,
  control: Lock,
  selfAcceptance: ShieldHalf,
}
