// js/wine/pages/wine-home.js
// 红酒版首页：极简 hero，不暴露测试主题
// 用户做完 32 题才揭晓"原来测的是酒"，保持神秘感

export async function renderHome(app) {
  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center py-16">
        <div class="text-7xl mb-4">🍷</div>
        <div class="text-sm font-mono tracking-widest text-gray-500 mb-3">WBTI · RED</div>
        <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight text-primary">
          测一测你骨子里的<br>红酒人格
        </h1>
        <p class="text-gray-600 mb-10 text-base md:text-lg leading-relaxed">
          WBTI 性格测试 · 红酒版<br>
          32 道看似无关的小题<br>
          每题都不直接聊酒<br>
          答完揭晓 18 种性格 + 一瓶专属于你的酒
        </p>
        <a href="#/test" class="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
          开始测试 →
        </a>
        <div class="mt-8 text-sm text-gray-500">
          大约需要 3 分钟
        </div>
      </div>

      <div class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>友情提示：</strong>本测试是娱乐向，结果仅供自娱自乐。
      </div>
    </div>
  `;
}