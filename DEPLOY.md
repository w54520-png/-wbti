# Vercel 部署步骤

> WBTI v0.1 MVP 上线指南。Claude 已完成代码 + 测试 + 配置工作；**Vercel 账号登录、GitHub 仓库绑定、网页点击 Import Project 等需用户手动操作**（Claude 无法访问 Vercel/你的 GitHub 账户）。

## 项目当前部署就绪状态

- 仓库 HEAD：`0921de2`（v0.1 MVP 完整功能）
- 21 文件交付齐全，21/21 测试通过
- `vercel.json` 已就绪（SPA hash 路由友好）
- 无 `git remote`（待用户配置 GitHub 仓库 URL）

## 一次性准备

1. 注册 Vercel 账号：https://vercel.com/signup（推荐**用 GitHub 登录**，后面部署最省事）
2. （可选）安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

## 部署方式 A（推荐：GitHub 集成）

### A1. 把代码推到 GitHub

```bash
cd /Users/ruilin/微信小程序

# 在 GitHub 网站 (https://github.com/new) 创建一个空仓库，命名为 wbti（不要勾选任何初始化选项）
# 然后执行：

git remote add origin https://github.com/你的用户名/wbti.git
git branch -M main
git push -u origin main
```

> **需要用户手动操作**：去 GitHub 建空仓库，把上面 `你的用户名` 换成自己的 GitHub 用户名。Claude 无法替你登录 GitHub 创建仓库。

### A2. 在 Vercel 网页完成导入

打开 https://vercel.com/new → **Import Project**。

- 选 `你的用户名/wbti` 仓库
- Framework Preset：**Other**（这是一个纯静态 HTML，单页 hash 路由，无需构建）
- Root Directory：留空
- Build Command：留空
- Output Directory：留空（Vercel 默认会识别根目录的 `index.html`）

点 **Deploy**。首次部署约 30~60 秒。

### A3. 等部署完成

部署成功后 Vercel 会分配一个域名，形如 `https://wbti-<你的用户名>.vercel.app`。打开它应该看到首页。

## 部署方式 B（Vercel CLI）

适合不想走 GitHub 集成、直接从本地推的情况。

```bash
cd /Users/ruilin/微信小程序
vercel login        # 第一次登录（需要交互式）
vercel --prod       # 部署到生产环境
```

按提示：
- `Set up and deploy?` → Yes
- `Which scope?` → 选你的账号
- `Link to existing project?` → No
- `Project name?` → wbti（可自定义）
- `In which directory is your code located?` → 直接回车（根目录）

## vercel.json 配置说明

当前 `/Users/ruilin/微信小程序/vercel.json`：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

### 为什么这样配置？

WBTI 是 **hash 路由 SPA**（`/#/test`、`/#/result/code`），所有路由都在前端 `window.location.hash` 解析，**永远不会触发后端 404**。

- `cleanUrls: true` → 美化 URL（如 `/data/types.json` 直接访问，不需要 `.html` 后缀）
- `trailingSlash: false` → 关闭尾斜杠重定向，避免 Vercel 误把 `/test` 当文件路径而返回 404
- `Cache-Control: max-age=0, must-revalidate` → 每次部署后立即看到新版本，避免 CDN 缓存旧静态资源

### 为什么不需要 `rewrites`？

其它纯静态 SPA（如 React Router 的 history 模式）需要在 vercel.json 加：

```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

来兜底所有未知路径返回 `index.html`。**但 WBTI 用 hash 路由不需要** —— 浏览器永远从 `/` 加载 `index.html`，前端脚本解析 `#/xxx`。所以 `rewrites` 反而会干扰静态资源请求。

## 部署后验证清单

部署后访问 `https://wbti-<你的用户名>.vercel.app/`：

### 功能验证（手动）

- [ ] 首页（`/`）正常加载，能看到「开始测试」按钮
- [ ] 点「开始测试」进入 `/test`，第一题正常显示
- [ ] 32 道题全部能答完，进度条正常推进
- [ ] 饮酒分支题（H ≥ 2 时）正确触发
- [ ] 完成测试后跳到 `/result/<code>`，能看到人格速写 + 4 维指纹 + 酒卡
- [ ] `/types` 页面显示 16+2 共 18 个人格卡片
- [ ] `/about` 显示完整介绍 + 免责声明
- [ ] 移动端尺寸（375px 宽）布局不溢出

### HTTP 验证（curl）

```bash
DOMAIN="https://wbti-你的用户名.vercel.app"

curl -s -o /dev/null -w "首页 HTTP %{http_code}\n" $DOMAIN/
curl -s -o /dev/null -w "题目 HTTP %{http_code}\n" $DOMAIN/data/questions.json
curl -s -o /dev/null -w "人格 HTTP %{http_code}\n" $DOMAIN/data/types.json
```

预期：所有 **HTTP 200**。

### 自动化测试

部署不改变功能，但在本地再跑一遍保险：

```bash
cd /Users/ruilin/微信小程序
npm test
```

预期：21/21 通过。

## 部署后

### 默认域名

- Vercel 默认域名：`https://wbti-<你的用户名>.vercel.app`
- 自动 HTTPS（Let's Encrypt）
- 每次 `git push` 后自动重新部署（方式 A）

### 自定义域名（可选）

在 Vercel 项目后台 `Settings > Domains` 添加 `wbti.cn` 等域名，按提示配 DNS。本文档不展开。

## 常见问题

### Q: 部署后页面是 Vercel 的 404？

**A**: 99% 的情况是 Root Directory 不对。检查 Vercel 项目设置，**Root Directory 必须是空的**（默认项目根）。或 `index.html` 没被 Vercel 识别为入口 —— 检查 `Build & Development Settings` 里 `Output Directory` 是空。

### Q: 静态资源 404？

**A**: 浏览器 Network 面板看下哪个文件 404。大概率是路径大小写问题（Vercel Linux 文件系统区分大小写）。检查 `/Users/ruilin/微信小程序/data/` 下文件实际命名 vs 代码里引用。

### Q: 改了代码没生效？

**A**: 默认 Cache-Control 是 `max-age=0, must-revalidate`，应该立即生效。如果还是旧版：
- 强制刷新：`Ctrl + Shift + R`（Mac: `Cmd + Shift + R`）
- Vercel 后台确认最新 deployment 是 `Ready` 状态

### Q: 本地能跑，部署后报错？

**A**: 检查浏览器 Console。大概率是路径问题（本地用 `/`、`/data/` 访问，Vercel 子路径下要改相对路径或用 `./`）。v0.1 MVP 的代码已统一使用相对路径。

## 上线后下一步（v0.2+）

不在本次部署范围，但供参考：

- 18 篇 200 字人格速写由 Claude 批量生成替换占位
- 16 张 AI 生成低多边形角色图（Midjourney/即梦）
- 酒卡接小红书/知乎酒评文章链接
- 分享卡片带生成图片（html2canvas）
- 微信小程序化
- 公众号打通

---

**本文档版本**：v0.1（2026-06-30）
**配套**：[README.md](./README.md)、[vercel.json](./vercel.json)
