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