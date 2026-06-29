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

## 部署到 Vercel

v0.1 MVP 是纯静态 HTML（hash 路由 SPA），部署只要 1 个 GitHub 仓库 + Vercel 网页点几下。

完整步骤见 [DEPLOY.md](./DEPLOY.md)。

简要：
1. 注册 Vercel（https://vercel.com/signup），用 GitHub 登录
2. 推送到 GitHub：`git remote add origin https://github.com/你的用户名/wbti.git && git push -u origin main`
3. Vercel 网页 Import Project → Framework 选 Other → Deploy

> **关于此部署**：Claude 完成了 `vercel.json` 配置 + `DEPLOY.md` 文档，但 Vercel 账号登录、GitHub 仓库绑定、网页点击 Import Project 等步骤需要你手动操作。

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