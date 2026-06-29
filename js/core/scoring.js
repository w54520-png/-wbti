// js/core/scoring.js
// 纯函数：单题计分 + 全题聚合

/**
 * 单题计分：A=-1, B=0, C=+1
 * @param {string} answer - 'A' | 'B' | 'C'
 * @returns {number}
 */
export function scoreAnswer(answer) {
  if (answer === 'A') return -1;
  if (answer === 'B') return 0;
  if (answer === 'C') return 1;
  throw new Error(`invalid answer: ${answer}`);
}

/**
 * 32 道题聚合到 8 个极的得分
 * @param {string[]} answers - 32 个 'A'/'B'/'C'，按 display order
 * @param {Object[]} questions - 32 道题对象，按 display order，每题有 pole 字段
 * @returns {Object} - {H, L, S, T, F, M, C, N} 各为 -8..+8 的整数
 */
export function scoreAllAnswers(answers, questions) {
  if (answers.length !== 32) {
    throw new Error(`expected 32 answers, got ${answers.length}`);
  }
  if (!questions || questions.length !== 32) {
    throw new Error(`expected 32 questions, got ${questions ? questions.length : 0}`);
  }

  const scores = { H: 0, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };

  for (let i = 0; i < 32; i++) {
    const score = scoreAnswer(answers[i]);
    const pole = questions[i].pole;
    if (!scores.hasOwnProperty(pole)) {
      throw new Error(`invalid pole: ${pole} in question ${questions[i].id}`);
    }
    scores[pole] += score;
  }

  return scores;
}

/**
 * 工具：判断 H 维度是否高分（≥2），用于触发饮酒分支
 * @param {Object} scores
 * @returns {boolean}
 */
export function isHighStrength(scores) {
  return scores.H >= 2;
}
