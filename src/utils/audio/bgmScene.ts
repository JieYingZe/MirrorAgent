import type { BgmScene, BgmTrackKey } from '../../types/audio'

/**
 * BGM 场景解析（A02）。
 *
 * 纯函数，不 import 任何音频资源，也不碰 Audio 实例：
 * 输入只有「哪一个画面」和「剧情页停在哪个节点」，输出只有一个曲目键。
 * 于是「什么时候换曲」就只剩一个可测的判断点：曲目键有没有变。
 *
 * 为什么不直接用 manifest 的章节级 `musicKey`：
 * 第五章需要章内换歌（前半回到常规氛围、后半进入结局曲），
 * 章节级字段表达不了这个边界，而剧情数据里没有节点级音乐字段。
 * 因此这里按 docs/05-assets-map.md §6.3 的第一种方案，
 * 在音频层单独维护一张表，manifest 保持不变，避免两处半对半错。
 *
 * 边界全部写成真实节点 ID（docs/05-assets-map.md §6.2），不使用「第五章后半」这类描述。
 */

/**
 * 章节级默认曲目。
 *
 * 章节 ID 与 src/data/story/manifest.ts 一致；覆盖完整性由
 * tests/bgmScene.test.ts 对着 manifest 校验，漏一个章节测试会直接失败。
 */
export const CHAPTER_BGM_TRACKS: Record<string, BgmTrackKey> = {
  prologue: 'main_theme',
  chapter_1: 'game_ambient',
  chapter_2: 'game_ambient',
  chapter_3: 'game_ambient',
  chapter_4: 'control_mode',
  // 第五章的默认值是「前半」：后半由下面的节点级覆盖接管。
  chapter_5: 'game_ambient',
}

/**
 * 节点级覆盖：章内换歌的唯一出口。
 *
 * 目前只有第五章后半需要。`ch5.final_record` 是所有路径必经、只有一个入口的
 * merge 节点，适合作为可执行的切换边界；它之后的最终确认、身份追问支线与两个结局门
 * 继续沿用同一首，因此全部写进来，保证「从这里开始一直到 EndingPage 都是 ending」。
 *
 * 这里刻意写成显式节点清单而不是「第 N 个节点之后」：
 * 剧情节点顺序会随内容调整，显式 ID 改起来会立刻被测试发现。
 */
export const NODE_BGM_OVERRIDES: Record<string, BgmTrackKey> = {
  'ch5.final_record': 'ending',
  'ch5.final_confirmation': 'ending',
  // 身份追问是最终确认被打断的一段，音乐不回到前半。
  'ch5.identity_answer': 'ending',
  'ch5.final_confirmation_after_identity': 'ending',
  'ch5.ending_gate': 'ending',
  'ch5.mirror_gate': 'ending',
}

/**
 * 解析当前场景应该播放的曲目。
 *
 * - 开始页（含启动遮罩点击进入实验的那一刻）固定主旋律，序章的章节映射同样是主旋律，
 *   所以「开始页 → 序章」不换曲、不重启；
 * - 结局页与第五章后半同为 `ending`，两者之间不换曲、不重启；
 * - 数据错误页返回 null（静默）：那是一个死胡同页面，继续放背景乐没有意义；
 * - 章节不在表里时同样返回 null，宁可安静，也不放一首明显不对的曲子。
 */
export function resolveBgmTrack(scene: BgmScene): BgmTrackKey | null {
  switch (scene.surface) {
    case 'start':
      return 'main_theme'
    case 'ending':
      return 'ending'
    case 'error':
      return null
    case 'game':
      return NODE_BGM_OVERRIDES[scene.nodeId] ?? CHAPTER_BGM_TRACKS[scene.chapterId] ?? null
  }
}
