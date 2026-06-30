# Token 烧光事故复盘（2026-06-30）

## 事故概要

调研**「红酒博物馆测试装置 + 品种×性格映射」**期间，token 一小时内从正常水位烧到限额。
所有后台 subagent 被 Anthropic API 主动拒绝（429 Token Plan 速率限制）。

---

## 根因：Multi-Level Subagent Dispatch（多级派单雪崩）

### 调用链复盘

```
主对话（我）
  ↓ Agent tool（让我去做调研）
    Agent 1「酒博物馆测试装置」  ← 派生 4 个 subagent
      ├─ Subagent A: langjiu 数字博物馆
      ├─ Subagent B: shede 数字博物馆
      ├─ Subagent C: La Cité du Vin
      └─ Subagent D: 新世界/旧世界
    
    Agent 2「品种×性格映射」    ← 派生 4 个 subagent
      ├─ Subagent E: 红葡萄品种
      ├─ Subagent F: 白葡萄品种
      ├─ Subagent G: 学术量表
      └─ Subagent H: 新旧世界市场

    Agent 3「MBTI×葡萄酒」     ← 直接做，没派 subagent ✅
```

**问题**：Agent 1 和 2 收到任务后**默认派 subagent 分治**（这是 deep-research skill 的文档暗示的最佳实践），结果：

- 2 个 root agent × 各自 4 个 subagent = 至少 10 个 subagent 在跑
- 每个 subagent 又做 5-93 次 `WebSearch` / `WebFetch` 调用
- **总工具调用数 200+**，但其中 60%+ 因为反爬/限流返回 429/403/404
- 用户电脑因为并行 http 请求、浏览器渲染撑爆
- Anthropic API 因为 token 用量激增拒接后续请求

### 为什么 Agent 1 和 2 派了 subagent？

我没有在 prompt 里明确说「**不要派生 subagent，直接调 WebSearch + WebFetch**」。
默认行为下，deep-research skill 鼓励把任务再分治，所以智能体的判断是「派生 subagent 更高效」——结果恰恰相反。

### 为什么 Agent 3 没出问题？

Agent 3 收到的 prompt 里我列出了 5 个目标 URL 和精确要求（每个 100-200 字、不要硬编、有 URL），**目标足够明确 + 我先看了它的 prompt 设计**——所以它没派生 subagent，直接调 WebSearch 完成。

对比下来，**prompt 的清晰度**决定了 subagent 的行为。

---

## 5 条避免规则

### 1. ❌ 禁止 multi-level subagent dispatch

在所有 Agent tool 调用的 prompt 里**显式写**：
> 直接使用 WebSearch 和 WebFetch 工具完成调研。
> **严禁派生 subagent 派任务**。
> 单个目标调研任务最长 5 次工具调用。

### 2. ⏱ 限制工具调用预算

在 prompt 里**写明上限**：
> 这个调研最多 8 次 WebSearch + 5 次 WebFetch。
> 如果某个目标查询 2 次都拿不到一手资料，直接写"未找到一手资料"，继续下一个目标。

### 3. 🎯 先锁范围，再开调研

- 把"调研目标"先列成清单给用户确认
- 用户确认后再派 agent
- 不要"先开了再说"

### 4. 📋 用「工具直调」代替「multi-level dispatch」

调研 3 的成功模式：
- **1 个 root agent**（我）直接调 `WebSearch` + `WebFetch`
- 不派生 subagent
- 抓到一手资料就用，抓不到直接 `WEBFALLBACK`

deep-research skill 适合**真正大型**的调研（10+ 子主题、3 阶段以上）。
对于 5 个目标以内的**中等调研**，直接 `Agent` tool（不派生 subagent）就够了。

### 5. 🔄 区分场景选择工具

| 场景 | 工具 |
|------|------|
| 单目标、小资料（1-2 URL） | 直接 `WebFetch` |
| 5 个目标以内、中等调研 | 1 个 `Agent`，prompt 强制直接做 |
| 10+ 主题、需要交叉验证 | `deep-research` skill，但要锁 subagent 不许再派 |
| 实时抓取、需要登录 | `web-access` skill |

---

## 这次虽然烧 token，但烧出了 5 份有用的报告

虽然大部分 subagent 因为 429/403 失败，但 **3 份成功报告已被沉淀到项目**：

- `docs/research/red-wine-design-basis.md`（综合 5 份）
- 关键发现：**Tim Hanni Vinotype 学术框架**（这是国内所有竞品都没有的）

**结论**：单 token 成本 vs. 产物价值，**值得**。但流程上要修。

---

## 后续操作

- ✅ 已关闭所有 subagent（实际上是 Anthropic API 因 429 自动拒绝）
- ✅ 报告已沉淀到 `docs/research/red-wine-design-basis.md`
- 🔧 后续调研任务严格按上述 5 条规则执行

---

**教训代码化**：
调研 prompt 模板（后续所有 Agent 调用都用这格式）：
```
【任务】...（具体目标）【不超过 N 段文字】
【直接工具】用 WebSearch + WebFetch，**严禁派生 subagent**
【调用上限】最多 N 次 WebSearch + N 次 WebFetch
【失败处理】查 2 次无一手资料即放弃该目标，写"未找到"
【输出】XXX 字以内，格式按 XXX
```
