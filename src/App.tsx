import { useCallback, useEffect, useState } from 'react'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import EndingPage from './pages/EndingPage'
import DataErrorPage from './pages/DataErrorPage'
import type {
  EndingDefinition,
  StoryBlock,
  StoryChapterMeta,
  StoryChoice,
  StoryNode,
  StoryState,
} from './types/story'
import type { SceneImageStatus, SceneSurface } from './types/visual'
import type { BgmScene } from './types/audio'
import type { EndingResolution } from './utils/story'
import {
  advanceToNext,
  applyChoice,
  clearStorySave,
  createInitialStoryState,
  describeNodeIssue,
  getChapterMeta,
  getEnding,
  getEndingDefinition,
  getStoryNode,
  loadStorySave,
  responseSequenceKey,
  saveStorySave,
} from './utils/story'
import { resolveSceneKey } from './utils/visualScene'
import { resolveBgmTrack } from './utils/audio/bgmScene'
import { shouldPlayControlWarning } from './utils/audio/sfxTriggers'
import { useUserPreferences } from './hooks/useUserPreferences'
import { useBgmPlayer } from './hooks/useBgmPlayer'
import { useSfxPlayer } from './hooks/useSfxPlayer'
import { useOneShotSfx, useTypingSfx } from './hooks/useSfxTriggers'
import { SceneBackground } from './components/visual/SceneBackground'
import { StartupGate } from './components/audio/StartupGate'
import { AudioToggles } from './components/audio/AudioToggles'

type Screen = 'start' | 'game' | 'ending'

/**
 * 一次渲染要显示的画面。
 *
 * 先解析成这个结构再渲染，是为了让「显示哪一页」和「显示哪一张背景」读同一份结果：
 * 背景层需要知道当前节点属于哪一章，也需要知道是不是掉进了数据错误页。
 */
type ScreenView =
  | { surface: 'start' }
  | { surface: 'game'; node: StoryNode; chapter: StoryChapterMeta; viewState: StoryState }
  | { surface: 'ending'; stage: EndingStage }
  | { surface: 'error'; message: string }

/** 选项专属回应属于临时 UI 阶段，不写入 StoryState，也不进入存档。 */
type ResponseStage = {
  nodeId: string
  blocks: StoryBlock[]
  /**
   * 阅读序列标识（I01），形如 `response:${choiceId}:${下一稳定节点}`。
   * 只用于让打字机识别「换了一段要重新播放的文本」，同样不进存档。
   */
  sequenceKey: string
  /** 选择前的状态快照，保证正文的条件文本在阅读回应时不会中途变化。 */
  snapshot: StoryState
}

type EndingStage = {
  resolution: EndingResolution
  definition: EndingDefinition
}

type BootSession = {
  screen: Screen
  state: StoryState
  ending: EndingStage | null
  /** 有效的未完成存档，等玩家点击“继续实验”后才恢复。 */
  resumable: StoryState | null
}

/**
 * 启动时读取一次存档。
 *
 * - 无存档 / 损坏 / 旧版本 / storage 不可用：全部按无存档处理，停在 StartPage；
 * - 未完成存档：先留在 StartPage，由玩家决定继续还是重新初始化；
 * - 完成存档：用正式状态重新推导结局，直接恢复 EndingPage，不回到第五章旧节点。
 */
function createBootSession(): BootSession {
  const fresh: BootSession = {
    screen: 'start',
    state: createInitialStoryState(),
    ending: null,
    resumable: null,
  }

  const result = loadStorySave()

  if (result.status !== 'valid') return fresh

  const saved = result.state

  if (!saved.completed) {
    return { ...fresh, resumable: saved }
  }

  const resolution = getEnding(saved)
  const definition = getEndingDefinition(resolution.endingId)

  // 校验时已确认完成存档能推导出结局，这里只是不信任地再确认一次。
  if (!definition) {
    clearStorySave()
    return fresh
  }

  return {
    screen: 'ending',
    state: saved,
    ending: { resolution, definition },
    resumable: null,
  }
}

export default function App() {
  const [boot] = useState(createBootSession)
  const [screen, setScreen] = useState<Screen>(boot.screen)
  const [state, setState] = useState<StoryState>(boot.state)
  const [resumable, setResumable] = useState<StoryState | null>(boot.resumable)
  const [responseStage, setResponseStage] = useState<ResponseStage | null>(null)
  const [ending, setEnding] = useState<EndingStage | null>(boot.ending)
  const [dataError, setDataError] = useState<string | null>(null)

  /**
   * 当前场景图片的加载状态（V02）。
   *
   * 只有开始页会用到：它的可见标题与说明都在 `bg-start` 成稿里，
   * 成稿显示不出来时页面需要退回一套可见文字兜底。
   */
  const [sceneImageStatus, setSceneImageStatus] = useState<SceneImageStatus>('loading')

  /**
   * 本地用户偏好（I01 自动播放 + A01 音频）。
   *
   * 属于用户偏好而不是剧情进度：存在独立的 localStorage key 里，
   * 由应用层持有，因此节点切换、responseStage、重新初始化、通关重开都不会重置。
   * 它不进入 StoryState，也不进 I03 存档。
   */
  const [preferences, updatePreferences] = useUserPreferences()

  /**
   * 启动遮罩与音频解锁（A01）。
   *
   * 两个状态都只属于这一次页面加载，不持久化：遮罩每次打开网页出现一次，
   * 解锁标记也随刷新失效（浏览器的自动播放许可同样不跨页面加载保留）。
   */
  const [gateOpen, setGateOpen] = useState(true)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  /**
   * 本次会话是「从存档恢复」到哪个节点的（A03）。
   *
   * 只有一次性场景音效需要这个信息：恢复到第四章入口时不该再响一次警告，
   * 那属于「本来就在里面」，不是「进入」。开新一轮时为 null，
   * 因此重新初始化后再玩到第四章仍然会正常触发。判定见 utils/audio/sfxTriggers.ts。
   */
  const [restoredNodeId, setRestoredNodeId] = useState<string | null>(
    boot.resumable?.currentNodeId ?? null,
  )

  /**
   * SFX 播放器（A03）。
   *
   * 与 BGM 并列的第二个执行器，共用同一份偏好的主音量与同一个解锁标记，
   * 但各自读**自己那一路**的开关：这里只读 `sfxMuted`，BGM 只读 `bgmMuted`。
   * 偏好仍然只有一个所有者（useUserPreferences），没有第二套状态。
   * 业务层只说「发生了哪个动作」，由音频层决定响什么，
   * 映射表在 utils/audio/sfxActions.ts。
   */
  const sfx = useSfxPlayer({
    muted: preferences.sfxMuted,
    masterVolume: preferences.masterVolume,
    unlocked: audioUnlocked,
  })

  const { playAction, playSfx } = sfx

  /** 打字机音效：被动订阅阅读揭示进度，不参与也不影响阅读推进。 */
  const handleReadingReveal = useTypingSfx(playSfx)

  /**
   * 切换节点后把阅读区域滚回顶部。
   *
   * 显示选项专属回应时不滚：此时正文没有换，回应接在原文下面逐段显示，
   * 拉回顶部反而会把刚出现的回应推出视野。回应结束、真正换到下一个稳定节点时，
   * 这个 effect 会因为 responseStage 变回 null 再跑一次。
   */
  useEffect(() => {
    if (responseStage) return

    window.scrollTo({ top: 0 })
  }, [state.currentNodeId, responseStage])

  /** 统一的数据错误出口：界面只显示“实验数据损坏”，细节留给开发控制台。 */
  function reportDataError(detail: string) {
    console.error(`[story] ${detail}`)
    setDataError(detail)
  }

  /**
   * 正式状态的唯一提交口：提交内存状态并立即写入存档。
   *
   * 到达结局门时把“计算结局 → 标记 completed → 保存”合成同一次提交，
   * 避免把 `completed: false` 且停在结局门的中间态写进存档。
   * 存档写入失败不影响内存状态，游戏照常继续。
   */
  function commitStoryState(next: StoryState): boolean {
    const node = getStoryNode(next.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${next.currentNodeId}。`)
      return false
    }

    if (node.role !== 'ending_gate') {
      setState(next)
      saveStorySave(next)
      return true
    }

    const resolution = getEnding(next)
    const definition = getEndingDefinition(resolution.endingId)

    if (!definition) {
      reportDataError(`找不到结局定义：${resolution.endingId}（规则 ${resolution.ruleId}）。`)
      return false
    }

    const completed: StoryState = { ...next, completed: true }

    setState(completed)
    setEnding({ resolution, definition })
    saveStorySave(completed)
    return true
  }

  /** 清空一次会话的全部临时 UI 状态：回应阶段、结局结果、错误页和可恢复存档。 */
  function clearSessionUi() {
    setResponseStage(null)
    setEnding(null)
    setDataError(null)
  }

  /**
   * 「开始初始化」与「重新初始化」共用的入口。
   *
   * 先清除旧剧情存档，再建立全新初始状态并直接进入序章；
   * 清除或保存失败时，内存中的重新初始化仍然成功。
   *
   * 只清剧情存档。自动播放与音频偏好在另一个存储键里，由 useUserPreferences 持有，
   * 这里既不读也不写，因此重新初始化不会把静音状态或音量改回默认值。
   */
  function handleStartNewRun() {
    playAction('start_new_run')
    clearStorySave()

    const fresh = createInitialStoryState()

    clearSessionUi()
    setResumable(null)
    // 新的一轮不存在「恢复点」，第四章警告等一次性场景音效重新可用。
    setRestoredNodeId(null)
    setState(fresh)
    setScreen('game')
    saveStorySave(fresh)
  }

  /** 「继续实验」：恢复已通过校验的存档，临时 UI 状态一律从零开始。 */
  function handleResume() {
    // 没有存档时这个按钮根本不会渲染；被拒绝的操作不发出任何反馈。
    if (!resumable) return

    playAction('resume_run')
    clearSessionUi()
    setRestoredNodeId(resumable.currentNodeId)
    setState(resumable)
    setScreen('game')
  }

  /** 数据损坏出口：清掉可能有问题的存档，回到开始页。 */
  function handleExitToStart() {
    playAction('exit_to_start')
    clearStorySave()
    clearSessionUi()
    setResumable(null)
    setRestoredNodeId(null)
    setState(createInitialStoryState())
    setScreen('start')
  }

  function handleChoose(choice: StoryChoice) {
    const node = getStoryNode(state.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${state.currentNodeId}。`)
      return
    }

    /*
      选择音效（A03 试玩修订：从「提交完成后」提前到「确认被接受时」）。

      原来放在 commitStoryState 之后，声音要等 applyChoice、路由解析、
      JSON 序列化和 localStorage 写入全部跑完才响，点起来不跟手。
      现在的顺序是：确认这个选项确实属于当前节点 → 立即出声 → 再跑事务。

      前置条件仍然足够严格，不会为无效操作出声：
      - 按钮 disabled 时根本不会调到这里；
      - GamePage 的 withLock 在调用之前就同步上了锁，三连击只会进来一次；
      - 找不到当前节点会在上面直接 return；
      - `node.choices` 里没有这个选项，说明它来自已经翻过去的旧节点，不出声。
      判断只读数据、不改状态，因此提前出声不会让 StoryState 提前或重复写入：
      applyChoice、路由解析、提交与存档仍然只在下面执行一次。
      playAction 内部吞掉全部异常，音效失败不会影响选择事务。

      第四章的选项同样走 choice_select：warning 是「进入异常接管状态」的场景音，
      不是选择确认音。
    */
    if (node.choices?.some((item) => item.id === choice.id)) {
      playAction('select_choice')
    }

    const result = applyChoice(state, node, choice)

    // 路由目标必须存在，否则停在原地报错，不掩盖脏数据。
    if (!getStoryNode(result.state.currentNodeId)) {
      reportDataError(
        `选项 ${choice.id} 指向的节点不存在：${result.state.currentNodeId}（来自节点 ${node.id}）。`,
      )
      return
    }

    // 正式状态先提交并保存：即使玩家还在读选项专属回应，刷新也只会前进不会回退。
    if (!commitStoryState(result.state)) return

    // 有专属回应时先停留在原节点显示回应，玩家点击继续后才显示新节点。
    setResponseStage(
      result.response.length > 0
        ? {
            nodeId: result.previousNodeId,
            blocks: result.response,
            sequenceKey: responseSequenceKey(choice.id, result.state.currentNodeId),
            snapshot: state,
          }
        : null,
    )
  }

  function handleContinue() {
    playAction('continue_reading')

    // 正在显示选项专属回应：只关闭回应，状态早已在选择时提交并保存。
    if (responseStage) {
      setResponseStage(null)
      return
    }

    const node = getStoryNode(state.currentNodeId)

    if (!node) {
      reportDataError(`找不到当前节点：${state.currentNodeId}。`)
      return
    }

    // 结局在进入结局门时已经作为同一次事务提交，这里只负责切页。
    if (node.role === 'ending_gate') {
      if (!ending && !commitStoryState(state)) return

      setScreen('ending')
      return
    }

    const nextState = advanceToNext(state, node)

    if (!nextState) {
      reportDataError(`节点 ${node.id} 没有 next，无法继续。`)
      return
    }

    if (!getStoryNode(nextState.currentNodeId)) {
      reportDataError(`节点 ${node.id} 的 next 指向不存在的节点：${nextState.currentNodeId}。`)
      return
    }

    commitStoryState(nextState)
  }

  /** 解析当前画面。所有数据错误都在这里收敛成 `surface: 'error'`。 */
  function resolveScreenView(): ScreenView {
    if (dataError) return { surface: 'error', message: dataError }

    if (screen === 'start') return { surface: 'start' }

    if (screen === 'ending') {
      return ending
        ? { surface: 'ending', stage: ending }
        : { surface: 'error', message: '结局数据缺失，无法生成报告。' }
    }

    // 显示回应时继续渲染上一个节点，并使用选择前的状态快照做条件过滤。
    const viewNodeId = responseStage?.nodeId ?? state.currentNodeId
    const viewState = responseStage?.snapshot ?? state
    const node = getStoryNode(viewNodeId)

    if (!node) {
      return { surface: 'error', message: `找不到当前节点：${viewNodeId}。` }
    }

    const chapter = getChapterMeta(node.chapterId)

    if (!chapter) {
      return {
        surface: 'error',
        message: `节点 ${node.id} 的章节 ${node.chapterId} 不在 manifest 中。`,
      }
    }

    const issue = responseStage ? undefined : describeNodeIssue(node, viewState)

    if (issue) {
      console.error(`[story] ${issue}`)
      return { surface: 'error', message: issue }
    }

    return { surface: 'game', node, chapter, viewState }
  }

  function renderScreen(view: ScreenView) {
    switch (view.surface) {
      case 'error':
        return <DataErrorPage message={view.message} onRestart={handleExitToStart} />

      case 'start':
        return (
          <StartPage
            canContinue={resumable !== null}
            // 只在明确失败时退回可见文字：加载中仍然等成稿，不闪一次兜底再收回去。
            backgroundUnavailable={sceneImageStatus === 'failed' || sceneImageStatus === 'unavailable'}
            onStart={handleStartNewRun}
            onContinue={handleResume}
          />
        )

      case 'ending':
        return (
          <EndingPage
            ending={view.stage.definition}
            resolution={view.stage.resolution}
            state={state}
            onRestart={handleStartNewRun}
          />
        )

      case 'game':
        return (
          <GamePage
            node={view.node}
            chapter={view.chapter}
            state={view.viewState}
            // 状态面板始终读最新变量，即使正文停留在回应前的快照上。
            currentStats={state.stats}
            responseBlocks={responseStage?.blocks ?? null}
            responseKey={responseStage?.sequenceKey ?? null}
            autoplayEnabled={preferences.autoplayEnabled}
            onAutoplayEnabledChange={handleAutoplayEnabledChange}
            onChoose={handleChoose}
            onContinue={handleContinue}
            onReadingReveal={handleReadingReveal}
          />
        )
    }
  }

  const view = resolveScreenView()
  const surface: SceneSurface = view.surface
  /*
    背景只认场景键（V02）。

    剧情侧唯一的输入是章节的 backgroundKey，所以同一章内换节点、进分支、
    分支汇流拿到的都是同一个键，图片不会重复加载；
    开始页与序章同为 start、第五章与结局页同为 ending，两处交界也不换图。
    从存档恢复时这里直接读当前节点所属章节，不会先经过开始页的背景。
  */
  const sceneKey = resolveSceneKey(
    surface,
    view.surface === 'game' ? view.chapter.backgroundKey : undefined,
  )

  /*
    当前音频场景（A02）。

    与背景层是两个独立的输入：背景只认章节的 backgroundKey，
    BGM 还需要节点 ID —— 第五章要在章内换歌，章节级信息定位不到那个边界。

    用的是「正在显示的节点」而不是已提交的 currentNodeId：显示选项专属回应期间，
    画面仍停在选择前那个节点，音乐也应该跟着画面走，等玩家点继续、真正进入
    下一个节点时再换曲。resolveBgmTrack 是纯函数，页面组件不参与任何节点判断。
  */
  const audioScene: BgmScene =
    view.surface === 'game'
      ? { surface: 'game', nodeId: view.node.id, chapterId: view.node.chapterId }
      : { surface: view.surface }

  /*
    全局唯一的音频状态所有者（A01）。

    只声明「现在该响哪一首、静音没有、解锁没有」，实例创建、淡入淡出、
    页面隐藏与播放失败降级全部在音频层内部完成。
  */
  const { unlock } = useBgmPlayer({
    track: resolveBgmTrack(audioScene),
    // BGM 只读自己那一路的开关，与音效通道互不影响。
    muted: preferences.bgmMuted,
    masterVolume: preferences.masterVolume,
    unlocked: audioUnlocked,
  })

  /*
    第四章失控模式的一次性警告（A03）。

    判定只看「现在是不是在这个场景里」，一次性由闸门保证：闸门只认上升沿，
    因此状态面板更新、打字揭示、自动播放切换、Strict Mode 的重复 effect
    都不会重复播放；离开场景后闸门重新装填，重新初始化再走一遍可以再响一次。

    要求遮罩已关闭：用户还没做过任何手势时不能偷偷出声。

    结局页曾经也有一个同样结构的一次性揭示音，A03 试玩修订里取消了
    （素材偏欢快，与结局的沉重／释然／困惑不符）。结局现在只保留一直在播的
    bgm-ending 与页面自身的视觉过渡，这里不再有任何结局相关的触发。
  */
  const controlWarningActive =
    !gateOpen && view.surface === 'game' && shouldPlayControlWarning(view.node.id, restoredNodeId)

  useOneShotSfx(
    controlWarningActive,
    useCallback(() => playSfx('warning_soft'), [playSfx]),
  )

  /**
   * 「点击进入实验」（A01）。
   *
   * 解锁必须发生在这次点击的调用栈里：浏览器的自动播放策略认的是用户手势。
   * 解锁失败、文件加载不出来、被浏览器拒绝都不会抛错，遮罩一律关闭，
   * 之后整个游戏照常可玩，只是没有声音。
   *
   * 与 StartPage 的「开始初始化／继续实验」是两个独立动作：这里不碰剧情存档。
   */
  function handleEnterExperiment() {
    unlock()
    // SFX 与 BGM 各自解锁一次：两者都需要发生在这次点击的调用栈里。
    sfx.unlock()
    playAction('gate_enter')
    setAudioUnlocked(true)
    setGateOpen(false)
  }

  /**
   * 背景音乐开关（A03 试玩修订）。
   *
   * 只写 `bgmMuted`，完全不碰音效通道。反馈音走普通 click，两个方向都响：
   * 关掉背景音乐时如果一点声音都没有，玩家无法确认这次点击是不是生效了，
   * 所以刻意不拿 BGM 自己的起停当反馈。音效通道关着时它自然不响，那是玩家的选择。
   * BGM 的停止与恢复仍由声明式的 sync 处理，这里不直接操作播放器。
   */
  function handleBgmEnabledChange(enabled: boolean) {
    playAction('toggle_bgm')
    updatePreferences({ bgmMuted: !enabled })
  }

  /**
   * 音效开关（A03 试玩修订）。
   *
   * 顺序是有意的：先把新的通道状态送到 SFX 播放器，再决定要不要发出反馈音。
   * - 关闭音效：这一刻正在响的短音效立即被压住，并且不补一声点击 ——
   *   否则要么被立刻掐断成拖尾，要么变成无音效态里残留的一响；
   * - 开启音效：通道已经先一步打开，此时的一声轻点击是「音效回来了」的确认，
   *   不存在状态倒置。
   * 只写 `sfxMuted`，完全不碰背景音乐通道。
   */
  function handleSfxEnabledChange(enabled: boolean) {
    updatePreferences({ sfxMuted: !enabled })
    sfx.setMuted(!enabled)
    playAction(enabled ? 'sfx_on' : 'sfx_off')
  }

  function handleAutoplayEnabledChange(next: boolean) {
    playAction('toggle_autoplay')
    updatePreferences({ autoplayEnabled: next })
  }

  return (
    <>
      {/*
        遮罩显示期间用 inert 关掉整个业务层：下面的按钮既点不到也 Tab 不到，
        屏幕阅读器同样读不到，遮罩才真的是模态的。
      */}
      <div className="app-shell" inert={gateOpen}>
        <SceneBackground
          sceneKey={sceneKey}
          surface={surface}
          onImageStatusChange={setSceneImageStatus}
        />
        {renderScreen(view)}

        {/* 固定在右上角，因此三个页面上的位置完全一致，不随页面结构跳动。 */}
        {!gateOpen && (
          <AudioToggles
            bgmEnabled={!preferences.bgmMuted}
            sfxEnabled={!preferences.sfxMuted}
            onBgmEnabledChange={handleBgmEnabledChange}
            onSfxEnabledChange={handleSfxEnabledChange}
          />
        )}
      </div>

      {gateOpen && <StartupGate onEnter={handleEnterExperiment} />}
    </>
  )
}
