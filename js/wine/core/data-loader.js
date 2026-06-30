// js/wine/core/data-loader.js
// 红酒版数据加载（指向 wine-questions.json / wine-types.json）

let _questions = null;
let _types = null;

async function loadQuestions() {
  if (_questions) return _questions;
  const res = await fetch('data/wine-questions.json');
  if (!res.ok) throw new Error('加载红酒题库失败');
  _questions = await res.json();
  return _questions;
}

async function loadTypes() {
  if (_types) return _types;
  const res = await fetch('data/wine-types.json');
  if (!res.ok) throw new Error('加载红酒人格数据失败');
  _types = await res.json();
  return _types;
}

async function getQuestionsByDisplayOrder() {
  const data = await loadQuestions();
  return [...data.main].sort((a, b) => a.order - b.order);
}

async function getTypeByCode(code) {
  const data = await loadTypes();
  const all = [...(data.types || []), ...(data.hidden || [])];
  return all.find(t => t.code === code);
}

async function getAllTypes() {
  const data = await loadTypes();
  return data;
}

export { loadQuestions, loadTypes, getQuestionsByDisplayOrder, getTypeByCode, getAllTypes };