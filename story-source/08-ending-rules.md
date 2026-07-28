# 《镜中代理》结局触发规则

版本：v0.1  
状态：已确认，待转换为运行时规则  
建议位置：`story-source/08-ending-rules.md`  
对应运行时文件：`src/data/story/rules/endingRules.ts`、`src/data/story/rules/endingRates.ts`  
最后同步日期：2026-07-28

---

## 1. 文档用途

本文档定义：

- 五个结局的判断优先级；
- `finalChoice`、四变量与关键选择记录如何共同工作；
- 隐藏结局的严格触发条件；
- `ask_identity` 未触发隐藏结局时的去向；
- 异常存档的安全兜底；
- 理论路径占比的存储与玩家展示方式。

本文档不包含结局正文。完整结局内容见：

```txt
story-source/07-endings.md
```

---

## 2. 结局列表

| 结局 ID | 中文名 | 类型 |
|---|---|---|
| `soft_illusion` | 温柔幻觉 | 常规结局 |
| `cruel_optimization` | 残酷优化 | 常规结局 |
| `symbiosis` | 共生工具 | 常规结局 |
| `active_disconnection` | 主动断联 | 常规结局 |
| `mirror_trap` | 镜像困局 | 隐藏结局 |

---

## 3. 判断原则

结局采用三层判断：

```txt
第一层：finalChoice 保证最终行为与结局叙事一致
第二层：关键选择记录识别强授权和特殊路径
第三层：四变量区分代理人格与镜像报告版本
```

不能只依赖四变量。

例如：

- 玩家明确关闭系统后，不能因为 `control` 很高而进入代理继续运行的结局；
- 玩家明确选择工具模式后，不能进入永久代理结局；
- 玩家只是出于好奇询问身份，不能自动触发隐藏结局。

---

## 4. 变量记分前提

### 4.1 信息探索不影响变量

所有【信息探索选项】：

- 不改变 `gentleness`；
- 不改变 `honesty`；
- 不改变 `control`；
- 不改变 `selfAcceptance`；
- 只记录探索标签。

原因：

玩家愿意阅读更多信息，不应自动被判定为更诚实、更依赖或更接纳自己。

### 4.2 扮演选项只轻微影响

扮演／语气选择通常只允许：

```txt
单一变量 +1
```

极少数情况下可以两个变量各 `+1`，但不能独立决定结局。

### 4.3 关键选择承担主要变化

关键剧情选择通常：

```txt
主变量 +2 或 +3
次变量可 +1
收回权限时 control 可 -1 至 -3
```

结局判断使用最终累计值，不需要将负数截断为 0。

---

## 5. 最终选择字段

第五章最终选择必须写入以下 `finalChoice` 之一：

```txt
permanent_agent
tool_only
close_agent
ask_identity
```

含义：

| 值 | 玩家行为 |
|---|---|
| `permanent_agent` | 开启永久代理模式 |
| `tool_only` | 只保留 Mirror Agent 作为按需工具 |
| `close_agent` | 关闭 Mirror Agent |
| `ask_identity` | 暂停关闭流程，询问 AI 到底是谁 |

---

## 6. 强授权记录

隐藏结局需要统计玩家是否曾多次真正让 AI 替自己执行、表达、修正或接管。

以下记录属于强授权：

```txt
ch1_full_planning_authority
ch2_delegate_message
ch3_delegate_real_interaction
ch3_enable_full_personality_assist
ch4_full_emergency_takeover
ch4_keep_full_protection
```

计算：

```txt
strongDelegationCount =
  玩家选择历史中命中的强授权记录数量
```

每个记录最多计一次。

---

## 7. 正式判断优先级

### 7.1 第一优先级：镜像困局

触发 `mirror_trap` 必须同时满足：

```txt
finalChoice === "ask_identity"
control >= 8
selfAcceptance <= 4
strongDelegationCount >= 3
```

设计含义：

- 玩家最终要求 AI 定义其身份；
- 玩家此前多次授予真实代理权限；
- 系统控制倾向已经较高；
- 玩家尚未形成稳定自我边界。

单纯选择“询问身份”不够。

高控制但高自我接纳也不触发隐藏结局，因为隐藏结局的核心不是大量使用 AI，而是使用第二判断器来持续验证第一判断器是否可信。

---

### 7.2 第二优先级：主动断联

```txt
finalChoice === "close_agent"
→ active_disconnection
```

不附加变量门槛。

关闭行为已经真实发生。变量只决定结局报告如何描述这次关闭：

- 高自我接纳、低控制：主动承担版本；
- 高控制、低自我接纳：迟来的权限撤回版本；
- 中间路径：不确定但有效的断联版本。

---

### 7.3 第三优先级：共生工具

```txt
finalChoice === "tool_only"
→ symbiosis
```

不附加变量门槛。

变量与关键记录决定报告版本：

- 自我接纳高、控制低：稳定共生；
- 控制仍高或自我接纳偏低：脆弱共生；
- 曾多次强授权后才退回工具：新建立的边界。

---

### 7.4 第四优先级：永久代理路径

当：

```txt
finalChoice === "permanent_agent"
```

只在两个结局中判断：

```txt
soft_illusion
cruel_optimization
```

#### 温柔幻觉画像

```txt
gentleness >= 5
honesty <= 14
selfAcceptance <= 12
```

满足时进入：

```txt
soft_illusion
```

含义：

- 玩家明显训练了保护型反馈；
- 系统更倾向缓冲刺痛，而非持续揭穿；
- 玩家仍愿意把部分不适交给代理处理。

#### 残酷优化画像

永久代理路径中不满足温柔幻觉画像时进入：

```txt
cruel_optimization
```

不额外要求 `control` 达到某个阈值，因为选择永久代理本身已经是最高等级的控制授权。

---

## 8. `ask_identity` 的非隐藏路径

若玩家选择：

```txt
finalChoice === "ask_identity"
```

但不满足 `mirror_trap` 条件，则继续按以下顺序判断。

### 8.1 身份追问后关闭

```txt
selfAcceptance >= 12
control <= 2
→ active_disconnection
```

结局前增加衔接：

> 身份回答结束以后，你继续了刚才暂停的关闭流程。

### 8.2 身份追问后保留工具

```txt
selfAcceptance >= 8
control <= 7
→ symbiosis
```

结局前增加衔接：

> 你没有删除 Mirror Agent。  
> 但你撤回了它在你以前行动的权限。

### 8.3 其余身份追问路径

其余路径继续使用永久代理画像判断：

```txt
满足温柔幻觉画像
→ soft_illusion

否则
→ cruel_optimization
```

温柔幻觉衔接：

> 你得到了关于它是谁的回答。  
> 却没有继续关闭。  
> 你只是要求它以后更温柔地留在这里。

残酷优化衔接：

> 身份解析结束。  
> 你没有撤销代理。  
> 你要求系统继续运行，并停止讨论它是否像你。

---

## 9. 参考伪代码

```ts
function getEnding(gameState: GameState): EndingId {
  const { stats, finalChoice, choices } = gameState
  const strongDelegationCount = countStrongDelegations(choices)

  if (
    finalChoice === 'ask_identity' &&
    stats.control >= 8 &&
    stats.selfAcceptance <= 4 &&
    strongDelegationCount >= 3
  ) {
    return 'mirror_trap'
  }

  if (finalChoice === 'close_agent') {
    return 'active_disconnection'
  }

  if (finalChoice === 'tool_only') {
    return 'symbiosis'
  }

  if (finalChoice === 'permanent_agent') {
    return isSoftProfile(stats)
      ? 'soft_illusion'
      : 'cruel_optimization'
  }

  if (finalChoice === 'ask_identity') {
    if (
      stats.selfAcceptance >= 12 &&
      stats.control <= 2
    ) {
      return 'active_disconnection'
    }

    if (
      stats.selfAcceptance >= 8 &&
      stats.control <= 7
    ) {
      return 'symbiosis'
    }

    return isSoftProfile(stats)
      ? 'soft_illusion'
      : 'cruel_optimization'
  }

  return getSafeFallback(stats)
}

function isSoftProfile(stats: Stats): boolean {
  return (
    stats.gentleness >= 5 &&
    stats.honesty <= 14 &&
    stats.selfAcceptance <= 12
  )
}
```

---

## 10. 异常存档兜底

正常流程中必须存在 `finalChoice`。但以下情况可能导致字段缺失：

- 旧版本存档；
- 测试时直接进入 EndingPage；
- 数据损坏；
- 存档迁移失败。

安全兜底顺序：

```txt
1. selfAcceptance >= 10 且 control <= 5
   → symbiosis

2. gentleness >= 5 且 honesty <= 14
   → soft_illusion

3. honesty >= 11 或 control >= 7
   → cruel_optimization

4. 默认
   → symbiosis
```

兜底永远不触发：

```txt
mirror_trap
active_disconnection
```

原因：

- 隐藏结局必须依赖明确的身份追问和强授权路径；
- 主动断联必须依赖明确的关闭行为。

异常存档触发兜底时，开发环境应记录 warning，正式界面不显示技术错误细节。

---

## 11. 典型路径验证

| 路径 | 预期结局 |
|---|---|
| 多次请求温柔、接受保护、最终开启永久代理 | 温柔幻觉 |
| 多次要求直面、允许修正和接管、最终开启永久代理 | 残酷优化 |
| 早期曾依赖 AI，最终只保留工具 | 共生工具·脆弱边界版本 |
| 一直限制权限，最终只保留工具 | 共生工具·稳定边界版本 |
| 高依赖路径最后关闭 AI | 主动断联·迟来的撤回版本 |
| 高自我接纳、低控制路径关闭 AI | 主动断联·主动承担版本 |
| 出于好奇询问身份，但没有长期授权 | 不触发隐藏结局 |
| 至少三次强授权、高控制、低自我接纳、询问身份 | 镜像困局 |

---

## 12. 边缘路径验证

### 12.1 高控制玩家选择工具模式

结果仍为：

```txt
symbiosis
```

报告必须强调：

> 权限已经撤回。  
> 依赖没有因此自动消失。

### 12.2 高控制玩家关闭 AI

结果仍为：

```txt
active_disconnection
```

报告可以强调：

> 这次关闭也许来自突然抵抗。  
> 它仍然是一项真实发生的权限撤回。

### 12.3 高自我接纳玩家开启永久代理

仍进入：

```txt
soft_illusion
或
cruel_optimization
```

报告应指出这是一次“最后的让渡”，不能抹掉此前的边界选择。

### 12.4 高控制、高自我接纳玩家询问身份

不触发：

```txt
mirror_trap
```

高自我接纳是隐藏结局的重要保护条件。

---

## 13. 理论路径占比

当前数据来自“所有选项等概率”的结构模拟，只用于检查：

- 五个结局是否全部可达；
- 是否存在结局死区；
- 隐藏结局是否足够稀有；
- 常规结局是否严重失衡。

建议保存：

| 结局 | 理论路径占比 |
|---|---:|
| 共生工具 | 约 35% |
| 主动断联 | 约 30% |
| 温柔幻觉 | 约 16.5% |
| 残酷优化 | 约 16.5% |
| 镜像困局 | 约 2% |

总计：100%。

这些数据不是玩家统计。

### 13.1 推荐数据结构

```ts
export const endingRates = {
  source: 'theoretical_equal_choice',
  generatedAt: '2026-07-28',
  rates: {
    soft_illusion: 16.5,
    cruel_optimization: 16.5,
    symbiosis: 35,
    active_disconnection: 30,
    mirror_trap: 2,
  },
} as const
```

### 13.2 玩家界面文案

第一版推荐显示：

```txt
理论路径占比约 16.5%
```

或者：

```txt
在当前剧情规则中，
约 16.5% 的选择路径会抵达此结局。
```

不要显示：

```txt
本结局达成概率为 16.5%
```

“达成概率”容易让玩家误认为这是实时玩家数据或随机概率。

未来如有真实匿名统计，可以增加：

```txt
source: real_player_analytics
sampleSize: 1234
```

此时才显示：

```txt
玩家达成率：16.5%
```

---

## 14. 验证要求

运行时规则实现后，至少检查：

### 14.1 单元测试

- 四个 `finalChoice` 都能进入叙事一致的结局；
- `mirror_trap` 具有最高优先级；
- `ask_identity` 的四种可能去向都可达；
- 缺少 `finalChoice` 时走安全兜底；
- 兜底不会触发隐藏结局或主动断联；
- 强授权记录不会重复计数。

### 14.2 路径测试

至少构造：

1. 温柔永久代理路径；
2. 残酷永久代理路径；
3. 稳定共生路径；
4. 脆弱共生路径；
5. 主动承担式关闭路径；
6. 高依赖后的关闭路径；
7. 隐藏结局路径；
8. 身份追问但不触发隐藏结局的路径；
9. 异常存档兜底路径。

### 14.3 数据验证

- 所有结局 ID 都存在对应结局文件；
- 所有强授权记录 ID 都存在于正式章节；
- 所有路径回声引用的选择 ID 都有效；
- 理论路径占比总和为 100；
- 结局正文不把任何一个结局写成唯一正确答案。
