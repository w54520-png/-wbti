// tests/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswer, scoreAllAnswers } from '../js/core/scoring.js';

// 测试用的 mock questions（按 display order，pole 与 data/questions.json 一致）
const mockQuestions = [
  ...Array.from({length: 8}, (_, i) => ({ id: `q${i+1}`, dimension: 'strength', pole: 'H', text: '' })),
  ...Array.from({length: 8}, (_, i) => ({ id: `q${i+9}`, dimension: 'scene', pole: 'S', text: '' })),
  ...Array.from({length: 8}, (_, i) => ({ id: `q${i+17}`, dimension: 'flavor', pole: 'F', text: '' })),
  ...Array.from({length: 8}, (_, i) => ({ id: `q${i+25}`, dimension: 'rhythm', pole: 'C', text: '' }))
];

test('scoreAnswer: A 选项 = -1', () => {
  assert.equal(scoreAnswer('A'), -1);
});

test('scoreAnswer: B 选项 = 0', () => {
  assert.equal(scoreAnswer('B'), 0);
});

test('scoreAnswer: C 选项 = +1', () => {
  assert.equal(scoreAnswer('C'), 1);
});

test('scoreAnswer: 非法选项抛错', () => {
  assert.throws(() => scoreAnswer('D'), /invalid/i);
  assert.throws(() => scoreAnswer(''), /invalid/i);
});

test('scoreAllAnswers: 全部选 C → H/S/F/C 各 +8（mock 题库）', () => {
  const answers = Array(32).fill('C');
  const scores = scoreAllAnswers(answers, mockQuestions);
  assert.equal(scores.H, 8);
  assert.equal(scores.L, 0);  // L 是反方向
  assert.equal(scores.S, 8);
  assert.equal(scores.T, 0);
  assert.equal(scores.F, 8);
  assert.equal(scores.M, 0);
  assert.equal(scores.C, 8);
  assert.equal(scores.N, 0);
});

test('scoreAllAnswers: 全部选 A → H/S/F/C 各 -8', () => {
  const answers = Array(32).fill('A');
  const scores = scoreAllAnswers(answers, mockQuestions);
  assert.equal(scores.H, -8);
  assert.equal(scores.S, -8);
  assert.equal(scores.F, -8);
  assert.equal(scores.C, -8);
});

test('scoreAllAnswers: 全部选 B → 全 0', () => {
  const answers = Array(32).fill('B');
  const scores = scoreAllAnswers(answers, mockQuestions);
  for (const k of Object.keys(scores)) {
    assert.equal(scores[k], 0, `${k} 应为 0`);
  }
});

test('scoreAllAnswers: 32 道题不全 → 抛错', () => {
  assert.throws(() => scoreAllAnswers(['A'], mockQuestions), /32 answers/i);
  assert.throws(() => scoreAllAnswers(Array(33).fill('A'), mockQuestions), /32 answers/i);
});

test('scoreAllAnswers: H 维度独立统计（用于分支触发判断）', () => {
  // q1-q8 都选 C（强重口味），其他选 B
  const answers = [
    'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C',  // 8 道 H 极题
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B',
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B',
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'
  ];
  const scores = scoreAllAnswers(answers, mockQuestions);
  assert.equal(scores.H, 8);
  assert.equal(scores.L, 0);
});
