// tests/matcher.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchType } from '../js/core/matcher.js';

// Step 1: 常规人格匹配
test('matchType: 极端重·独·果·古 → MALT', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.equal(matchType(scores, null), 'MALT');
});

// Step 2: 全部 A 极端 → HHHH
// 注：spec §3.5 明确规定"4 维度常规人格的最高极得分 < 5 → HHHH"
// 全 A 时 L=T=M=N=0（最高极得分 0），< 5 阈值 → 触发 HHHH
// brief 中曾有"全 A → CHIC"的备选提案，但与 spec 冲突，此处遵循 spec
test('matchType: 全 A 极 → HHHH（spec 最高极得分 < 5 触发）', () => {
  const allA = { H: -8, L: 0, S: -8, T: 0, F: -8, M: 0, C: -8, N: 0 };
  assert.equal(matchType(allA, null), 'HHHH');
});

// Step 3: 隐藏人格 DRUNK 触发
test('matchType: 饮酒分支 A → DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.equal(matchType(scores, 'A'), 'DRUNK');
});

test('matchType: 饮酒分支 B → 不触发 DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.notEqual(matchType(scores, 'B'), 'DRUNK');
});

test('matchType: 饮酒分支 C → 不触发 DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.notEqual(matchType(scores, 'C'), 'DRUNK');
});

test('matchType: 无分支答案 → 不触发 DRUNK', () => {
  const scores = { H: 8, L: 0, S: 8, T: 0, F: 8, M: 0, C: 8, N: 0 };
  assert.notEqual(matchType(scores, null), 'DRUNK');
});

// Step 4: HHHH 触发
test('matchType: 所有常规人格最高极得分 < 5 → HHHH', () => {
  // 平衡型：每维度两极都 0，最高极得分 = 0 < 5
  const balanced = { H: 0, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
  assert.equal(matchType(balanced, null), 'HHHH');
});

test('matchType: 任意一维度最高分 ≥ 5 → 不触发 HHHH', () => {
  const hasStrong = { H: 8, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
  assert.notEqual(matchType(hasStrong, null), 'HHHH');
});

test('matchType: 边缘值 - 最高极得分 4 → HHHH', () => {
  // 验证 < 5 阈值（4 < 5）
  const edge = { H: 4, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
  assert.equal(matchType(edge, null), 'HHHH');
});

// Step 5: 平手处理
test('matchType: 平手时字母表靠前的极胜', () => {
  // 所有极都 5 分，平手 → 字母表靠前者胜
  // H(5) vs L(5) → H 胜；S(5) vs T(5) → S 胜；F(5) vs M(5) → F 胜；C(5) vs N(5) → C 胜
  // 组合 HSFC → MALT
  const tied = { H: 5, L: 5, S: 5, T: 5, F: 5, M: 5, C: 5, N: 5 };
  assert.equal(matchType(tied, null), 'MALT');
});

// Step 6: 16 个常规人格全覆盖
test('matchType: 16 个常规人格代号都能匹配到（覆盖所有维度组合）', () => {
  // 4 维度 × 2 极 = 16 组合
  const allCombos = [
    ['MALT',  'HSFC'], ['CASK',  'HSMC'], ['BOOZE', 'HTFC'], ['FIRE',  'HTMC'],
    ['NEAT',  'HSFN'], ['SMOK',  'HSMN'], ['TOAS',  'HTFN'], ['HYPE',  'HTMN'],
    ['PEAC',  'LSFC'], ['JULE',  'LSMC'], ['COOL',  'LSFN'], ['ZEN',   'LSMN'],
    ['PUNC',  'LTFC'], ['TIPS',  'LTFN'], ['CHIC',  'LTMC'], ['DRAM',  'LTMN']
  ];

  for (const [expected, dim] of allCombos) {
    const scores = { H: 0, L: 0, S: 0, T: 0, F: 0, M: 0, C: 0, N: 0 };
    // 把对应极设高分
    for (const pole of dim) {
      scores[pole] = 8;
    }
    assert.equal(matchType(scores, null), expected, `dim=${dim} 应匹配 ${expected}`);
  }
});

// Step 7: 18 人格端到端覆盖（16 常规 + DRUNK + HHHH）
test('matchType: 18 人格端到端覆盖（16 常规 + DRUNK + HHHH）', () => {
  const cases = [
    // 16 常规
    { code: 'MALT',  scores: {H:8,L:0,S:8,T:0,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'CASK',  scores: {H:8,L:0,S:8,T:0,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'BOOZE', scores: {H:8,L:0,S:0,T:8,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'FIRE',  scores: {H:8,L:0,S:0,T:8,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'NEAT',  scores: {H:8,L:0,S:8,T:0,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'SMOK',  scores: {H:8,L:0,S:8,T:0,F:0,M:8,C:0,N:8}, drunk: null },
    { code: 'TOAS',  scores: {H:8,L:0,S:0,T:8,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'HYPE',  scores: {H:8,L:0,S:0,T:8,F:0,M:8,C:0,N:8}, drunk: null },
    { code: 'PEAC',  scores: {H:0,L:8,S:8,T:0,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'JULE',  scores: {H:0,L:8,S:8,T:0,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'COOL',  scores: {H:0,L:8,S:8,T:0,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'ZEN',   scores: {H:0,L:8,S:8,T:0,F:0,M:8,C:0,N:8}, drunk: null },
    { code: 'PUNC',  scores: {H:0,L:8,S:0,T:8,F:8,M:0,C:8,N:0}, drunk: null },
    { code: 'TIPS',  scores: {H:0,L:8,S:0,T:8,F:8,M:0,C:0,N:8}, drunk: null },
    { code: 'CHIC',  scores: {H:0,L:8,S:0,T:8,F:0,M:8,C:8,N:0}, drunk: null },
    { code: 'DRAM',  scores: {H:0,L:8,S:0,T:8,F:0,M:8,C:0,N:8}, drunk: null },
    // DRUNK 触发：H 高分 + 饮酒分支 A
    { code: 'DRUNK', scores: {H:8,L:0,S:0,T:0,F:0,M:0,C:0,N:0}, drunk: 'A' },
    // HHHH 触发：4 维所有极得分都 < 5
    { code: 'HHHH',  scores: {H:0,L:0,S:0,T:0,F:0,M:0,C:0,N:0}, drunk: null }
  ];

  for (const c of cases) {
    assert.equal(matchType(c.scores, c.drunk), c.code, `期望 ${c.code}`);
  }
});
