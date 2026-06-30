// js/wine/pages/wine-admin.js
// 红酒版 Admin 审阅页：列出 32 道题、4 维 8 极、18 型、隐藏触发

import { getQuestionsByDisplayOrder, getAllTypes } from '../core/data-loader.js';

const DIM_PAIRS = [
  { a: 'T', b: 'S', name: '单宁', desc: { T: '强（咬舌、涩）', S: '弱（顺滑、果味）' } },
  { a: 'A', b: 'C', name: '酸度', desc: { A: '高（流口水）', C: '低（圆润）' } },
  { a: 'F', b: 'L', name: '酒体', desc: { F: '满（厚重）', L: '轻（清流）' } },
  { a: 'R', b: 'Q', name: '回味', desc: { R: '长（绵长）', Q: '短（干脆）' } }
];

const HIDDEN_CODES = ['BLEN', 'VINT'];

export async function renderAdmin(app) {
  const questions = await getQuestionsByDisplayOrder();
  const typesData = await getAllTypes();
  const types = typesData.types;
  const hidden = typesData.hidden;
  const allTypes = [...types, ...hidden];

  // 极分布统计
  const poleCount = { T: 0, S: 0, A: 0, C: 0, F: 0, L: 0, R: 0, Q: 0 };
  questions.forEach(q => { poleCount[q.pole]++; });

  app.innerHTML = `
    <div class="fade-in">
      <div class="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
        <h1 class="text-2xl font-bold text-primary mb-1">🔧 WBTI·Red Admin 审阅</h1>
        <p class="text-sm text-gray-700">内部页面 · 不对外发布 · 列出题库/人格映射/计分规则</p>
        <p class="text-xs text-gray-500 mt-2">访问路径：<code class="bg-white px-1 rounded">/wine.html#/wine-admin</code></p>
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
          每题得分加给该题对应的「极」。例：q1 pole=T，选 C 则 <code>T+1</code>；选 A 则 <code>T-1</code>。
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

      <!-- 2. 极分布统计 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">📊 极分布统计</h2>
        <div class="grid grid-cols-4 md:grid-cols-8 gap-3 text-center">
          ${Object.entries(poleCount).map(([pole, count]) => `
            <div class="bg-amber-50 p-3 rounded">
              <div class="text-2xl font-bold text-primary">${count}</div>
              <div class="text-xs font-mono text-gray-600">${pole}</div>
            </div>
          `).join('')}
        </div>
        <div class="mt-3 text-sm text-gray-600">
          ⚠️ 检查是否有极过少/过多（每极应有 4 题，理论值 32/8=4）
        </div>
      </section>

      <!-- 3. 32 道题详细列表 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">📝 32 道题详细（按 display order）</h2>
        <div class="space-y-2">
          ${questions.map(q => `
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="bg-gray-50 px-3 py-2 flex items-center justify-between text-xs">
                <span class="font-mono text-gray-500">#${q.order}</span>
                <span class="px-2 py-0.5 bg-primary text-white rounded font-mono">pole=${q.pole}</span>
              </div>
              <div class="p-3">
                <p class="text-sm text-gray-800">${q.text}</p>
                <table class="w-full mt-2 text-xs">
                  <thead>
                    <tr class="text-gray-500">
                      <th class="border border-gray-200 px-2 py-1 text-center">A → ${q.pole} -1<br>${q.options.A}</th>
                      <th class="border border-gray-200 px-2 py-1 text-center">B → 不计分<br>${q.options.B}</th>
                      <th class="border border-gray-200 px-2 py-1 text-center">C → ${q.pole} +1<br>${q.options.C}</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 4. 极组合 → 人格映射 -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">🎯 极组合 → 人格映射（4 字母 → code）</h2>
        <p class="text-xs text-gray-500 mb-3">每维度选最高极 → 拼成 4 字母代号 → 查表得人格。</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${types.map(t => `
            <a href="#/result/${t.code}" class="block bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-3 text-center transition-all">
              <div class="font-mono font-bold text-primary">${t.code}</div>
              <div class="text-sm text-gray-800">${t.name}</div>
              <div class="text-xs text-gray-500">${t.subtitle || ''}</div>
              <div class="text-xs font-mono text-gray-400 mt-1">${t.dimensions}</div>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- 5. 维度组合热力图（按单宁·酸度） -->
      <section class="mb-8 bg-white rounded-xl p-6 shadow-md">
        <h2 class="text-lg font-bold mb-3">🗺️ 16 常规人格 · 按单宁×酸度分组</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${['TA', 'TC', 'SA', 'SC'].map(group => {
            const groupName = {
              TA: '强·高（咬舌·流口水）', TC: '强·低（咬舌·圆润）',
              SA: '弱·高（顺滑·流口水）', SC: '弱·低（顺滑·圆润）'
            }[group];
            const icon = { TA: '⚔️', TC: '🛡️', SA: '🌿', SC: '🍬' }[group];
            const items = types.filter(t => t.dimensions.startsWith(group));
            return `
              <div class="bg-amber-50 rounded-lg p-3">
                <div class="font-bold mb-2">${icon} ${groupName}</div>
                <div class="space-y-1 text-sm">
                  ${items.map(t => `
                    <a href="#/result/${t.code}" class="flex items-center justify-between hover:bg-amber-100 px-2 py-1 rounded">
                      <span><span class="font-mono font-bold">${t.code}</span> ${t.name} <span class="text-xs text-gray-500">${t.subtitle || ''}</span></span>
                      <span class="text-xs font-mono text-gray-400">${t.dimensions.slice(2)}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- 6. 隐藏人格触发条件 -->
      <section class="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 class="text-lg font-bold text-hidden mb-3">🎁 隐藏人格触发条件</h2>
        <div class="space-y-3">
          ${hidden.map(t => `
            <div class="bg-white rounded-lg p-3 border border-red-100">
              <div class="flex items-center gap-2">
                <div>
                  <div class="font-bold text-hidden font-mono">${t.code} ${t.name}</div>
                  <div class="text-xs text-gray-500">${t.subtitle || ''}</div>
                </div>
              </div>
              <p class="text-sm text-gray-700 mt-2">
                ${t.code === 'VINT' ? '4 维最高极都 ≥ 5 <strong>且</strong> 维度间最高极极差 ≥ 2（你很较真）' : '4 维最高极都 < 5 <strong>且</strong> 维度间最高极极差 < 4（你什么酒都能搭）'}
              </p>
              <a href="#/result/${t.code}" class="text-xs text-primary hover:underline">→ 查看 ${t.code} 详情</a>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 7. 18 篇 writeup 审阅 -->
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
                  <span class="font-mono font-bold text-primary">${t.code}</span>
                  <span>${t.name}</span>
                  <span class="text-xs text-gray-500">${t.subtitle || ''}</span>
                  <span class="text-xs font-mono text-gray-400">${t.dimensions || ''}</span>
                  ${HIDDEN_CODES.includes(t.code) ? '<span class="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">隐藏</span>' : ''}
                </span>
                <span class="text-xs text-gray-500">
                  <span class="char-count">${t.writeup.length} 字</span>
                  <span class="toggle-icon ml-2">▼</span>
                </span>
              </button>
              <div class="writeup-body hidden bg-white px-4 py-3 border-t border-gray-100">
                <p class="text-sm italic text-gray-600 mb-3">"${t.tagline}"</p>
                <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">${t.writeup}</div>
                ${t.wines && t.wines.length ? `
                  <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="text-xs text-gray-500 mb-1">推荐酒款：</div>
                    ${t.wines.map(w => `<div class="text-xs text-gray-700">• ${w.name} (${w.price}) — ${w.tagline}</div>`).join('')}
                  </div>
                ` : ''}
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

  // 绑定 writeup 展开/收起
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

  document.getElementById('expand-all').addEventListener('click', () => {
    document.querySelectorAll('.writeup-body').forEach(b => b.classList.remove('hidden'));
    document.querySelectorAll('.toggle-icon').forEach(i => i.textContent = '▲');
  });
  document.getElementById('collapse-all').addEventListener('click', () => {
    document.querySelectorAll('.writeup-body').forEach(b => b.classList.add('hidden'));
    document.querySelectorAll('.toggle-icon').forEach(i => i.textContent = '▼');
  });
}