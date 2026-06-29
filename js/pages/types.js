// js/pages/types.js
// 16 型索引页：按维度分组（重·独/重·群/轻·独/轻·群）+ 隐藏人格独立区块

import { getAllTypes } from '../core/data-loader.js';

export async function renderTypes(app) {
  const data = await getAllTypes();
  const types = data.types;

  // 按维度前两位分组（浓度·场景）
  const heavySolo = types.filter(t => t.dimensions.startsWith('HS'));
  const heavyTribe = types.filter(t => t.dimensions.startsWith('HT'));
  const lightSolo = types.filter(t => t.dimensions.startsWith('LS'));
  const lightTribe = types.filter(t => t.dimensions.startsWith('LT'));

  const renderGroup = (title, icon, items) => `
    <section class="mb-8">
      <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
        <span class="text-2xl">${icon}</span> ${title}
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

      ${renderGroup('重·独处', '🌑', heavySolo)}
      ${renderGroup('重·群嗨', '🎉', heavyTribe)}
      ${renderGroup('轻·独处', '🌸', lightSolo)}
      ${renderGroup('轻·群嗨', '🌞', lightTribe)}

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
