// js/core/data-loader.js
// 数据加载（异步）

let _questions = null;
let _types = null;

async function loadQuestions() {
  if (_questions) return _questions;
  const res = await fetch('data/questions.json');
  if (!res.ok) throw new Error('加载题目失败');
  _questions = await res.json();
  return _questions;
}

async function loadTypes() {
  if (_types) return _types;
  const res = await fetch('data/types.json');
  if (!res.ok) throw new Error('加载人格数据失败');
  _types = await res.json();
  return _types;
}

async function getQuestionsByDisplayOrder() {
  const data = await loadQuestions();
  return [...data.main].sort((a, b) => a.order - b.order);
}

async function getTypeByCode(code) {
  const data = await loadTypes();
  const all = [...data.types, ...data.hidden];
  return all.find(t => t.code === code);
}

async function getAllTypes() {
  const data = await loadTypes();
  return data;
}

export { loadQuestions, loadTypes, getQuestionsByDisplayOrder, getTypeByCode, getAllTypes };
