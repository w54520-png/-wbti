# WBTI 酒人格测试 v0.1 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个可独立部署的 WBTI 酒人格测试 HTML 简版，5 个静态页 + 32 道题 + 16+2 个人格结果，部署到 Vercel 子域名。

**Architecture:** 单页应用（SPA），hash 路由，原生 HTML + Tailwind CSS CDN + ES Modules。核心逻辑（计分、人格匹配）纯函数化、可测试。所有数据（32 题 + 18 人格）放 JSON 文件，UI 渲染从 JSON 拉。

**Tech Stack:**
- HTML5 + 原生 ES6 Modules（无构建工具）
- Tailwind CSS via CDN（v3）
- 字体：系统默认（PingFang SC / Helvetica）
- 测试：Node.js 内置 `node --test`（无需 npm 依赖）
- 部署：Vercel（静态托管 + 自动 HTTPS）
- 版本控制：Git

## Global Constraints

这些约束来自 spec，**每个 task 默认遵循**：

| 约束 | 值 | 来源 |
|---|---|---|
| 题目数量 | 32 道 + 1 道饮酒分支 | spec §3.3 |
| 人格数量 | 16 常规 + 2 隐藏（DRUNK + HHHH） | spec §2.2/2.4 |
| 维度 | 4 个（H/L, S/T, F/M, C/N） | spec §2.1 |
| 主题色 | `#8B4513`（深琥珀） | spec §5.1 |
| 辅色 | `#D4A574`（浅金） | spec §5.1 |
| 背景色 | `#FAF7F2`（暖米白） | spec §5.1 |
| 隐藏人格色 | `#7C2D12`（酒红） | spec §5.1 |
| 计分量表 | 3 选 1（不认同/中立/认同 → -1/0/+1） | spec §3.2 |
| 饮酒分支触发 | 浓度 H 维度得分 ≥ 2 | spec §3.5 |
| HHHH 触发 | 4 维常规人格最高极得分 < 5 | spec §3.5 |
| 平手处理 | 默认字母表靠前（H>L, S>T, F>M, C>N） | spec §3.5 |
| 命名规则 | 代号 4 字母以上 + 酒相关英文 + 谐音梗 | spec §2.3 |
| 题序 | 展示顺序洗牌后固定一致 | spec §3.3 |
| 不允许直接谈酒 | 题目文案不出现"酒/喝/味道/烈/淡/醉" | spec §3.1 |
| 页面数量 | 5 页（首页/测试/结果/16型/关于） | spec §4 |
| 路由 | hash 路由（`#/`、`#/test`、`#/result/MALT`） | spec §6 |
| 文案口吻 | 娱乐向 + 友情提示免责 | spec §1.2 / §9 |
| v0.1 范围 | emoji 占位 + 酒卡 # 占位 | spec §8.1 |

---

## 文件结构（实施前先看）

```
/Users/ruilin/微信小程序/
├── index.html                       # 单页应用入口（含所有静态布局）
├── css/
│   └── styles.css                   # 少量自定义样式（覆盖 Tailwind 不足）
├── js/
│   ├── app.js                       # 入口：路由 + 页面切换
│   ├── pages/
│   │   ├── home.js                  # 首页
│   │   ├── test.js                  # 测试页（单题推进）
│   │   ├── result.js                # 结果详情页
│   │   ├── types.js                 # 16 型索引页
│   │   └── about.js                 # 关于页
│   ├── core/
│   │   ├── scoring.js               # 计分逻辑（纯函数）
│   │   ├── matcher.js               # 人格匹配（纯函数）
│   │   └── data-loader.js           # JSON 加载
│   └── share.js                     # 分享卡生成
├── data/
│   ├── questions.json               # 32 道题 + 1 道饮酒分支
│   └── types.json                   # 16+2 人格完整数据
├── tests/
│   ├── scoring.test.js              # Node 内置测试
│   └── matcher.test.js              # Node 内置测试
├── assets/
│   └── (空，预留给未来图片)
├── docs/
│   ├── superpowers/
│   │   ├── specs/2026-06-30-酒人格测试-wbti-design.md
│   │   └── plans/2026-06-30-wbti-mvp-plan.md
│   └── changelog.md                 # 每次迭代记录
├── vercel.json                      # Vercel 部署配置
├── .gitignore
├── README.md                        # 项目说明
└── package.json                     # 仅用于 `npm test`（可选）
```

**每个文件职责**：
- `index.html`：骨架 + Tailwind CDN + 路由容器
- `js/app.js`：监听 hashchange → 切换页面
- `js/pages/*.js`：每个页面一个文件，导出 `render()` 函数
- `js/core/scoring.js`：纯函数 `scoreAnswers(answers) → {H, L, S, T, F, M, C, N}`
- `js/core/matcher.js`：纯函数 `matchType(scores, hasDrunkAnswer) → typeCode`
- `js/core/data-loader.js`：`fetch('/data/questions.json')` 等
- `data/*.json`：纯数据，无逻辑
- `tests/*.test.js`：Node 内置测试，验证纯函数

---

## 任务清单概览

| Task | 内容 | 估时 | 依赖 |
|---|---|---|---|
| 1 | 项目脚手架（目录、.gitignore、README、vercel.json） | 0.5h | - |
| 2 | 数据 schema 验证（questions.json + types.json 空模板） | 0.5h | Task 1 |
| 3 | 32 道题数据填充 + 题序洗牌 | 1h | Task 2 |
| 4 | 18 个人格数据填充（代号/别称/速写/典型酒/emoji） | 2h | Task 2 |
| 5 | 计分逻辑（TDD） | 1.5h | Task 3 |
| 6 | 人格匹配逻辑（TDD，含隐藏触发） | 1.5h | Task 5 |
| 7 | HTML 骨架 + hash 路由 | 1h | Task 1 |
| 8 | 首页 + 16 型索引页 + 关于页（静态页） | 1.5h | Task 7 |
| 9 | 测试页（单题推进 + 进度条） | 2h | Task 5, 7 |
| 10 | 结果页（人格速写 + 4 维指纹 + 酒卡） | 2h | Task 6, 7 |
| 11 | 分享卡生成 | 1h | Task 10 |
| 12 | 整体流程验收（18 人格路径 + 移动端） | 1h | Task 11 |
| 13 | Vercel 部署 + 上线验证 | 0.5h | Task 12 |
| **总计** | | **16h ≈ 2 个工作日** | |

---

## Task 1: 项目脚手架

**Files:**
- Create: `/Users/ruilin/微信小程序/.gitignore`
- Create: `/Users/ruilin/微信小程序/README.md`
- Create: `/Users/ruilin/微信小程序/vercel.json`
- Create: `/Users/ruilin/微信小程序/package.json`
- Create: `/Users/ruilin/微信小程序/docs/changelog.md`

- [ ] **Step 1: 创建 `.gitignore`**

```gitignore
# 依赖
node_modules/
package-lock.json

# 系统文件
.DS_Store
Thumbs.db

# 编辑器
.vscode/
.idea/
*.swp

# 日志
*.log
npm-debug.log*

# 环境
.env
.env.local

# Vercel
.vercel/
```

- [ ] **Step 2: 创建 `README.md`**

```markdown
# WBTI 酒人格测试

> 32 道看似无关的有趣题，测出你的酒人格。

## 项目状态

- v0.1 MVP (开发中)
- 部署地址：https://wbti.vercel.app（待上线）

## 本地运行

```bash
# 任意 HTTP server 即可（如 Python）
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 目录结构

```
index.html              # 单页应用入口
js/                     # 所有 JS 模块
data/                   # 题库和人格数据
docs/superpowers/       # 设计文档 + 实施计划
```

## 设计文档

[设计文档](docs/superpowers/specs/2026-06-30-酒人格测试-wbti-design.md)

## 实施计划

[实施计划](docs/superpowers/plans/2026-06-30-wbti-mvp-plan.md)
```

- [ ] **Step 3: 创建 `vercel.json`**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

- [ ] **Step 4: 创建 `package.json`（仅用于测试）**

```json
{
  "name": "wbti",
  "version": "0.1.0",
  "description": "WBTI 酒人格测试 - 你的酒人格是什么？",
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  },
  "private": true
}
```

- [ ] **Step 5: 创建 `docs/changelog.md`**

```markdown
# Changelog

## v0.1.0 (2026-06-30)
- 项目初始化
- 设计文档完成
- 实施计划完成
```

- [ ] **Step 6: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 项目脚手架（目录结构、配置、文档）"
```

预期：commit 成功，git log 显示新提交。

---

## Task 2: 数据 schema 验证（空模板）

**Files:**
- Create: `/Users/ruilin/微信小程序/data/questions.json`
- Create: `/Users/ruilin/微信小程序/data/types.json`

- [ ] **Step 1: 创建 `data/questions.json` 空 schema**

```json
{
  "_schema_note": "32 道主测试题 + 1 道饮酒分支题。每题有 id/order/dimension/pole/text",
  "main": [],
  "branch": null
}
```

- [ ] **Step 2: 创建 `data/types.json` 空 schema**

```json
{
  "_schema_note": "16 常规 + 2 隐藏人格。每人格有 code/name/cn/tagline/dimensions/writeup/wines/emoji",
  "types": [],
  "hidden": []
}
```

- [ ] **Step 3: 验证 JSON 合法**

```bash
cd /Users/ruilin/微信小程序
python3 -m json.tool data/questions.json > /dev/null
python3 -m json.tool data/types.json > /dev/null
echo "JSON 格式 OK"
```

预期：输出 "JSON 格式 OK"。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: 数据 JSON schema 空模板"
```

---

## Task 3: 32 道题数据填充 + 题序洗牌

**Files:**
- Modify: `/Users/ruilin/微信小程序/data/questions.json`

- [ ] **Step 1: 写入 32 道题（按维度分组）**

按 spec §3.3 的题目文案写入 `data/questions.json`，每题结构：

```json
{
  "id": "q1",
  "order": 1,
  "dimension": "strength",
  "pole": "H",
  "text": "我愿意为了一道菜排 30 分钟队。"
}
```

**字段说明**：
- `id`：`q1`-`q32` 编号（branch 用 `q33`）
- `order`：展示顺序（1-32），后面会洗牌
- `dimension`：4 选 1 — `strength` / `scene` / `flavor` / `rhythm`
- `pole`：该题倾向哪个极 — `H`/`L`/`S`/`T`/`F`/`M`/`C`/`N`
- `text`：题目文案

**32 题内容**（来自 spec §3.3，按维度+题号组织）：

浓度 H/L 维度（q1-q8）：
- q1: 我愿意为了一道菜排 30 分钟队。 (H)
- q2: 跳伞、蹦极、过山车这类高刺激项目，我愿意尝试。 (H)
- q3: 比起清粥小菜，我更爱浓郁厚重的食物（红烧肉、奶酪火锅）。 (H)
- q4: 我愿意为了一场演唱会飞到另一个城市。 (H)
- q5: 我喜欢一口气把事情做到极致，不喜欢慢慢摸索。 (H)
- q6: 旅行时我最爱钻进当地小馆子，连锁餐厅让我扫兴。 (H)
- q7: 我喜欢让一首歌一直单曲循环，直到听吐。 (H)
- q8: 一份清淡的沙拉，很难让我感到满足。 (H)

场景 S/T 维度（q9-q16）：
- q9: 周末夜晚，我更愿意一个人在家待着。 (S)
- q10: 我说话前会先想一下，很少插嘴。 (S)
- q11: 我有几个十年老友，比一堆饭局新朋友更让我踏实。 (S)
- q12: 比起热闹的酒吧，我更喜欢深夜一个人去居酒屋。 (S)
- q13: 出门吃饭我总爱坐包间或角落。 (S)
- q14: 深夜 12 点，我宁愿一个人安静做事。 (S)
- q15: 我很少在朋友圈发自拍。 (S)
- q16: 连续两天的聚会，会让我觉得被掏空。 (S)

风味 F/M 维度（q17-q24）：
- q17: 比起纯黑咖啡，我更爱加了奶的拿铁。 (F)
- q18: 我喜欢花香味的东西（桂花茶、玫瑰饼、茉莉香水）。 (F)
- q19: 比起 90% 的黑巧，我更爱 60% 以下的牛奶巧克力。 (F)
- q20: 我偏爱甜口的菜（江浙菜、东南亚菜、甜辣酱）。 (F)
- q21: 我闻不习惯"老派香水的浓郁麝香味"。 (F)
- q22: 比起陈年普洱的苦，我更爱水果茶的清香。 (F)
- q23: 我觉得香水太浓不好闻，清淡的水生调更适合我。 (F)
- q24: 比起浓缩咖啡的苦，我更爱奶盖的绵柔。 (F)

节奏 C/N 维度（q25-q32）：
- q25: 比起新派歌手，我更喜欢老歌。 (C)
- q26: 我买东西更看重品牌历史，而不是新潮小众。 (C)
- q27: 装修我喜欢复古/中世纪/工业风，胜过极简/未来感。 (C)
- q28: 我看电影更爱老片/经典系列，而不是新上映的片子。 (C)
- q29: 我更爱陈年/老味道，而不是新工艺的清爽。 (C)
- q30: 比起当代艺术，我更爱传统油画/水墨画。 (C)
- q31: 我比较信"老字号"，觉得经得起时间的东西更可靠。 (C)
- q32: 比起小众独立游戏，我更爱经典 IP 系列。 (C)

- [ ] **Step 2: 写入饮酒分支题**

```json
"branch": {
  "id": "q33",
  "condition": "strength_H_score >= 2",
  "text": "最近 3 个月，你有没有一次喝断片？",
  "options": {
    "A": "有过，还不止一次",
    "B": "有过一次",
    "C": "从来没有"
  },
  "trigger": {
    "A": "DRUNK",
    "B": null,
    "C": null
  }
}
```

- [ ] **Step 3: 写 Python 脚本洗牌 order 并更新 JSON**

执行（一次性脚本）：

```bash
cd /Users/ruilin/微信小程序
python3 << 'EOF'
import json, random
random.seed(42)  # 固定种子，结果可复现

with open('data/questions.json', 'r') as f:
    data = json.load(f)

# 取出 32 道题洗牌
questions = data['main']
# 维度打散：先随机排序
random.shuffle(questions)
# 更新 order 字段为新顺序
for i, q in enumerate(questions, 1):
    q['order'] = i

data['main'] = questions

with open('data/questions.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"洗牌完成。展示顺序:")
for q in data['main']:
    print(f"  {q['order']:2d}. [{q['dimension']:8s} → {q['pole']}] {q['text'][:30]}...")
EOF
```

预期：输出 32 行"洗牌后顺序"，可见 4 个维度的题目被随机打散。

- [ ] **Step 4: 验证维度分布均匀**

```bash
cd /Users/ruilin/微信小程序
python3 << 'EOF'
import json
from collections import Counter
with open('data/questions.json') as f:
    data = json.load(f)
dims = Counter(q['dimension'] for q in data['main'])
print(f"维度分布: {dict(dims)}")
assert dims['strength'] == 8, f"strength 应有 8 题，实际 {dims['strength']}"
assert dims['scene'] == 8, f"scene 应有 8 题，实际 {dims['scene']}"
assert dims['flavor'] == 8, f"flavor 应有 8 题，实际 {dims['flavor']}"
assert dims['rhythm'] == 8, f"rhythm 应有 8 题，实际 {dims['rhythm']}"
print("✓ 4 维度各 8 题，分布正确")
EOF
```

预期：输出"✓ 4 维度各 8 题，分布正确"。

- [ ] **Step 5: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 32 道题 + 饮酒分支数据填充"
```

---

## Task 4: 18 个人格数据填充

**Files:**
- Modify: `/Users/ruilin/微信小程序/data/types.json`

- [ ] **Step 1: 写入 16 常规人格数据**

按 spec §2.2 的代号表，填充每人格的完整数据。结构：

```json
{
  "code": "MALT",
  "name": "麦霸",
  "tagline": "麦芽一开口，别的都是路人。",
  "dimensions": "HSFC",
  "dimensionNames": "重·独·果·古",
  "writeup": "（200 字戏剧化文案，第二人称，你视角）",
  "wines": [
    { "name": "麦卡伦 12", "tagline": "雪莉桶的温柔", "link": "#" },
    { "name": "百龄坛 12", "tagline": "调和威士忌的稳健派", "link": "#" }
  ],
  "emoji": "🥃"
}
```

**18 篇 200 字速写写作指引**（用于 Step 2 的占位内容，后续 Step 2 会用 AI 一次性生成）：

写作风格参考 sbti（人格速写用第二人称"你"，戏剧化、带自嘲）：
- 用"你是..."开头
- 中间铺 3-4 个具体场景/比喻
- 结尾给一句"金句"标签
- 控制在 180-220 字
- 不能提到具体酒（具体酒放在 wines 字段里）

**v0.1 实现策略**：先用占位文案（每人格相同 50 字模板）让 UI 跑通，**不阻塞上线**。完整 18 篇 200 字文案由 Claude 在下一个迭代（v0.2）批量生成。

- [ ] **Step 2: 写入 16 常规人格（占位文案）**

执行（一次性脚本，写入 16 常规人格 + 2 隐藏人格的占位数据）：

```bash
cd /Users/ruilin/微信小程序
python3 << 'PYEOF'
import json

# 16 常规人格完整定义（代号/别称/一句话/维度/典型酒/emoji）
types_data = [
    {"code": "MALT",  "name": "麦霸",   "tagline": "麦芽一开口，别的都是路人。", "dim": "HSFC", "dimNames": "重·独·果·古", "wines": ["麦卡伦 12", "百龄坛 12"], "emoji": "🥃"},
    {"code": "CASK",  "name": "老炮",   "tagline": "木桶陈年是他的精神图腾。",   "dim": "HSMC", "dimNames": "重·独·木·古", "wines": ["波本桶单一麦芽", "雪利桶威士忌"], "emoji": "🥃"},
    {"code": "BOOZE", "name": "派对炸弹", "tagline": "调到凌晨 4 点，永远是他。", "dim": "HTFC", "dimNames": "重·群·果·古", "wines": ["野格", "哈瓦那俱乐部 7 年"], "emoji": "🍹"},
    {"code": "FIRE",  "name": "爆裂男孩", "tagline": "一杯下肚，桌子能掀。",     "dim": "HTMC", "dimNames": "重·群·木·古", "wines": ["茅台", "红星二锅头"], "emoji": "🔥"},
    {"code": "NEAT",  "name": "纯爷们", "tagline": "不兑水，不加冰，原味硬刚。", "dim": "HSFN", "dimNames": "重·独·果·新", "wines": ["单一麦芽纯饮", "响 17 年"], "emoji": "🥃"},
    {"code": "SMOK",  "name": "烟嗓",   "tagline": "嘴里有泥煤味的人才听得懂。", "dim": "HSMN", "dimNames": "重·独·木·新", "wines": ["拉弗格 10 年", "艾雷岛单一麦芽"], "emoji": "🌫️"},
    {"code": "TOAS",  "name": "群嗨冠军", "tagline": "干杯次数等于微信步数。",   "dim": "HTFN", "dimNames": "重·群·果·新", "wines": ["豪帅快活龙舌兰", "苦艾酒"], "emoji": "🍻"},
    {"code": "HYPE",  "name": "派对野兽", "tagline": "今晚必须朋友圈有我。",     "dim": "HTMN", "dimNames": "重·群·木·新", "wines": ["梅斯卡尔", "美格波本"], "emoji": "🎉"},
    {"code": "PEAC",  "name": "桃粉甜心", "tagline": "永远在吧台点'最可爱的那杯'。", "dim": "LSFC", "dimNames": "轻·独·果·古", "wines": ["桃红酒", "莫斯卡托"], "emoji": "🍑"},
    {"code": "JULE",  "name": "茶花女", "tagline": "一杯清酒，半盏花茶。",     "dim": "LSMC", "dimNames": "轻·独·木·古", "wines": ["纯米大吟酿", "古越龙山黄酒"], "emoji": "🍶"},
    {"code": "COOL",  "name": "阳光男孩", "tagline": "喝完跟阳光一样，洒满朋友圈。", "dim": "LSFN", "dimNames": "轻·独·果·新", "wines": ["鹅岛 IPA", "白熊啤酒"], "emoji": "🌞"},
    {"code": "ZEN",   "name": "禅意大叔", "tagline": "一壶清酒，一夜无事。",     "dim": "LSMN", "dimNames": "轻·独·木·新", "wines": ["梅乃宿梅酒", "纪土纯米吟酿"], "emoji": "🍵"},
    {"code": "PUNC",  "name": "派对甜心", "tagline": "闪光灯下永远笑得最甜。",   "dim": "LTFC", "dimNames": "轻·群·果·古", "wines": ["桃子酒", "苹果西打"], "emoji": "🎀"},
    {"code": "TIPS",  "name": "蹦迪选手", "tagline": "喝到 DJ 喊'安全回家'。",   "dim": "LTFN", "dimNames": "轻·群·果·新", "wines": ["龙舌兰日出", "B-52 轰炸机"], "emoji": "💃"},
    {"code": "CHIC",  "name": "文艺奶爸", "tagline": "周末遛娃前，先喝一杯'我的时间'。", "dim": "LTMC", "dimNames": "轻·群·木·古", "wines": ["灰皮诺", "雷司令"], "emoji": "👔"},
    {"code": "DRAM",  "name": "深夜电台", "tagline": "关上灯，打开窗，听一首老歌。", "dim": "LTMN", "dimNames": "轻·群·木·新", "wines": ["修道院啤酒", "世涛"], "emoji": "🌙"}
]

# 2 隐藏人格
hidden_data = [
    {"code": "DRUNK", "name": "酒鬼",   "tagline": "烈酒烧喉，不得不醉。",       "emoji": "🍶", "trigger": "drunk_branch_A"},
    {"code": "HHHH",  "name": "傻乐者", "tagline": "哈哈哈哈哈哈。",             "emoji": "😂", "trigger": "all_scores_below_5"}
]

# 占位 writeup（200 字占位，v0.2 由 Claude 批量生成）
placeholder_writeup = "你是这样的人：你有自己独特的节奏，有自己的坚持，有自己不容动摇的小宇宙。\n\n{tagline}\n\n但同时，你也是这场测试里最独特的一抹色彩——别人需要答案，你就是答案本身。\n\n（详细人格速写 v0.2 上线）"

# 构建完整 JSON
types_list = []
for t in types_data:
    wines = [{"name": w, "tagline": "（v0.2 补充介绍）", "link": "#"} for w in t["wines"]]
    types_list.append({
        "code": t["code"],
        "name": t["name"],
        "tagline": t["tagline"],
        "dimensions": t["dim"],
        "dimensionNames": t["dimNames"],
        "writeup": placeholder_writeup.format(tagline=t["tagline"]),
        "wines": wines,
        "emoji": t["emoji"]
    })

hidden_list = []
for h in hidden_data:
    hidden_list.append({
        "code": h["code"],
        "name": h["name"],
        "tagline": h["tagline"],
        "writeup": placeholder_writeup.format(tagline=h["tagline"]),
        "wines": [{"name": "（v0.2 补充）", "tagline": "v0.2", "link": "#"}],
        "emoji": h["emoji"],
        "trigger": h["trigger"]
    })

data = {
    "types": types_list,
    "hidden": hidden_list
}

with open('data/types.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✓ 写入 {len(types_list)} 个常规人格 + {len(hidden_list)} 个隐藏人格")
PYEOF
```

预期：输出"✓ 写入 16 个常规人格 + 2 个隐藏人格"。

- [ ] **Step 3: 验证 18 个人格 code 唯一**

```bash
cd /Users/ruilin/微信小程序
python3 << 'EOF'
import json
with open('data/types.json') as f:
    data = json.load(f)
all_codes = [t['code'] for t in data['types']] + [t['code'] for t in data['hidden']]
assert len(all_codes) == len(set(all_codes)), "code 重复!"
assert len(data['types']) == 16, f"常规人格应 16 个，实际 {len(data['types'])}"
assert len(data['hidden']) == 2, f"隐藏人格应 2 个，实际 {len(data['hidden'])}"
print(f"✓ 18 个 code 唯一，分布正确")
print(f"  常规: {', '.join(t['code'] for t in data['types'])}")
print(f"  隐藏: {', '.join(t['code'] for t in data['hidden'])}")
EOF
```

预期：输出 18 个 code 的列表。

- [ ] **Step 4: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 18 个人格数据填充（v0.1 占位文案）"
```

---

## Task 5: 计分逻辑（TDD）

**Files:**
- Create: `/Users/ruilin/微信小程序/tests/scoring.test.js`
- Create: `/Users/ruilin/微信小程序/js/core/scoring.js`

- [ ] **Step 1: 写测试 - 单题计分**

```javascript
// tests/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswer, scoreAllAnswers } from '../js/core/scoring.js';

test('scoreAnswer: A 选项 = -1', () => {
  assert.equal(scoreAnswer('A'), -1);
});

test('scoreAnswer: B 选项 = 0', () => {
  assert.equal(scoreAnswer('B'), 0);
});

test('scoreAnswer: C 选项 = +1', () => {
  assert.equal(scoreAnswer('C'), 1);
});

test('scoreAnswer: 非法选项抛错', () => {
  assert.throws(() => scoreAnswer('D'), /invalid/i);
  assert.throws(() => scoreAnswer(''), /invalid/i);
});
```

- [ ] **Step 2: 写测试 - 维度得分聚合**

```javascript
test('scoreAllAnswers: 全部选 C → 4 维度各 +8', () => {
  const answers = Array(32).fill('C');
  const scores = scoreAllAnswers(answers);
  assert.equal(scores.H, 8);
  assert.equal(scores.L, 0);  // L 是反方向
  assert.equal(scores.S, 0);
  assert.equal(scores.T, 8);
  assert.equal(scores.F, 8);
  assert.equal(scores.M, 0);
  assert.equal(scores.C, 0);
  assert.equal(scores.N, 8);
});

test('scoreAllAnswers: 全部选 A → 4 维度各 -8', () => {
  const answers = Array(32).fill('A');
  const scores = scoreAllAnswers(answers);
  assert.equal(scores.H, -8);
  assert.equal(scores.T, -8);
  assert.equal(scores.F, -8);
  assert.equal(scores.N, -8);
});

test('scoreAllAnswers: 全部选 B → 全 0', () => {
  const answers = Array(32).fill('B');
  const scores = scoreAllAnswers(answers);
  for (const k of Object.keys(scores)) {
    assert.equal(scores[k], 0, `${k} 应为 0`);
  }
});

test('scoreAllAnswers: 32 道题不全 → 抛错', () => {
  assert.throws(() => scoreAllAnswers(['A']), /32 answers/i);
  assert.throws(() => scoreAllAnswers(Array(33).fill('A')), /32 answers/i);
});
```

- [ ] **Step 3: 写测试 - 饮酒分支 H 维度得分计算**

```javascript
test('scoreAllAnswers: H 维度独立统计（用于分支触发判断）', () => {
  // q1-q8 都选 C（强重口味）
  const answers = [
    'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C',  // q1-q8 H/L
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B',  // q9-q16 S/T
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B',  // q17-q24 F/M
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'   // q25-q32 C/N
  ];
  const scores = scoreAllAnswers(answers);
  assert.equal(scores.H, 8);
  assert.equal(scores.L, 0);
});
```

- [ ] **Step 4: 运行测试，验证失败**

```bash
cd /Users/ruilin/微信小程序
node --test tests/scoring.test.js
```

预期：FAIL（因为 `scoring.js` 还没写，import 找不到模块）。

- [ ] **Step 5: 实现 `js/core/scoring.js`**

```javascript
// js/core/scoring.js
// 纯函数：单题计分 + 全题聚合

/**
 * 单题计分：A=-1, B=0, C=+1
 * @param {string} answer - 'A' | 'B' | 'C'
 * @returns {number}
 */
export function scoreAnswer(answer) {
  if (answer === 'A') return -1;
  if (answer === 'B') return 0;
  if (answer === 'C') return 1;
  throw new Error(`invalid answer: ${answer}`);
}

/**
 * 32 道题聚合到 8 个极的得分
 * 维度排布（来自 data/questions.json 实际数据）：
 * - 顺序与 pole 字段映射每题的极
 * @param {string[]} answers - 32 个 'A'/'B'/'C'
 * @returns {Object} - {H, L, S, T, F, M, C, N} 各为 -8..+8 的整数
 */
export function scoreAllAnswers(answers) {
  if (answers.length !== 32) {
    throw new Error(`expected 32 answers, got ${answers.length}`);
  }

  // 读取 question 数据以确定每题的 pole
  // 注：这里用同步 fetch 在 Node 测试里会失败，所以改为读 JSON
  // 实际生产用 ES modules import JSON
  const scores = { H: 0, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };

  // 使用内嵌的题库映射（与 data/questions.json 一致）
  // 顺序与题目的 pole 字段对齐：q1-q32
  const POLES = [
    'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H',   // q1-q8 strength
    'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S',   // q9-q16 scene
    'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F',   // q17-q24 flavor
    'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'    // q25-q32 rhythm
  ];

  for (let i = 0; i < 32; i++) {
    const score = scoreAnswer(answers[i]);
    const pole = POLES[i];
    scores[pole] += score;
  }

  return scores;
}

/**
 * 工具：判断 H 维度是否高分（≥2），用于触发饮酒分支
 * @param {Object} scores
 * @returns {boolean}
 */
export function isHighStrength(scores) {
  return scores.H >= 2;
}
```

- [ ] **Step 6: 运行测试，验证通过**

```bash
cd /Users/ruilin/微信小程序
node --test tests/scoring.test.js
```

预期：PASS，所有测试用例通过。

- [ ] **Step 7: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 计分逻辑（含 TDD 测试）"
```

---

## Task 6: 人格匹配逻辑（TDD）

**Files:**
- Create: `/Users/ruilin/微信小程序/tests/matcher.test.js`
- Create: `/Users/ruilin/微信小程序/js/core/matcher.js`

- [ ] **Step 1: 写测试 - 常规人格匹配**

```javascript
// tests/matcher.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchType } from '../js/core/matcher.js';

test('matchType: 极端重·独·果·古 → MALT', () => {
  // 全部 C：H=8, S=0, F=8, C=0
  // 但 S/T 平手时按字母表：S > T 胜
  // C/N 平手时按字母表：C > N 胜
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  // 等等：S/T 在这里 S=8 T=0，那 S 胜。但实际全 C 时是 S=0 T=8（因为 S 维度题选 C 计 T 极 +1）
  // 让我们改成更明确的：H 极最大化、其他维度也明确
  // 实际题库映射：q9-q16 是 S 极题，选 C 加 S 分，选 A 减 S 分（变成 T）
  // 等等，我们的 scoreAllAnswers 里：score = -1/0/+1，pole 字段写的是题目倾向的极
  // q9 是 S 极题：选 C 计 +1 给 S，选 A 计 -1 给 S
  // 所以全 C 时：S 维度 +8，T 不动
  // 全 A 时：S 维度 -8，T 不动
  // OK 那 matchType 测试如下：
  const allC = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.equal(matchType(allC, null), 'MALT');  // HSFC
});
```

- [ ] **Step 2: 写测试 - 全部 A 极端 → LTMN DRAM**

```javascript
test('matchType: 全 A 极 → DRAM', () => {
  // 全 A：H=-8, L=0, S=-8, T=0, F=-8, M=0, C=-8, N=0
  // 但实际上 L/T/M/N 是反向题：选 A 计 -1 给 L 极，所以 L=-8
  // 等等！我前面 scoreAllAnswers 里 POLES 写的是 ['H', 'H', ...] 表示 q1 的 pole 是 H
  // 选 C 加 H 分，选 A 减 H 分（因为 scoreAnswer('A')=-1, 加给 H）
  // 所以全 A 时 H=-8, L=0 (L 不会被加任何分)
  // 但 matcher 是看极分数最大值，不是看 L vs H
  // 全 A 时 H=-8 (负最大值是 -8)，L=0
  // 那么 H vs L 哪个胜？要看 score 高的那个
  // H=-8 < L=0，所以 L 胜！
  // 这其实是对的：全 A 表示强烈反对 H 倾向（即强烈支持 L 倾向）
  const allA = { H: -8, L: 0, S: -8, T: 0, F: -8, M: 0, C: -8, N: 0 };
  // 结果：L=T=M=N 都胜（因为 0 > -8）
  // 字母表优先：L>S>F>C（都平手，按 L>S>F>C 顺序选）
  // 等等 T 也 = 0，所以 L > T 平手处理 → L 胜
  // 维度组合：L?F?C? 应该选极值最高的：L=T=M=N=0
  // 平手时按 spec：字母表靠前的胜 → L>S>F>C → LSFC...等等不对
  // 应该选最高分极，但所有 0 平手时，需要决定
  // 我建议规则：选最匹配的极（每维度选分数最高极，平手时字母表靠前）
  // 全 A 实际：每维度两极分数是 [H=-8, L=0]，[S=-8, T=0]，[F=-8, M=0]，[C=-8, N=0]
  // 每维度 L/T/M/N 都胜（0 > -8）→ LTMC
  // 平手时字母表靠前？T 平手 N？不需要，按每维度独立比较
  const result = matchType(allA, null);
  // LTMC = CHIC
  assert.equal(result, 'CHIC');
});
```

- [ ] **Step 3: 写测试 - 隐藏人格 DRUNK 触发**

```javascript
test('matchType: 饮酒分支 A → DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.equal(matchType(scores, 'A'), 'DRUNK');
});

test('matchType: 饮酒分支 B → 不触发 DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.notEqual(matchType(scores, 'B'), 'DRUNK');
});

test('matchType: 饮酒分支 C → 不触发 DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.notEqual(matchType(scores, 'C'), 'DRUNK');
});

test('matchType: 无分支答案 → 不触发 DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.notEqual(matchType(scores, null), 'DRUNK');
});
```

- [ ] **Step 4: 写测试 - HHHH 触发**

```javascript
test('matchType: 所有常规人格最高极得分 < 5 → HHHH', () => {
  // 4 题 C + 4 题 A（每个维度）：H=0, S=0, F=0, C=0
  const balanced = { H: 0, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
  assert.equal(matchType(balanced, null), 'HHHH');
});

test('matchType: 任意一维度最高分 ≥ 5 → 不触发 HHHH', () => {
  const hasStrong = { H: 8, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
  assert.notEqual(matchType(hasStrong, null), 'HHHH');
});
```

- [ ] **Step 5: 写测试 - 平手处理**

```javascript
test('matchType: 平手时字母表靠前的极胜', () => {
  // 假设 H=L=5 平手，按规则 H 胜
  // 但实际算分时极分数可能不一样，这里构造一个明确平手场景
  const tied = { H: 5, L: 5, S: 5, T: 5, F: 5, M: 5, C: 5, N: 5 };
  // 字母表靠前：H>S>F>C → HSFC → MALT
  assert.equal(matchType(tied, null), 'MALT');
});
```

- [ ] **Step 6: 写测试 - 16 个常规人格全覆盖**

```javascript
test('matchType: 16 个常规人格代号都能匹配到（覆盖所有维度组合）', () => {
  // 4 维度 × 2 极 = 16 组合，每个都有对应人格
  const allCombos = [
    ['MALT',  'HSFC'], ['CASK',  'HSMC'], ['BOOZE', 'HTFC'], ['FIRE',  'HTMC'],
    ['NEAT',  'HSFN'], ['SMOK',  'HSMN'], ['TOAS',  'HTFN'], ['HYPE',  'HTMN'],
    ['PEAC',  'LSFC'], ['JULE',  'LSMC'], ['COOL',  'LSFN'], ['ZEN',   'LSMN'],
    ['PUNC',  'LTFC'], ['TIPS',  'LTFN'], ['CHIC',  'LTMC'], ['DRAM',  'LTMN']
  ];

  for (const [expected, dim] of allCombos) {
    const scores = { H: 0, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
    // 把对应极设高分
    for (const pole of dim) {
      scores[pole] = 8;
    }
    // 对手极设为 0
    const opposites = { H: 'L', L: 'H', S: 'T', T: 'S', F: 'M', M: 'F', C: 'N', N: 'C' };
    for (const pole of dim) {
      scores[opposites[pole]] = 0;
    }
    assert.equal(matchType(scores, null), expected, `dim=${dim} 应匹配 ${expected}`);
  }
});
```

- [ ] **Step 7: 运行测试，验证失败**

```bash
cd /Users/ruilin/微信小程序
node --test tests/matcher.test.js
```

预期：FAIL（因为 `matcher.js` 还没写）。

- [ ] **Step 8: 实现 `js/core/matcher.js`**

```javascript
// js/core/matcher.js
// 纯函数：人格匹配

// 16 常规人格维度组合 → 代号
const TYPE_DIM_TO_CODE = {
  'HSFC': 'MALT',  'HSMC': 'CASK',  'HTFC': 'BOOZE', 'HTMC': 'FIRE',
  'HSFN': 'NEAT',  'HSMN': 'SMOK',  'HTFN': 'TOAS',  'HTMN': 'HYPE',
  'LSFC': 'PEAC',  'LSMC': 'JULE',  'LSFN': 'COOL',  'LSMN': 'ZEN',
  'LTFC': 'PUNC',  'LTFN': 'TIPS',  'LTMC': 'CHIC',  'LTMN': 'DRAM'
};

// HHHH 触发阈值（spec §3.5）
const HHHH_THRESHOLD = 5;

// 维度对：极 → 对手极
const OPPOSITE = {
  H: 'L', L: 'H',
  S: 'T', T: 'S',
  F: 'M', M: 'F',
  C: 'N', N: 'C'
};

// 字母表顺序（用于平手处理：靠前者胜）
const POLE_ORDER = ['H', 'S', 'F', 'C', 'L', 'T', 'M', 'N'];

/**
 * 主函数：根据分数匹配人格代号
 * @param {Object} scores - {H, L, S, T, F, M, C, N}，范围 -8..+8
 * @param {string|null} drunkAnswer - 饮酒分支答案 'A'/'B'/'C'/null
 * @returns {string} - 18 个代号之一
 */
export function matchType(scores, drunkAnswer) {
  // 1. DRUNK 优先
  if (drunkAnswer === 'A') {
    return 'DRUNK';
  }

  // 2. HHHH 检查：每维度选最高极，最高极得分 < 5 → HHHH
  // 维度对：H vs L, S vs T, F vs M, C vs N
  const dimPairs = [['H', 'L'], ['S', 'T'], ['F', 'M'], ['C', 'N']];
  let maxPoleScore = -Infinity;

  for (const [a, b] of dimPairs) {
    const maxScore = Math.max(scores[a], scores[b]);
    if (maxScore > maxPoleScore) maxPoleScore = maxScore;
  }

  if (maxPoleScore < HHHH_THRESHOLD) {
    return 'HHHH';
  }

  // 3. 常规人格：每维度选最高极
  let resultCode = '';
  for (const [a, b] of dimPairs) {
    if (scores[a] > scores[b]) {
      resultCode += a;
    } else if (scores[b] > scores[a]) {
      resultCode += b;
    } else {
      // 平手：字母表靠前者胜
      resultCode += POLE_ORDER.includes(a) && POLE_ORDER.indexOf(a) < POLE_ORDER.indexOf(b) ? a : b;
    }
  }

  return TYPE_DIM_TO_CODE[resultCode] || 'HHHH'; // 兜底
}
```

- [ ] **Step 9: 运行测试，验证全部通过**

```bash
cd /Users/ruilin/微信小程序
node --test tests/matcher.test.js
```

预期：PASS，所有测试用例通过。

- [ ] **Step 10: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 人格匹配逻辑（含 TDD，含 DRUNK + HHHH 触发）"
```

---

## Task 7: HTML 骨架 + hash 路由

**Files:**
- Create: `/Users/ruilin/微信小程序/index.html`
- Create: `/Users/ruilin/微信小程序/css/styles.css`
- Create: `/Users/ruilin/微信小程序/js/core/data-loader.js`
- Create: `/Users/ruilin/微信小程序/js/app.js`

- [ ] **Step 1: 创建 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>WBTI 酒人格测试</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body class="bg-bg text-text font-sans antialiased">

  <!-- 顶部导航 -->
  <nav class="border-b border-amber-100 bg-white/80 backdrop-blur sticky top-0 z-10">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="#/" class="font-bold text-primary text-lg">WBTI</a>
      <div class="flex gap-4 text-sm text-gray-600">
        <a href="#/types" class="hover:text-primary">16 型</a>
        <a href="#/about" class="hover:text-primary">关于</a>
      </div>
    </div>
  </nav>

  <!-- 页面容器 -->
  <main id="app" class="max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-60px)]">
    <!-- 路由会渲染到这里 -->
    <div class="text-center text-gray-400 py-20">加载中...</div>
  </main>

  <!-- 底部友情提示 -->
  <footer class="border-t border-amber-100 mt-12">
    <div class="max-w-2xl mx-auto px-4 py-4 text-xs text-gray-400 text-center">
      WBTI 是娱乐向测试，结果仅供自娱自乐。<br>
      未成年人请勿饮酒。
    </div>
  </footer>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 `css/styles.css`**

```css
:root {
  --color-primary: #8B4513;
  --color-accent: #D4A574;
  --color-bg: #FAF7F2;
  --color-text: #2B2B2B;
  --color-hidden: #7C2D12;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

.bg-bg { background-color: var(--color-bg); }
.text-text { color: var(--color-text); }
.text-primary { color: var(--color-primary); }
.bg-primary { background-color: var(--color-primary); }
.text-accent { color: var(--color-accent); }
.bg-accent { background-color: var(--color-accent); }
.text-hidden { color: var(--color-hidden); }
.bg-hidden { background-color: var(--color-hidden); }
.border-accent { border-color: var(--color-accent); }

/* 大代号样式 */
.type-code {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: var(--color-primary);
  line-height: 1;
}

/* 隐藏人格代号 */
.type-code.hidden-type {
  color: var(--color-hidden);
}

/* 进度条动画 */
.progress-bar {
  transition: width 0.3s ease-out;
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: 创建 `js/core/data-loader.js`**

```javascript
// js/core/data-loader.js
// 数据加载（异步）

let _questions = null;
let _types = null;

async function loadQuestions() {
  if (_questions) return _questions;
  const res = await fetch('data/questions.json');
  if (!res.ok) throw new Error('加载题目失败');
  _questions = await res.json();
  return _questions;
}

async function loadTypes() {
  if (_types) return _types;
  const res = await fetch('data/types.json');
  if (!res.ok) throw new Error('加载人格数据失败');
  _types = await res.json();
  return _types;
}

async function getQuestionsByDisplayOrder() {
  const data = await loadQuestions();
  return [...data.main].sort((a, b) => a.order - b.order);
}

async function getTypeByCode(code) {
  const data = await loadTypes();
  const all = [...data.types, ...data.hidden];
  return all.find(t => t.code === code);
}

async function getAllTypes() {
  const data = await loadTypes();
  return data;
}

export { loadQuestions, loadTypes, getQuestionsByDisplayOrder, getTypeByCode, getAllTypes };
```

- [ ] **Step 4: 创建 `js/app.js`（路由）**

```javascript
// js/app.js
// 路由 + 页面切换

import { renderHome } from './pages/home.js';
import { renderTest } from './pages/test.js';
import { renderResult } from './pages/result.js';
import { renderTypes } from './pages/types.js';
import { renderAbout } from './pages/about.js';

const routes = [
  { pattern: /^\/$/, handler: renderHome },
  { pattern: /^\/test$/, handler: renderTest },
  { pattern: /^\/result$/, handler: renderResult },
  { pattern: /^\/result\/([A-Z\-]+)$/, handler: renderResult },
  { pattern: /^\/types$/, handler: renderTypes },
  { pattern: /^\/about$/, handler: renderAbout },
];

async function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const app = document.getElementById('app');

  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      app.innerHTML = '<div class="text-center text-gray-400 py-20">加载中...</div>';
      try {
        await route.handler(app, match);
      } catch (err) {
        console.error('页面渲染失败:', err);
        app.innerHTML = `<div class="text-center text-red-500 py-20">出错了：${err.message}</div>`;
      }
      return;
    }
  }

  app.innerHTML = '<div class="text-center text-gray-400 py-20">404 - 页面不存在</div>';
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);
```

- [ ] **Step 5: 创建空的 pages 文件（占位）**

为每个 page 创建一个最小文件，先让路由能跑通。

```bash
cd /Users/ruilin/微信小程序
mkdir -p js/pages
```

每个文件先放最小占位：

**js/pages/home.js**：
```javascript
export async function renderHome(app) {
  app.innerHTML = '<div class="text-center py-20"><h1 class="text-4xl font-bold">WBTI 首页（占位）</h1></div>';
}
```

**js/pages/test.js**：
```javascript
export async function renderTest(app) {
  app.innerHTML = '<div class="text-center py-20"><h1>测试页（占位）</h1></div>';
}
```

**js/pages/result.js**：
```javascript
export async function renderResult(app) {
  app.innerHTML = '<div class="text-center py-20"><h1>结果页（占位）</h1></div>';
}
```

**js/pages/types.js**：
```javascript
export async function renderTypes(app) {
  app.innerHTML = '<div class="text-center py-20"><h1>16 型（占位）</h1></div>';
}
```

**js/pages/about.js**：
```javascript
export async function renderAbout(app) {
  app.innerHTML = '<div class="text-center py-20"><h1>关于（占位）</h1></div>';
}
```

- [ ] **Step 6: 本地启动验证**

```bash
cd /Users/ruilin/微信小程序
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 2
# 浏览器自动打开 http://localhost:8000（手动验证）
echo "Server PID: $SERVER_PID"
```

预期：浏览器打开 localhost:8000，看到首页占位。访问 `/#/test`、`/#/types`、`/#/about` 都能看到对应占位文案。

- [ ] **Step 7: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: HTML 骨架 + hash 路由 + 5 页占位"
```

---

## Task 8: 首页 + 16 型索引页 + 关于页

**Files:**
- Modify: `/Users/ruilin/微信小程序/js/pages/home.js`
- Modify: `/Users/ruilin/微信小程序/js/pages/types.js`
- Modify: `/Users/ruilin/微信小程序/js/pages/about.js`

- [ ] **Step 1: 实现首页 `js/pages/home.js`**

```javascript
// js/pages/home.js
export async function renderHome(app) {
  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🍷🥃🍶</div>
        <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          MBTI 已经过时，<br>WBTI 来了。
        </h1>
        <p class="text-gray-600 mb-8 text-base md:text-lg">
          32 道看似无关的有趣题<br>
          测出你是哪种酒
        </p>
        <a href="#/test" class="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
          开始测试 →
        </a>
        <div class="mt-12 text-sm text-gray-500">
          大约需要 3 分钟 · 不注册 · 不收费
        </div>
      </div>

      <div class="mt-16 border-t border-amber-200 pt-8">
        <h2 class="text-center text-xl font-bold mb-6">🌟 16 种酒人格 🌟</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <a href="#/result/MALT" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🥃</div><div class="text-sm font-semibold mt-1">MALT 麦霸</div>
          </a>
          <a href="#/result/CASK" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🥃</div><div class="text-sm font-semibold mt-1">CASK 老炮</div>
          </a>
          <a href="#/result/BOOZE" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🍹</div><div class="text-sm font-semibold mt-1">BOOZE 派对炸弹</div>
          </a>
          <a href="#/result/FIRE" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🔥</div><div class="text-sm font-semibold mt-1">FIRE 爆裂男孩</div>
          </a>
          <a href="#/result/PEAC" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🍑</div><div class="text-sm font-semibold mt-1">PEAC 桃粉甜心</div>
          </a>
          <a href="#/result/ZEN" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🍵</div><div class="text-sm font-semibold mt-1">ZEN 禅意大叔</div>
          </a>
          <a href="#/result/TIPS" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">💃</div><div class="text-sm font-semibold mt-1">TIPS 蹦迪选手</div>
          </a>
          <a href="#/result/DRAM" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🌙</div><div class="text-sm font-semibold mt-1">DRAM 深夜电台</div>
          </a>
        </div>
        <div class="text-center mt-6">
          <a href="#/types" class="text-primary text-sm hover:underline">查看全部 16+2 型 →</a>
        </div>
      </div>

      <div class="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>友情提示：</strong>WBTI 是一款娱乐向人格测试，不构成任何医疗、诊疗或饮酒建议。未成年人请勿饮酒。
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: 实现 16 型索引页 `js/pages/types.js`**

```javascript
// js/pages/types.js
import { getAllTypes } from '../core/data-loader.js';

export async function renderTypes(app) {
  const data = await getAllTypes();
  const types = data.types;

  // 按维度分组
  const heavySolo = types.filter(t => t.dimensions.startsWith('HS'));
  const heavyTribe = types.filter(t => t.dimensions.startsWith('HT'));
  const lightSolo = types.filter(t => t.dimensions.startsWith('LS'));
  const lightTribe = types.filter(t => t.dimensions.startsWith('LT'));

  const renderGroup = (title, dim, items) => `
    <section class="mb-8">
      <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
        <span class="text-2xl">${dim.icon}</span> ${title}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        ${items.map(t => `
          <a href="#/result/${t.code}" class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
            <div class="text-3xl mb-2">${t.emoji}</div>
            <div class="font-bold text-sm">${t.code}</div>
            <div class="text-xs text-gray-500">${t.name}</div>
          </a>
        `).join('')}
      </div>
    </section>
  `;

  app.innerHTML = `
    <div class="fade-in">
      <h1 class="text-2xl md:text-3xl font-bold mb-2">WBTI 16 型</h1>
      <p class="text-sm text-gray-500 mb-6">按风格维度分组，点击查看详情</p>

      ${renderGroup('重·独处', {icon: '🌑'}, heavySolo)}
      ${renderGroup('重·群嗨', {icon: '🎉'}, heavyTribe)}
      ${renderGroup('轻·独处', {icon: '🌸'}, lightSolo)}
      ${renderGroup('轻·群嗨', {icon: '🌞'}, lightTribe)}

      <section class="mt-8 mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="font-bold text-hidden mb-3">🎁 隐藏人格（特殊触发）</h3>
        <div class="grid grid-cols-2 gap-3">
          ${data.hidden.map(t => `
            <a href="#/result/${t.code}" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all text-center border border-red-100">
              <div class="text-3xl mb-1">${t.emoji}</div>
              <div class="font-bold text-sm text-hidden">${t.code}</div>
              <div class="text-xs text-gray-500">${t.name}</div>
            </a>
          `).join('')}
        </div>
        <p class="text-xs text-gray-500 mt-3">隐藏人格需特定条件触发，正常测试不会显示</p>
      </section>
    </div>
  `;
}
```

- [ ] **Step 3: 实现关于页 `js/pages/about.js`**

```javascript
// js/pages/about.js
export async function renderAbout(app) {
  app.innerHTML = `
    <div class="fade-in prose prose-sm max-w-none">
      <h1 class="text-2xl font-bold mb-4">关于 WBTI</h1>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🌟 是什么</h2>
        <p>WBTI（Wine + Big + Type + Indicator）是一款娱乐向酒人格测试，借鉴 MBTI 和 SBTI 的 16 型人格测试结构，做了一个"测你像哪种酒"的版本。</p>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📝 怎么测</h2>
        <ol class="list-decimal pl-5 space-y-1">
          <li>32 道看似无关的有趣题（不直接谈酒）</li>
          <li>每题 3 选 1：不认同 / 中立 / 认同</li>
          <li>答完自动出结果 + 你的酒人格代号</li>
          <li>可能有 1 道额外"饮酒分支"题</li>
        </ol>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📊 计分规则</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li>32 题对应 4 个维度：浓度 / 场景 / 风味 / 节奏</li>
          <li>每维度 2 极（如浓度：重 H / 轻 L）</li>
          <li>每维度得分最高的极 → 组合成 4 字母代号</li>
          <li>查到对应的人格（如 HSFC = MALT 麦霸）</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🎁 隐藏人格</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>DRUNK 酒鬼</strong>：浓度重口味 + 饮酒分支选 A</li>
          <li><strong>HHHH 傻乐者</strong>：所有维度最高得分都 &lt; 5（即你的偏好太平均了）</li>
        </ul>
      </section>

      <section class="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h2 class="text-lg font-bold mb-2 text-primary">⚠️ 友情提示</h2>
        <p>WBTI 是娱乐向测试，结果仅供自娱自乐。<br>
        不构成任何医疗、诊疗或饮酒建议。<br>
        <strong>未成年人请勿饮酒。</strong><br>
        适量饮酒，未醉为度。</p>
      </section>

      <section class="mb-6 text-sm text-gray-500">
        <p>📮 联系：微信公众号「WBTI 酒人格」（v0.2 上线后）</p>
        <p>🛠️ v0.1 MVP · 2026-06-30</p>
      </section>
    </div>
  `;
}
```

- [ ] **Step 4: 验证 3 页正常渲染**

```bash
cd /Users/ruilin/微信小程序
python3 -m http.server 8000 &
sleep 2
# 手动验证（浏览器或 curl）
echo "Server up. 验证 /, /types, /about"
curl -s http://localhost:8000/ -o /dev/null -w "首页 HTTP %{http_code}\n"
curl -s http://localhost:8000/data/types.json -o /dev/null -w "types.json HTTP %{http_code}\n"
```

预期：HTTP 200，浏览器打开 `/#/types` 看到 16+2 人格网格，`/#/about` 看到介绍。

- [ ] **Step 5: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 首页 + 16 型索引页 + 关于页实现"
```

---

## Task 9: 测试页（单题推进 + 进度条 + 饮酒分支）

**Files:**
- Modify: `/Users/ruilin/微信小程序/js/pages/test.js`

- [ ] **Step 1: 实现测试页 `js/pages/test.js`**

```javascript
// js/pages/test.js
// 单题推进 + 进度条 + 上一题/下一题 + 饮酒分支
import { getQuestionsByDisplayOrder } from '../core/data-loader.js';
import { scoreAllAnswers, isHighStrength } from '../core/scoring.js';

let state = {
  questions: [],
  currentIdx: 0,
  answers: [], // 'A'/'B'/'C'/null
  branchAnswer: null,
  phase: 'main' // 'main' | 'branch' | 'done'
};

export async function renderTest(app) {
  // 重置 state
  state = {
    questions: await getQuestionsByDisplayOrder(),
    currentIdx: 0,
    answers: new Array(32).fill(null),
    branchAnswer: null,
    phase: 'main'
  };

  if (state.questions.length === 0) {
    app.innerHTML = '<div class="text-center text-red-500 py-20">题目加载失败</div>';
    return;
  }

  renderCurrentQuestion(app);
}

function renderCurrentQuestion(app) {
  if (state.phase === 'done') {
    finishTest();
    return;
  }

  const totalQ = state.phase === 'branch' ? 33 : 32;
  const currentNum = state.phase === 'branch' ? 33 : state.currentIdx + 1;
  const progress = (state.currentIdx / 32) * 100;

  let questionText, options, selected;

  if (state.phase === 'branch') {
    questionText = '🍷 最近 3 个月，你有没有一次喝断片？';
    options = [
      { label: 'A', text: '有过，还不止一次' },
      { label: 'B', text: '有过一次' },
      { label: 'C', text: '从来没有' }
    ];
    selected = state.branchAnswer;
  } else {
    const q = state.questions[state.currentIdx];
    questionText = q.text;
    options = [
      { label: 'A', text: '不认同' },
      { label: 'B', text: '中立' },
      { label: 'C', text: '认同' }
    ];
    selected = state.answers[state.currentIdx];
  }

  app.innerHTML = `
    <div class="fade-in">
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span>第 ${currentNum} / ${totalQ} 题</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="w-full bg-amber-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full progress-bar" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-md mb-6 min-h-[200px] flex items-center">
        <p class="text-lg leading-relaxed">${questionText}</p>
      </div>

      <div class="space-y-3 mb-6">
        ${options.map(opt => `
          <button
            data-label="${opt.label}"
            class="answer-btn w-full text-left p-4 bg-white rounded-lg border-2 transition-all
              ${selected === opt.label ? 'border-primary bg-amber-50' : 'border-gray-200 hover:border-accent'}"
          >
            <span class="font-bold text-primary mr-3">${opt.label}.</span>
            <span>${opt.text}</span>
          </button>
        `).join('')}
      </div>

      <div class="flex justify-between">
        <button id="prev-btn" class="px-6 py-3 text-gray-500 hover:text-primary disabled:opacity-30" ${state.currentIdx === 0 && state.phase === 'main' ? 'disabled' : ''}>
          ← 上一题
        </button>
        <button id="next-btn" class="px-6 py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-30" ${!selected ? 'disabled' : ''}>
          ${state.phase === 'branch' || state.currentIdx === 31 ? '提交并查看结果' : '继续'} →
        </button>
      </div>
    </div>
  `;

  // 绑定事件
  app.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.label;
      if (state.phase === 'branch') {
        state.branchAnswer = label;
      } else {
        state.answers[state.currentIdx] = label;
      }
      renderCurrentQuestion(app);
    });
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (state.phase === 'branch') {
      state.phase = 'main';
      renderCurrentQuestion(app);
    } else if (state.currentIdx > 0) {
      state.currentIdx--;
      renderCurrentQuestion(app);
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (state.phase === 'branch') {
      state.phase = 'done';
      renderCurrentQuestion(app);
      return;
    }

    if (state.currentIdx < 31) {
      state.currentIdx++;
      // 检查是否需要进入饮酒分支
      if (state.currentIdx === 32) {
        const scores = scoreAllAnswers(state.answers);
        if (isHighStrength(scores)) {
          state.phase = 'branch';
        } else {
          state.phase = 'done';
        }
      }
      renderCurrentQuestion(app);
    } else {
      // 最后一题，下一步看分支
      const scores = scoreAllAnswers(state.answers);
      if (isHighStrength(scores)) {
        state.phase = 'branch';
      } else {
        state.phase = 'done';
      }
      renderCurrentQuestion(app);
    }
  });
}

function finishTest() {
  // 把答案存到 sessionStorage，结果页读取
  sessionStorage.setItem('wbti_answers', JSON.stringify({
    answers: state.answers,
    branchAnswer: state.phase === 'branch' ? state.branchAnswer : null
  }));
  window.location.hash = '#/result';
}
```

- [ ] **Step 2: 本地手动验证**

```bash
cd /Users/ruilin/微信小程序
# 浏览器打开 http://localhost:8000/#/test
# 验证：
# - 进度条正常推进
# - 32 道题每题都能选 A/B/C
# - 上一题/继续按钮工作
# - 答完跳转 /result
```

预期：所有交互正常。

- [ ] **Step 3: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 测试页（单题推进 + 进度条 + 饮酒分支）"
```

---

## Task 10: 结果详情页

**Files:**
- Modify: `/Users/ruilin/微信小程序/js/pages/result.js`

- [ ] **Step 1: 实现结果页 `js/pages/result.js`**

```javascript
// js/pages/result.js
// 渲染人格结果详情
import { getTypeByCode } from '../core/data-loader.js';
import { scoreAllAnswers } from '../core/scoring.js';
import { matchType } from '../core/matcher.js';

export async function renderResult(app, match) {
  let typeCode = match[1]; // 来自路由的正则捕获

  // 如果是 /result 中转页，从 sessionStorage 读
  if (!typeCode) {
    const raw = sessionStorage.getItem('wbti_answers');
    if (!raw) {
      app.innerHTML = `
        <div class="text-center py-20">
          <p class="text-gray-500 mb-4">还没有测试结果</p>
          <a href="#/test" class="inline-block bg-primary text-white px-6 py-3 rounded-full">开始测试</a>
        </div>
      `;
      return;
    }
    const { answers, branchAnswer } = JSON.parse(raw);
    const scores = scoreAllAnswers(answers);
    typeCode = matchType(scores, branchAnswer);
    // 跳转到具体人格详情
    window.location.hash = `#/result/${typeCode}`;
    return;
  }

  const type = await getTypeByCode(typeCode);
  if (!type) {
    app.innerHTML = `<div class="text-center text-red-500 py-20">找不到人格：${typeCode}</div>`;
    return;
  }

  const isHidden = typeCode === 'DRUNK' || typeCode === 'HHHH';

  // 4 维指纹（用 sessionStorage 里的分数）
  let dimensionBars = '';
  if (!isHidden) {
    const raw = sessionStorage.getItem('wbti_answers');
    if (raw) {
      const { answers } = JSON.parse(raw);
      const scores = scoreAllAnswers(answers);
      const dimNames = {
        H: '浓度·重', L: '浓度·轻',
        S: '场景·独', T: '场景·群',
        F: '风味·果', M: '风味·木',
        C: '节奏·古', N: '节奏·新'
      };
      // 每维度选最高极展示百分比
      const pairs = [['H', 'L'], ['S', 'T'], ['F', 'M'], ['C', 'N']];
      dimensionBars = pairs.map(([a, b]) => {
        const maxScore = Math.max(scores[a], scores[b]);
        const winner = scores[a] >= scores[b] ? a : b;
        const pct = Math.abs(maxScore) / 8 * 100;
        return `
          <div class="flex items-center gap-3">
            <div class="w-20 text-sm text-gray-600">${dimNames[winner]}</div>
            <div class="flex-1 bg-amber-100 rounded-full h-3">
              <div class="bg-primary h-3 rounded-full progress-bar" style="width: ${pct}%"></div>
            </div>
            <div class="w-12 text-sm text-gray-500 text-right">${Math.round(pct)}%</div>
          </div>
        `;
      }).join('');
    }
  }

  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center mb-8 ${isHidden ? 'text-hidden' : ''}">
        <div class="type-code ${isHidden ? 'hidden-type' : ''}">${type.code}</div>
        <div class="text-3xl mt-2 mb-1">${type.emoji}</div>
        <div class="text-xl font-bold mt-2">${type.name}</div>
        ${!isHidden ? `<div class="text-sm text-gray-500 mt-1">${type.dimensions} · ${type.dimensionNames}</div>` : ''}
      </div>

      <div class="text-center italic text-lg text-gray-700 mb-8 px-4 py-3 bg-amber-50 rounded-lg">
        "${type.tagline}"
      </div>

      <section class="bg-white rounded-xl p-6 shadow-md mb-6">
        <h3 class="font-bold mb-3 text-primary">📝 人格速写</h3>
        <div class="text-gray-700 leading-relaxed whitespace-pre-line">${type.writeup}</div>
      </section>

      ${type.wines && type.wines.length ? `
        <section class="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 class="font-bold mb-3 text-primary">🍷 你喝的酒</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${type.wines.map(w => `
              <a href="${w.link}" class="block bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-4 transition-all">
                <div class="font-bold text-primary">${w.name}</div>
                <div class="text-xs text-gray-500 mt-1">${w.tagline}</div>
              </a>
            `).join('')}
          </div>
          <p class="text-xs text-gray-400 mt-3 text-center">v0.1 占位 · v0.2 接真实链接</p>
        </section>
      ` : ''}

      ${dimensionBars ? `
        <section class="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 class="font-bold mb-4 text-primary">📊 你的 4 维指纹</h3>
          <div class="space-y-3">
            ${dimensionBars}
          </div>
        </section>
      ` : ''}

      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700 mb-6">
        <strong>⚠️ 友情提示：</strong>WBTI 是娱乐向测试，结果仅供自娱自乐。未成年人请勿饮酒。
      </div>

      <div class="flex gap-3 justify-center">
        <button id="share-btn" class="px-6 py-3 bg-accent text-white rounded-full font-semibold hover:opacity-90">
          📤 分享给朋友
        </button>
        <a href="#/test" class="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:opacity-90">
          🔄 再测一次
        </a>
      </div>
    </div>
  `;

  // 分享按钮（v0.1 基础版：复制文案到剪贴板）
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareText = `我测出 WBTI 是【${type.code} ${type.name}】——${type.tagline}\n你也来测一下：https://wbti.vercel.app/`;
      navigator.clipboard.writeText(shareText).then(() => {
        shareBtn.textContent = '✅ 已复制';
        setTimeout(() => { shareBtn.textContent = '📤 分享给朋友'; }, 2000);
      });
    });
  }
}
```

- [ ] **Step 2: 本地手动验证**

```bash
cd /Users/ruilin/微信小程序
# 完成一次完整测试（选 C/C/C/C/.../C 全认同），查看结果页
# 验证：
# - 大代号 MALT 显示
# - 人格速写、酒卡、4 维指纹、友情提示都正常
# - 再测一次按钮跳回 /test
# - 分享按钮复制文案
```

预期：所有元素正常渲染。

- [ ] **Step 3: 提交**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "feat: 结果详情页（人格速写 + 4 维指纹 + 酒卡 + 分享）"
```

---

## Task 11: 整体流程验收（18 人格路径 + 移动端）

**Files:**
- Modify: 各种（按需修复）

- [ ] **Step 1: 在 matcher.test.js 追加端到端测试**

打开 `/Users/ruilin/微信小程序/tests/matcher.test.js`，在文件末尾追加 18 人格端到端测试：

```javascript
test('matchType: 18 人格端到端覆盖（16 常规 + DRUNK + HHHH）', () => {
  const cases = [
    // 16 常规
    { code: 'MALT',  scores: {H:8,L:0,S:8,T:0,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'CASK',  scores: {H:8,L:0,S:8,T:0,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'BOOZE', scores: {H:8,L:0,S:0,T:8,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'FIRE',  scores: {H:8,L:0,S:0,T:8,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'NEAT',  scores: {H:8,L:0,S:8,T:0,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'SMOK',  scores: {H:8,L:0,S:8,T:0,F:0,M:8,C:0,N:8}, drunk: null },
    { code: 'TOAS',  scores: {H:8,L:0,S:0,T:8,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'HYPE',  scores: {H:8,L:0,S:0,T:8,F:0,M:8,C:0,N:8}, drunk: null },
    { code: 'PEAC',  scores: {H:0,L:8,S:8,T:0,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'JULE',  scores: {H:0,L:8,S:8,T:0,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'COOL',  scores: {H:0,L:8,S:8,T:0,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'ZEN',   scores: {H:0,L:8,S:8,T:0,F:0,M:8,C:0,N:8}, drunk: null },
    { code: 'PUNC',  scores: {H:0,L:8,S:0,T:8,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'TIPS',  scores: {H:0,L:8,S:0,T:8,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'CHIC',  scores: {H:0,L:8,S:0,T:8,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'DRAM',  scores: {H:0,L:8,S:0,T:8,F:0,M:8,C:0,N:8}, drunk: null },
    // DRUNK 触发：H 高分 + 饮酒分支 A
    { code: 'DRUNK', scores: {H:8,L:0,S:0,T:0,F:0,M:0,C:0,N:0}, drunk: 'A' },
    // HHHH 触发：4 维所有极得分都 < 5
    { code: 'HHHH',  scores: {H:0,L:0,S:0,T:0,F:0,M:0,C:0,N:0}, drunk: null }
  ];

  for (const c of cases) {
    assert.equal(matchType(c.scores, c.drunk), c.code, `期望 ${c.code}`);
  }
});
```

- [ ] **Step 2: 运行全部测试**

```bash
cd /Users/ruilin/微信小程序
npm test
```

预期：所有测试 PASS（包括 scoring + matcher + 18 人格端到端）。

- [ ] **Step 2: 浏览器手动跑一次完整流程**

```bash
# 在浏览器里：
# 1. 打开 /  → 看到首页
# 2. 点开始测试 → 进入 /test
# 3. 答完 32 题（最后一题选 C） → 进入分支题
# 4. 分支题选 A → 跳到 /result/DRUNK（隐藏人格）
# 5. 验证结果页正常
# 6. 点再测一次 → 回到 /test
# 7. 全程在移动端尺寸（375px 宽）下检查布局
```

- [ ] **Step 3: 修复验收中发现的问题**

如果发现问题，在这个 task 里修，按需 commit：

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "fix: 验收修复（具体问题）"
```

- [ ] **Step 4: 提交验收记录**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "test: 18 人格路径 + 移动端布局验收通过"
```

---

## Task 12: Vercel 部署 + 上线验证

**Files:**
- Modify: (可选) `vercel.json`
- Create: `DEPLOY.md`（部署说明）

- [ ] **Step 1: 创建 DEPLOY.md 部署说明**

```markdown
# Vercel 部署步骤

## 一次性准备

1. 注册 Vercel 账号：https://vercel.com/signup（用 GitHub 登录）
2. 安装 Vercel CLI（可选）：
   ```bash
   npm i -g vercel
   ```

## 部署方式 A（推荐：GitHub 集成）

1. 把代码推到 GitHub：
   ```bash
   cd /Users/ruilin/微信小程序
   # 如果还没有 GitHub 仓库，先在 GitHub 网站创建一个空仓库，然后：
   git remote add origin https://github.com/你的用户名/wbti.git
   git branch -M main
   git push -u origin main
   ```

2. 在 Vercel 网页（https://vercel.com/new）选 "Import Project"
3. 选你的 GitHub 仓库，framework 选 "Other"
4. 点 Deploy

## 部署方式 B（CLI）

```bash
cd /Users/ruilin/微信小程序
vercel --prod
```

按提示登录 + 选项目。

## 部署后

- 默认域名：`https://wbti-xxx.vercel.app`
- 可在 Vercel 后台绑定自定义域名（如 `wbti.cn`）

## 验证清单

部署后访问：
- [ ] 首页正常加载
- [ ] /test 能开始测试
- [ ] /types 显示 16+2 人格
- [ ] /about 显示介绍
- [ ] 完成一次完整测试能看到结果
- [ ] 移动端尺寸正常
```

- [ ] **Step 2: 推送代码到 GitHub**

```bash
cd /Users/ruilin/微信小程序
# 如果用户还没建 GitHub 仓库，提示用户先建
# 然后：
git remote add origin https://github.com/USER/wbti.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: 在 Vercel 网页完成部署**

（手动操作，Claude 不直接访问 Vercel）
- 登录 vercel.com
- Import Project 选 wbti 仓库
- Framework: Other
- Deploy

- [ ] **Step 4: 部署后验证**

```bash
# 访问 https://wbti-xxx.vercel.app/
# 验证 5 页都正常
curl -s -o /dev/null -w "首页 HTTP %{http_code}\n" https://wbti-xxx.vercel.app/
curl -s -o /dev/null -w "数据 HTTP %{http_code}\n" https://wbti-xxx.vercel.app/data/questions.json
curl -s -o /dev/null -w "类型 HTTP %{http_code}\n" https://wbti-xxx.vercel.app/data/types.json
```

预期：所有 HTTP 200。

- [ ] **Step 5: 提交部署文档**

```bash
cd /Users/ruilin/微信小程序
git add -A
git commit -m "docs: Vercel 部署说明"
```

---

## 上线前最终验收清单（完成所有 task 后过一遍）

- [ ] **功能**：
  - [ ] 首页能进入测试
  - [ ] 32 道题全部能答 + 进度条正常
  - [ ] 饮酒分支触发条件正确（H ≥ 2 才出现）
  - [ ] 18 个人格结果都能正常跳转
  - [ ] 4 维指纹渲染正确
  - [ ] 酒卡占位链接（#）可点击但不跳转

- [ ] **数据**：
  - [ ] 题目顺序固定（seed=42）
  - [ ] 4 维度各 8 题
  - [ ] 18 人格 code 唯一

- [ ] **测试**：
  - [ ] `npm test` 全部通过（计分 + 匹配）
  - [ ] 18 人格路径自动化测试全部通过

- [ ] **视觉**：
  - [ ] 主题色 `#8B4513` 应用到按钮/强调
  - [ ] 隐藏人格用 `#7C2D12`
  - [ ] 移动端（375px）布局不溢出

- [ ] **免责**：
  - [ ] 底部友情提示每页都可见
  - [ ] 关于页有完整的免责声明

- [ ] **部署**：
  - [ ] Vercel 子域名可访问
  - [ ] 5 个页面 + 数据 JSON 都能访问

---

## 下一步（v0.2+ 计划）

- [ ] 18 篇 200 字人格速写由 Claude 批量生成替换占位
- [ ] 16 张 AI 生成低多边形角色图（Midjourney/即梦）
- [ ] 酒卡接小红书/知乎酒评文章链接
- [ ] 分享卡片带生成图片（html2canvas）
- [ ] 微信小程序化
- [ ] 公众号打通

---

**Plan 版本**: v0.1
**创建日期**: 2026-06-30
**依赖文档**: `/Users/ruilin/微信小程序/docs/superpowers/specs/2026-06-30-酒人格测试-wbti-design.md`