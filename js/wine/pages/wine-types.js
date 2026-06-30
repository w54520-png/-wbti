// js/wine/pages/wine-types.js
// 红酒版 18 型索引：按"浓度×敏锐"前两位分组
// 不暴露主题，只展示性格代号 + 中文名

import { getAllTypes } from '../core/data-loader.js';

export async function renderTypes(app) {
  const data = await getAllTypes();
  const types = data.types;

  // 按浓度·敏锐分组（4 字母前两位）
  const groups = {
    TA: { title: '重 · 挑', icon: '⚔️', items: [] },
    TC: { title: '重 · 钝', icon: '🛡️', items: [] },
    SA: { title: '轻 · 挑', icon: '🌿', items: [] },
    SC: { title: '轻 · 钝', icon: '🍬', items: [] },
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
      <h1 class="text-2xl md:text-3xl font-bold mb-2 text-primary">18 种性格</h1>
      <p class="text-sm text-gray-500 mb-6">按浓度·敏锐两个维度分组，点击查看详情</p>

      ${renderGroup(groups.TA)}
      ${renderGroup(groups.TC)}
      ${renderGroup(groups.SA)}
      ${renderGroup(groups.SC)}

      <section class="mt-8 mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="font-bold text-hidden mb-3">🎁 隐藏性格（特殊触发）</h3>
        <div class="grid grid-cols-2 gap-3">
          ${data.hidden.map(t => `
            <a href="#/result/${t.code}" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all text-center border border-red-100">
              <div class="font-mono font-bold text-hidden text-lg">${t.code}</div>
              <div class="text-sm text-gray-800">${t.name}</div>
              <div class="text-xs text-gray-500 mt-1">${t.subtitle || ''}</div>
            </a>
          `).join('')}
        </div>
        <p class="text-xs text-gray-500 mt-3">隐藏性格需特定条件触发：4 维都赞同 → 酒仙 / 4 维都中庸 → 百搭</p>
      </section>
    </div>
  `;
}