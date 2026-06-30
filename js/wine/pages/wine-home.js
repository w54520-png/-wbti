// js/wine/pages/wine-home.js
// 红酒版首页：极简 hero，保持神秘感
// 副标题用「红酒」定位，4 维度的钩子不出现

export async function renderHome(app) {
  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center py-16">
        <div class="text-6xl mb-6">🍷</div>
        <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight text-primary">
          测一测，<br>你是一瓶什么红酒？
        </h1>
        <p class="text-gray-600 mb-10 text-base md:text-lg">
          32 道看似无关的有趣题<br>
          从品酒 4 维：单宁 · 酸度 · 酒体 · 回味<br>
          看出你骨子里住着哪个葡萄品种
        </p>
        <a href="#/test" class="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
          开始测试 →
        </a>
        <div class="mt-8 text-sm text-gray-500">
          大约需要 3 分钟
        </div>
      </div>

      <div class="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>友情提示：</strong>WBTI·Red 是一款娱乐向人格测试，不构成任何医疗、诊疗或饮酒建议。未成年人请勿饮酒。
      </div>
    </div>
  `;
}