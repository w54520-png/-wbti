// js/pages/test.js
// 单题推进 + 进度条 + 上一题/下一题 + 饮酒分支
// 交互策略：
//   - 选项点击 → 选中（CSS 类切换，不重渲染）→ 350ms 后题卡淡出 → 切下一题
//   - 上一题/下一题按钮：题卡淡出 → 切题（fade-in）
//   - 全程不重渲染整页，避免"闪动两次"
import { getQuestionsByDisplayOrder } from '../core/data-loader.js';
import { scoreAllAnswers, isHighStrength } from '../core/scoring.js';

const AUTO_NEXT_DELAY = 350; // 选项点击后等待时长（让用户看到选中状态）
const FADE_OUT_DURATION = 200; // 题卡淡出动画时长（CSS transition）

let state = {
  questions: [],
  currentIdx: 0,
  answers: [], // 'A'/'B'/'C'/null
  branchAnswer: null,
  phase: 'main' // 'main' | 'branch' | 'done'
};

export async function renderTest(app) {
  // 重置 state
  state = {
    questions: await getQuestionsByDisplayOrder(),
    currentIdx: 0,
    answers: new Array(32).fill(null),
    branchAnswer: null,
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

  const totalQ = state.phase === 'branch' ? 33 : 32;
  const currentNum = state.phase === 'branch' ? 33 : state.currentIdx + 1;
  const progress = (state.currentIdx / 32) * 100;

  let questionText, options, selected;

  if (state.phase === 'branch') {
    questionText = '🍷 最近 3 个月，你有没有一次喝断片？';
    options = [
      { label: 'A', text: '有过，还不止一次' },
      { label: 'B', text: '有过一次' },
      { label: 'C', text: '从来没有' }
    ];
    selected = state.branchAnswer;
  } else {
    const q = state.questions[state.currentIdx];
    questionText = q.text;
    options = [
      { label: 'A', text: '不认同' },
      { label: 'B', text: '中立' },
      { label: 'C', text: '认同' }
    ];
    selected = state.answers[state.currentIdx];
  }

  // main 最后一题必须全部答完才能点下一题（避免 scoreAllAnswers 抛错）
  const isLastMain = state.phase === 'main' && state.currentIdx === 31;
  const allMainAnswered = state.answers.every(a => a === 'A' || a === 'B' || a === 'C');
  const canAdvanceMain = !isLastMain || allMainAnswered;

  // 按钮文案
  let nextLabel;
  if (state.phase === 'branch') {
    nextLabel = '提交并查看结果 →';
  } else if (isLastMain) {
    nextLabel = '提交 →';
  } else {
    nextLabel = '下一题 →';
  }

  // 整个题卡包在 .question-card 里，切换时用 .fading-out 触发淡出
  app.innerHTML = `
    <div class="question-card fade-in">
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span>第 ${currentNum} / ${totalQ} 题</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="w-full bg-amber-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full progress-bar" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-md mb-6 min-h-[200px] flex items-center">
        <p class="text-lg leading-relaxed">${questionText}</p>
      </div>

      <div class="space-y-3 mb-6">
        ${options.map(opt => `
          <button
            data-label="${opt.label}"
            class="answer-btn w-full text-left p-4 bg-white rounded-lg border-2 transition-all
              ${selected === opt.label ? 'border-primary bg-amber-50' : 'border-gray-200 hover:border-accent'}"
          >
            <span class="font-bold text-primary mr-3">${opt.label}.</span>
            <span>${opt.text}</span>
          </button>
        `).join('')}
      </div>

      <div class="flex justify-between">
        <button id="prev-btn" class="px-6 py-3 text-gray-500 hover:text-primary disabled:opacity-30" ${state.currentIdx === 0 && state.phase === 'main' ? 'disabled' : ''}>
          ← 上一题
        </button>
        <button id="next-btn" class="px-6 py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-30" ${!canAdvanceMain ? 'disabled' : ''}>
          ${nextLabel}
        </button>
      </div>
    </div>
  `;

  // 选项点击：仅切类，不重渲染
  app.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // 防重复点击（防抖动）
      const card = app.querySelector('.question-card');
      if (card.classList.contains('fading-out')) return;

      const label = btn.dataset.label;
      if (state.phase === 'branch') {
        state.branchAnswer = label;
      } else {
        state.answers[state.currentIdx] = label;
      }

      // 1) 立即高亮选中按钮，其他按钮变淡 + 锁定
      app.querySelectorAll('.answer-btn').forEach(b => {
        b.classList.add('locked');
        if (b === btn) b.classList.add('selected');
      });

      // 2) 350ms 后题卡淡出 → 切下一题
      setTimeout(() => fadeOutAndAdvance(app), AUTO_NEXT_DELAY);
    });
  });

  document.getElementById('prev-btn').addEventListener('click', () => fadeOutAndAdvance(app, -1));
  document.getElementById('next-btn').addEventListener('click', () => fadeOutAndAdvance(app, +1));
}

/**
 * 题卡淡出后切题。
 * direction: +1 下一题 / -1 上一题 / undefined 按 phase 自动决定
 */
function fadeOutAndAdvance(app, direction) {
  // 已经在淡出中，忽略重复触发
  if (app.dataset.advancing === '1') return;
  const card = app.querySelector('.question-card');
  if (!card) return;

  // main 最后一题 + 未全部答完：禁止 next
  const isLastMain = state.phase === 'main' && state.currentIdx === 31;
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

/**
 * 推进到下一题 / 完成
 * - main: currentIdx++，到 31 后检查 H 维度触发分支或直接完成
 * - branch: 直接完成
 */
function goNext(app) {
  if (state.phase === 'branch') {
    state.phase = 'done';
    renderCurrentQuestion(app);
    return;
  }

  if (state.currentIdx < 31) {
    state.currentIdx++;
    renderCurrentQuestion(app);
  } else {
    // 最后一题（currentIdx=31），检查分支触发
    const scores = scoreAllAnswers(state.answers, state.questions);
    state.phase = isHighStrength(scores) ? 'branch' : 'done';
    renderCurrentQuestion(app);
  }
}

/**
 * 回到上一题 / 从 branch 回 main
 */
function goPrev(app) {
  if (state.phase === 'branch') {
    state.phase = 'main';
    renderCurrentQuestion(app);
  } else if (state.currentIdx > 0) {
    state.currentIdx--;
    renderCurrentQuestion(app);
  }
}

function finishTest() {
  // 把答案存到 sessionStorage，结果页读取
  sessionStorage.setItem('wbti_answers', JSON.stringify({
    answers: state.answers,
    branchAnswer: state.phase === 'branch' ? state.branchAnswer : null
  }));
  window.location.hash = '#/result';
}