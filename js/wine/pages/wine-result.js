// js/wine/pages/wine-result.js
// 红酒版结果页
// 路由：
//   /#/result         → 中转：读 sessionStorage → 计分 → 匹配 → 跳 /#/result/CODE
//   /#/result/CODE    → 详情：渲染人格 + 4 维指纹 + 酒卡 + 分享

import { getTypeByCode, getQuestionsByDisplayOrder, getAllTypes } from '../core/data-loader.js';
import { scoreAllAnswers } from '../core/scoring.js';
import { matchType, resolveTypeByDimensions, HIDDEN_CODES } from '../core/matcher.js';

const DIM_PAIRS = [['T', 'S'], ['A', 'C'], ['F', 'L'], ['R', 'Q']];
const DIM_NAMES = {
  T: '浓度·重', S: '浓度·轻',
  A: '敏锐·挑', C: '敏锐·钝',
  F: '信息·满', L: '信息·轻',
  R: '节奏·慢', Q: '节奏·快'
};

export async function renderResult(app, match) {
  let typeCode = match && match[1] ? match[1] : null;

  // 情形 1：/result 中转页
  if (!typeCode) {
    const raw = sessionStorage.getItem('wbti_wine_answers');
    if (!raw) {
      app.innerHTML = `
        <div class="text-center py-20">
          <p class="text-gray-500 mb-4">还没有测试结果</p>
          <a href="#/test" class="inline-block bg-primary text-white px-6 py-3 rounded-full">开始测试</a>
        </div>
      `;
      return;
    }
    const { answers } = JSON.parse(raw);
    const questions = await getQuestionsByDisplayOrder();
    const scores = scoreAllAnswers(answers, questions);

    // 调 matchType：返回的是 'BLEN'/'VINT' 或 4 字母维度指纹
    const matched = matchType(scores);
    if (HIDDEN_CODES.includes(matched)) {
      typeCode = matched;
    } else {
      const data = await getAllTypes();
      typeCode = resolveTypeByDimensions(matched, data.types);
    }

    window.location.hash = `#/result/${typeCode}`;
    return;
  }

  // 情形 2：/result/CODE 详情页
  const type = await getTypeByCode(typeCode);
  if (!type) {
    app.innerHTML = `<div class="text-center text-red-500 py-20">找不到人格：${typeCode}</div>`;
    return;
  }

  const isHidden = HIDDEN_CODES.includes(typeCode);
  const dimensionBars = !isHidden ? await renderDimensionBars() : '';

  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center mb-8 ${isHidden ? 'text-hidden' : ''}">
        <div class="type-code ${isHidden ? 'hidden-type' : ''}">${type.code}</div>
        <div class="text-xl font-bold mt-2">${type.name}</div>
        ${!isHidden ? `<div class="text-sm text-gray-500 mt-1">${type.subtitle || ''}</div>` : ''}
        ${!isHidden && type.dimensions ? `<div class="text-xs font-mono text-gray-400 mt-1">${type.dimensions} · ${dimsToLabels(type.dimensions)}</div>` : ''}
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
          <div class="space-y-3">
            ${type.wines.map(w => `
              <div class="block bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex items-baseline justify-between mb-1">
                  <div class="font-bold text-primary">${w.name}</div>
                  <div class="text-xs text-gray-500">${w.price}</div>
                </div>
                <div class="text-xs text-gray-500 mb-1">${w.region}</div>
                <div class="text-sm text-gray-700">${w.tagline}</div>
              </div>
            `).join('')}
          </div>
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
        <strong>⚠️ 友情提示：</strong>本测试是娱乐向，结果仅供自娱自乐。未成年人请勿饮酒。
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

  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => handleShare(shareBtn, type));
  }
}

function dimsToLabels(dimCode) {
  return dimCode.split('').map(c => DIM_NAMES[c]).join(' · ');
}

async function renderDimensionBars() {
  const raw = sessionStorage.getItem('wbti_wine_answers');
  if (!raw) return '';
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return ''; }
  const { answers } = parsed;
  if (!answers || answers.length !== 32) return '';

  const questions = await getQuestionsByDisplayOrder();
  const scores = scoreAllAnswers(answers, questions);

  return DIM_PAIRS.map(([a, b]) => {
    const winner = scores[a] >= scores[b] ? a : b;
    const pct = Math.max(scores[a], scores[b]) / 8 * 100;
    return `
      <div class="flex items-center gap-3">
        <div class="w-20 text-sm text-gray-600">${DIM_NAMES[winner]}</div>
        <div class="flex-1 bg-amber-100 rounded-full h-3">
          <div class="bg-primary h-3 rounded-full progress-bar" style="width: ${pct}%"></div>
        </div>
        <div class="w-12 text-sm text-gray-500 text-right">${Math.round(pct)}%</div>
      </div>
    `;
  }).join('');
}

function handleShare(shareBtn, type) {
  const shareText = `我测出一种性格：【${type.code} ${type.name}】——${type.tagline}\n你也来测一下：https://w54520-png.github.io/-wbti/wine.html`;
  const original = shareBtn.textContent;
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    alert('当前浏览器不支持自动复制，请手动复制：\n\n' + shareText);
    return;
  }
  navigator.clipboard.writeText(shareText)
    .then(() => {
      shareBtn.textContent = '✅ 已复制';
      setTimeout(() => { shareBtn.textContent = original; }, 2000);
    })
    .catch(() => alert('复制失败，请手动复制：\n\n' + shareText));
}