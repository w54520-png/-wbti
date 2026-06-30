// js/pages/admin.js
// Admin 审阅页面：列出所有题目、维度极、对应人格
// 路径：/#/admin（不在首页导航暴露，仅内部使用）

import { getQuestionsByDisplayOrder, getAllTypes } from '../core/data-loader.js';

// 维度对（用于展示维度组合胜出规则）
const DIM_PAIRS = [
  { a: 'H', b: 'L', name: '浓度', desc: { H: '重口味', L: '清淡' } },
  { a: 'S', b: 'T', name: '场景', desc: { S: '独处',   T: '群嗨' } },
  { a: 'F', b: 'M', name: '风味', desc: { F: '果香',   M: '木桶' } },
  { a: 'C', b: 'N', name: '节奏', desc: { C: '古典',   N: '新潮' } }
];

// 计分规则说明
const SCORE_RULE = { A: -1, B: 0, C: +1 };

export async function renderAdmin(app) {
  const questions = await getQuestionsByDisplayOrder();
  const typesData = await getAllTypes();
  const types = typesData.types;
  const hidden = typesData.hidden;

  // 题目的维度分布统计
  const dimCount = { strength: 0, scene: 0, flavor: 0, rhythm: 0 };
  questions.forEach(q => { dimCount[q.dimension]++; });

  // 列出 18 人格，按维度组合排序
  const allTypes = [...types, ...hidden];
  const typesByDim = {};
  types.forEach(t => {
    if (!typesByDim[t.dimensions]) typesByDim[t.dimensions] = [];
    typesByDim[t.dimensions].push(t);
  });

  app.innerHTML = `
    <div class="fade-in">
      <div class="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
        <h1 class="text-2xl font-bold text-primary mb-1">🔧 WBTI Admin 审阅</h1>
        <p class="text-sm text-gray-700">内部页面 · 不对外发布 · 列出题库/人格映射/计分规则</p>
        <p class="text-xs text-gray-500 mt-2">访问路径：<code class="bg-white px-1 rounded">/#/admin</code></p>
      </div>

      <!-- 1. 计分规则 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">📐 计分规则</h2>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div class="bg-amber-50 p-3 rounded text-center"><span class="font-bold text-primary">A</span> = -1（不认同）</div>
          <div class="bg-amber-50 p-3 rounded text-center"><span class="font-bold text-primary">B</span> = 0（中立）</div>
          <div class="bg-amber-50 p-3 rounded text-center"><span class="font-bold text-primary">C</span> = +1（认同）</div>
        </div>
        <div class="mt-3 text-sm text-gray-600">
          每题得分加给该题对应的「极」。例：q1 pole=H，选 C 则 <code>H+1</code>；选 A 则 <code>H-1</code>。
          每维度 8 题，最终 8 个极各得 -8..+8。
        </div>
        <div class="mt-3 text-sm">
          <strong>4 维度 8 极：</strong>
          ${DIM_PAIRS.map(p => `
            <span class="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mt-1">
              ${p.name}: <code>${p.a}=${p.desc[p.a]}</code> vs <code>${p.b}=${p.desc[p.b]}</code>
            </span>
          `).join('')}
        </div>
      </section>

      <!-- 2. 维度分布 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">📊 维度分布统计</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          ${Object.entries(dimCount).map(([dim, count]) => `
            <div class="bg-amber-50 p-3 rounded">
              <div class="text-2xl font-bold text-primary">${count}</div>
              <div class="text-xs text-gray-600">${dim}</div>
            </div>
          `).join('')}
        </div>
        <div class="mt-3 text-sm text-gray-600">
          ⚠️ 检查是否有维度/题型过于集中（用户反馈 flavor 偏食物/饮品，rhythm 偏新旧对比）
        </div>
      </section>

      <!-- 3. 32 道题详细列表 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">📝 32 道题详细（按 display order）</h2>
        <div class="space-y-2">
          ${questions.map(q => {
            // 这道题如果用户选 A/B/C，分别加给哪个极多少分
            const cellStyle = "border border-gray-200 px-2 py-1 text-center";
            return `
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-gray-50 px-3 py-2 flex items-center justify-between text-xs">
                  <span class="font-mono text-gray-500">#${q.order}</span>
                  <span class="px-2 py-0.5 bg-primary text-white rounded">${q.dimension}</span>
                  <span class="px-2 py-0.5 bg-accent text-white rounded font-mono">pole=${q.pole}</span>
                </div>
                <div class="p-3">
                  <p class="text-sm text-gray-800">${q.text}</p>
                  <table class="w-full mt-2 text-xs">
                    <thead>
                      <tr class="text-gray-500">
                        <th class="${cellStyle}">选 A → ${q.pole} -1</th>
                        <th class="${cellStyle}">选 B → 不计分</th>
                        <th class="${cellStyle}">选 C → ${q.pole} +1</th>
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- 4. 极 → 人格映射 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">🎯 极组合 → 人格映射（4 字母 → code）</h2>
        <p class="text-xs text-gray-500 mb-3">每维度选最高极 → 拼成 4 字母代号 → 查表得人格。HHHH 触发：4 维度最高分都 &lt; 5。</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${types.map(t => `
            <a href="#/result/${t.code}" class="block bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-3 text-center transition-all">
              <div class="text-3xl mb-1">${t.emoji}</div>
              <div class="font-mono font-bold text-primary">${t.code}</div>
              <div class="text-xs text-gray-600">${t.name}</div>
              <div class="text-xs font-mono text-gray-400 mt-1">${t.dimensions}</div>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- 5. 维度组合热力图（文字版）-->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">🗺️ 16 常规人格 · 按浓度×场景分组</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${['HS', 'HT', 'LS', 'LT'].map(group => {
            const groupName = {
              HS: '重·独处', HT: '重·群嗨', LS: '轻·独处', LT: '轻·群嗨'
            }[group];
            const icon = { HS: '🌑', HT: '🎉', LS: '🌸', LT: '🌞' }[group];
            const items = typesByDim[group + 'FC'] || [];
            const items2 = typesByDim[group + 'MC'] || [];
            const items3 = typesByDim[group + 'FN'] || [];
            const items4 = typesByDim[group + 'MN'] || [];
            return `
              <div class="bg-amber-50 rounded-lg p-3">
                <div class="font-bold mb-2">${icon} ${groupName}</div>
                <div class="space-y-1 text-sm">
                  ${[...items, ...items2, ...items3, ...items4].map(t => `
                    <a href="#/result/${t.code}" class="flex items-center justify-between hover:bg-amber-100 px-2 py-1 rounded">
                      <span>${t.emoji} <span class="font-mono font-bold">${t.code}</span> ${t.name}</span>
                      <span class="text-xs font-mono text-gray-400">${t.dimensions.slice(2)}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- 6. 隐藏人格 -->
      <section class="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 class="text-lg font-bold text-hidden mb-3">🎁 隐藏人格触发条件</h2>
        <div class="space-y-3">
          ${hidden.map(t => `
            <div class="bg-white rounded-lg p-3 border border-red-100">
              <div class="flex items-center gap-2">
                <span class="text-3xl">${t.emoji}</span>
                <div>
                  <div class="font-bold text-hidden">${t.code} ${t.name}</div>
                  <div class="text-xs text-gray-500 font-mono">trigger: ${t.trigger}</div>
                </div>
              </div>
              <p class="text-sm text-gray-700 mt-2">
                ${t.trigger === 'drunk_branch_A' ? '浓度 H 维度 ≥ 2 <strong>且</strong> 饮酒分支选 A' : '所有维度最高分 &lt; 5（即答题太平均）'}
              </p>
              <a href="#/result/${t.code}" class="text-xs text-primary hover:underline">→ 查看 ${t.code} 详情</a>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 7. 人格 writeup 状态（点击展开完整内容） -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold">📖 18 篇 writeup 审阅（点击展开）</h2>
          <div class="flex gap-2">
            <button id="expand-all" class="text-xs px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded">全部展开</button>
            <button id="collapse-all" class="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded">全部收起</button>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          ${allTypes.map((t, idx) => `
            <div class="writeup-row border border-gray-200 rounded-lg overflow-hidden" data-idx="${idx}">
              <button class="writeup-toggle w-full flex items-center justify-between bg-gray-50 hover:bg-amber-50 px-3 py-3 text-left">
                <span class="flex items-center gap-2">
                  <span class="text-xl">${t.emoji}</span>
                  <span class="font-mono font-bold text-primary">${t.code}</span>
                  <span>${t.name}</span>
                  <span class="text-xs font-mono text-gray-400">${t.dimensions || ''}</span>
                  ${t.trigger ? '<span class="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">隐藏</span>' : ''}
                </span>
                <span class="text-xs text-gray-500">
                  <span class="char-count">${t.writeup.length} 字</span>
                  <span class="toggle-icon ml-2">▼</span>
                </span>
              </button>
              <div class="writeup-body hidden bg-white px-4 py-3 border-t border-gray-100">
                <p class="text-sm italic text-gray-600 mb-3">"${t.tagline}"</p>
                <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">${t.writeup}</div>
                ${t.dimensions ? `<p class="text-xs font-mono text-gray-400 mt-3 pt-3 border-t border-gray-100">维度: ${t.dimensions} (${t.dimensionNames})</p>` : ''}
                <a href="#/result/${t.code}" class="inline-block mt-3 text-xs text-primary hover:underline">→ 查看 ${t.code} 完整结果页</a>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <div class="text-center text-sm text-gray-400 pb-8">
        Admin 页面 · 内部审阅 · 不放在导航中
      </div>
    </div>
  `;

  // 绑定 writeup 行展开/收起
  document.querySelectorAll('.writeup-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.writeup-row');
      const body = row.querySelector('.writeup-body');
      const icon = row.querySelector('.toggle-icon');
      const isHidden = body.classList.contains('hidden');
      body.classList.toggle('hidden');
      icon.textContent = isHidden ? '▲' : '▼';
    });
  });

  // 全部展开/收起
  document.getElementById('expand-all').addEventListener('click', () => {
    document.querySelectorAll('.writeup-body').forEach(b => b.classList.remove('hidden'));
    document.querySelectorAll('.toggle-icon').forEach(i => i.textContent = '▲');
  });
  document.getElementById('collapse-all').addEventListener('click', () => {
    document.querySelectorAll('.writeup-body').forEach(b => b.classList.add('hidden'));
    document.querySelectorAll('.toggle-icon').forEach(i => i.textContent = '▼');
  });
}