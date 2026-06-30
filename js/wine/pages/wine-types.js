// js/wine/pages/wine-types.js
// 红酒版 18 型索引：按 4 维组合前两位分组（单宁·酸度）

import { getAllTypes } from '../core/data-loader.js';

export async function renderTypes(app) {
  const data = await getAllTypes();
  const types = data.types;

  // 按单宁·酸度 分组
  const groups = {
    TA: { title: '强单宁 · 高酸', icon: '⚔️', items: [] },
    TC: { title: '强单宁 · 低酸', icon: '🛡️', items: [] },
    SA: { title: '弱单宁 · 高酸', icon: '🌿', items: [] },
    SC: { title: '弱单宁 · 低酸', icon: '🍬', items: [] },
  };
  types.forEach(t => {
    const key = t.dimensions.slice(0, 2);
    if (groups[key]) groups[key].items.push(t);
  });

  const renderGroup = (g) => `
    <section class="mb-8">
      <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
        <span class="text-2xl">${g.icon}</span> ${g.title}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        ${g.items.map(t => `
          <a href="#/result/${t.code}" class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
            <div class="font-mono font-bold text-primary text-lg">${t.code}</div>
            <div class="text-sm text-gray-800">${t.name}</div>
            <div class="text-xs text-gray-500 mt-1">${t.subtitle || ''}</div>
          </a>
        `).join('')}
      </div>
    </section>
  `;

  app.innerHTML = `
    <div class="fade-in">
      <h1 class="text-2xl md:text-3xl font-bold mb-2 text-primary">WBTI·Red 18 型</h1>
      <p class="text-sm text-gray-500 mb-6">按单宁·酸度两个维度分组，点击查看详情</p>

      ${renderGroup(groups.TA)}
      ${renderGroup(groups.TC)}
      ${renderGroup(groups.SA)}
      ${renderGroup(groups.SC)}

      <section class="mt-8 mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="font-bold text-hidden mb-3">🎁 隐藏人格（特殊触发）</h3>
        <div class="grid grid-cols-2 gap-3">
          ${data.hidden.map(t => `
            <a href="#/result/${t.code}" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all text-center border border-red-100">
              <div class="font-mono font-bold text-hidden text-lg">${t.code}</div>
              <div class="text-sm text-gray-800">${t.name}</div>
              <div class="text-xs text-gray-500 mt-1">${t.subtitle || ''}</div>
            </a>
          `).join('')}
        </div>
        <p class="text-xs text-gray-500 mt-3">隐藏人格需特定条件触发：4 维都极端 → VINT 老饕 / 4 维都中庸 → BLEN 调酒师</p>
      </section>
    </div>
  `;
}