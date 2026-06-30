// js/app.js
// 路由 + 页面切换

import { renderHome } from './pages/home.js';
import { renderTest } from './pages/test.js';
import { renderResult } from './pages/result.js';
import { renderTypes } from './pages/types.js';
import { renderAbout } from './pages/about.js';
import { renderAdmin } from './pages/admin.js';

const routes = [
  { pattern: /^\/$/, handler: renderHome },
  { pattern: /^\/test$/, handler: renderTest },
  { pattern: /^\/result$/, handler: renderResult },
  { pattern: /^\/result\/([A-Z\-]+)$/, handler: renderResult },
  { pattern: /^\/types$/, handler: renderTypes },
  { pattern: /^\/about$/, handler: renderAbout },
  { pattern: /^\/admin$/, handler: renderAdmin },
];

async function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  // 忽略 hash 后的 query string（例如 /test?v=2 用于硬刷绕过缓存）
  const cleanHash = hash.split('?')[0];
  const app = document.getElementById('app');

  for (const route of routes) {
    const match = cleanHash.match(route.pattern);
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
