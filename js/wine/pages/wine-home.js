// js/wine/pages/wine-home.js
// 红酒版首页：极简 hero，不暴露测试主题
// 用户做完 32 题才揭晓"原来测的是酒"，保持神秘感

export async function renderHome(app) {
  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center py-16">
        <div class="text-6xl mb-6">🎭</div>
        <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight text-primary">
          测一测，<br>你骨子里住着什么？
        </h1>
        <p class="text-gray-600 mb-10 text-base md:text-lg">
          32 道看似无关的小题<br>
          答完揭晓 18 种性格之一<br>
          以及……一点意想不到的东西
        </p>
        <a href="#/test" class="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
          开始测试 →
        </a>
        <div class="mt-8 text-sm text-gray-500">
          大约需要 3 分钟
        </div>
      </div>

      <div class="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>友情提示：</strong>本测试是娱乐向，结果仅供自娱自乐。
      </div>
    </div>
  `;
}