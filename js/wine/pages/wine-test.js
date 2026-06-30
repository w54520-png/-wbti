// js/wine/pages/wine-test.js
// 红酒版测试页：32 道题，单题推进，无分支题（隐藏由 matcher 直接判定）

import { getQuestionsByDisplayOrder } from '../core/data-loader.js';
import { scoreAllAnswers } from '../core/scoring.js';

const AUTO_NEXT_DELAY = 350;
const FADE_OUT_DURATION = 200;

let state = {
  questions: [],
  currentIdx: 0,
  answers: [], // 'A'/'B'/'C'/null
  phase: 'main' // 'main' | 'done'
};

export async function renderTest(app) {
  state = {
    questions: await getQuestionsByDisplayOrder(),
    currentIdx: 0,
    answers: new Array(32).fill(null),
    phase: 'main'
  };

  if (state.questions.length === 0) {
    app.innerHTML = '<div class="text-center text-red-500 py-20">题目加载失败</div>';
    return;
  }

  renderCurrentQuestion(app);
}

function renderCurrentQuestion(app) {
  if (state.phase === 'done') {
    finishTest();
    return;
  }

  const q = state.questions[state.currentIdx];
  const progress = (state.currentIdx / 32) * 100;
  const selected = state.answers[state.currentIdx];

  const isLastMain = state.currentIdx === 31;
  const allMainAnswered = state.answers.every(a => a === 'A' || a === 'B' || a === 'C');
  const canAdvanceMain = !isLastMain || allMainAnswered;

  const nextLabel = isLastMain ? '提交 →' : '下一题 →';

  app.innerHTML = `
    <div class="question-card fade-in">
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span>第 ${state.currentIdx + 1} / 32 题</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="w-full bg-amber-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full progress-bar" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-md mb-6 min-h-[200px] flex items-center">
        <p class="text-lg leading-relaxed">${q.text}</p>
      </div>

      <div class="space-y-3 mb-6">
        ${['A', 'B', 'C'].map(label => `
          <button
            data-label="${label}"
            class="answer-btn w-full text-left p-4 bg-white rounded-lg border-2 transition-all
              ${selected === label ? 'border-primary bg-amber-50' : 'border-gray-200 hover:border-accent'}"
          >
            <span class="font-bold text-primary mr-3">${label}.</span>
            <span>${q.options[label]}</span>
          </button>
        `).join('')}
      </div>

      <div class="flex justify-between">
        <button id="prev-btn" class="px-6 py-3 text-gray-500 hover:text-primary disabled:opacity-30" ${state.currentIdx === 0 ? 'disabled' : ''}>
          ← 上一题
        </button>
        <button id="next-btn" class="px-6 py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-30" ${!canAdvanceMain ? 'disabled' : ''}>
          ${nextLabel}
        </button>
      </div>
    </div>
  `;

  // 选项点击
  app.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = app.querySelector('.question-card');
      if (card.classList.contains('fading-out')) return;
      const label = btn.dataset.label;
      state.answers[state.currentIdx] = label;
      app.querySelectorAll('.answer-btn').forEach(b => {
        b.classList.add('locked');
        if (b === btn) b.classList.add('selected');
      });
      setTimeout(() => fadeOutAndAdvance(app), AUTO_NEXT_DELAY);
    });
  });

  document.getElementById('prev-btn').addEventListener('click', () => fadeOutAndAdvance(app, -1));
  document.getElementById('next-btn').addEventListener('click', () => fadeOutAndAdvance(app, +1));
}

function fadeOutAndAdvance(app, direction) {
  if (app.dataset.advancing === '1') return;
  const card = app.querySelector('.question-card');
  if (!card) return;
  const isLastMain = state.currentIdx === 31;
  const allMainAnswered = state.answers.every(a => a === 'A' || a === 'B' || a === 'C');
  if (direction === +1 && isLastMain && !allMainAnswered) return;
  app.dataset.advancing = '1';
  card.classList.add('fading-out');
  setTimeout(() => {
    if (direction === -1) {
      goPrev(app);
    } else {
      goNext(app);
    }
    app.dataset.advancing = '0';
  }, FADE_OUT_DURATION);
}

function goNext(app) {
  if (state.currentIdx < 31) {
    state.currentIdx++;
    renderCurrentQuestion(app);
  } else {
    state.phase = 'done';
    renderCurrentQuestion(app);
  }
}

function goPrev(app) {
  if (state.currentIdx > 0) {
    state.currentIdx--;
    renderCurrentQuestion(app);
  }
}

function finishTest() {
  sessionStorage.setItem('wbti_wine_answers', JSON.stringify({
    answers: state.answers
  }));
  window.location.hash = '#/result';
}