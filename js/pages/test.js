// js/pages/test.js
// 单题推进 + 进度条 + 上一题/下一题 + 饮酒分支
import { getQuestionsByDisplayOrder } from '../core/data-loader.js';
import { scoreAllAnswers, isHighStrength } from '../core/scoring.js';

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

  app.innerHTML = `
    <div class="fade-in">
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
        <button id="next-btn" class="px-6 py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-30" ${!selected ? 'disabled' : ''}>
          ${state.phase === 'branch' || state.currentIdx === 31 ? '提交并查看结果' : '继续'} →
        </button>
      </div>
    </div>
  `;

  // 绑定事件
  app.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.label;
      if (state.phase === 'branch') {
        state.branchAnswer = label;
      } else {
        state.answers[state.currentIdx] = label;
      }
      renderCurrentQuestion(app);
    });
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (state.phase === 'branch') {
      state.phase = 'main';
      renderCurrentQuestion(app);
    } else if (state.currentIdx > 0) {
      state.currentIdx--;
      renderCurrentQuestion(app);
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (state.phase === 'branch') {
      state.phase = 'done';
      renderCurrentQuestion(app);
      return;
    }

    if (state.currentIdx < 31) {
      state.currentIdx++;
      // 检查是否需要进入饮酒分支
      if (state.currentIdx === 32) {
        const scores = scoreAllAnswers(state.answers, state.questions);
        if (isHighStrength(scores)) {
          state.phase = 'branch';
        } else {
          state.phase = 'done';
        }
      }
      renderCurrentQuestion(app);
    } else {
      // 最后一题，下一步看分支
      const scores = scoreAllAnswers(state.answers, state.questions);
      if (isHighStrength(scores)) {
        state.phase = 'branch';
      } else {
        state.phase = 'done';
      }
      renderCurrentQuestion(app);
    }
  });
}

function finishTest() {
  // 把答案存到 sessionStorage，结果页读取
  sessionStorage.setItem('wbti_answers', JSON.stringify({
    answers: state.answers,
    branchAnswer: state.phase === 'branch' ? state.branchAnswer : null
  }));
  window.location.hash = '#/result';
}
