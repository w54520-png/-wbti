// js/pages/result.js
// 渲染人格结果详情
// 路由：
//   /#/result         → 中转：从 sessionStorage 读答案 → 计分 → 匹配 → 跳 /#/result/CODE
//   /#/result/CODE    → 详情：渲染人格 + 4 维指纹 + 酒卡 + 分享

import { getTypeByCode, getQuestionsByDisplayOrder } from '../core/data-loader.js';
import { scoreAllAnswers } from '../core/scoring.js';
import { matchType } from '../core/matcher.js';

// 维度对 + 中文标签（用于 4 维指纹）
const DIM_PAIRS = [['H', 'L'], ['S', 'T'], ['F', 'M'], ['C', 'N']];
const DIM_NAMES = {
  H: '浓度·重', L: '浓度·轻',
  S: '场景·独', T: '场景·群',
  F: '风味·果', M: '风味·木',
  C: '节奏·古', N: '节奏·新'
};
const HIDDEN_CODES = ['DRUNK', 'HHHH'];

export async function renderResult(app, match) {
  // 路由正则 /^\/result\/([A-Z\-]+)$/ 的第一个捕获组
  let typeCode = match && match[1] ? match[1] : null;

  // 情形 1：/result 中转页 → 计算人格并跳转
  if (!typeCode) {
    const raw = sessionStorage.getItem('wbti_answers');
    if (!raw) {
      app.innerHTML = `
        <div class="text-center py-20">
          <p class="text-gray-500 mb-4">还没有测试结果</p>
          <a href="#/test" class="inline-block bg-primary text-white px-6 py-3 rounded-full">开始测试</a>
        </div>
      `;
      return;
    }
    const { answers, branchAnswer } = JSON.parse(raw);
    const questions = await getQuestionsByDisplayOrder();
    const scores = scoreAllAnswers(answers, questions);
    typeCode = matchType(scores, branchAnswer);
    // 跳转到具体人格详情（用 hash 路由，不刷新页面、不进 history）
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

  // 4 维指纹：仅常规人格显示
  const dimensionBars = !isHidden ? await renderDimensionBars() : '';

  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center mb-8 ${isHidden ? 'text-hidden' : ''}">
        <div class="type-code ${isHidden ? 'hidden-type' : ''}">${type.code}</div>
        <div class="text-3xl mt-2 mb-1">${type.emoji}</div>
        <div class="text-xl font-bold mt-2">${type.name}</div>
        ${!isHidden ? `<div class="text-sm text-gray-500 mt-1">${type.dimensions} · ${type.dimensionNames}</div>` : ''}
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
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${type.wines.map(w => `
              <a href="${w.link}" class="block bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-4 transition-all">
                <div class="font-bold text-primary">${w.name}</div>
                <div class="text-xs text-gray-500 mt-1">${w.tagline}</div>
              </a>
            `).join('')}
          </div>
          <p class="text-xs text-gray-400 mt-3 text-center">v0.1 占位 · v0.2 接真实链接</p>
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
        <strong>⚠️ 友情提示：</strong>WBTI 是娱乐向测试，结果仅供自娱自乐。未成年人请勿饮酒。
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

  // 分享按钮：v0.1 复制文案到剪贴板
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => handleShare(shareBtn, type));
  }
}

/**
 * 从 sessionStorage 重算 4 维分数，渲染进度条 HTML。
 * sessionStorage 缺失或解析失败时返回空串（不显示指纹区）。
 */
async function renderDimensionBars() {
  const raw = sessionStorage.getItem('wbti_answers');
  if (!raw) return '';

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return '';
  }
  const { answers } = parsed;
  if (!answers || answers.length !== 32) return '';

  const questions = await getQuestionsByDisplayOrder();
  const scores = scoreAllAnswers(answers, questions);

  return DIM_PAIRS.map(([a, b]) => {
    const winner = scores[a] >= scores[b] ? a : b;
    // 每极得分范围 -8..+8，取 |max|/8 作百分比
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

/**
 * 复制分享文案到剪贴板。
 * 成功：按钮临时变 "✅ 已复制"；失败：弹 alert 提示，不静默吞错。
 */
function handleShare(shareBtn, type) {
  const shareText = `我测出 WBTI 是【${type.code} ${type.name}】——${type.tagline}\n你也来测一下：https://w54520-png.github.io/-wbti/`;
  const original = shareBtn.textContent;

  // 不支持 Clipboard API（老浏览器 / 非 https）→ 立即降级
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    alert('当前浏览器不支持自动复制，请手动复制：\n\n' + shareText);
    return;
  }

  navigator.clipboard.writeText(shareText)
    .then(() => {
      shareBtn.textContent = '✅ 已复制';
      setTimeout(() => { shareBtn.textContent = original; }, 2000);
    })
    .catch((err) => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制：\n\n' + shareText);
    });
}
