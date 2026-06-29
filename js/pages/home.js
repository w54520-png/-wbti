// js/pages/home.js
// 首页：标题 + 开始测试 CTA + 8 个人格快速入口 + 友情提示

export async function renderHome(app) {
  app.innerHTML = `
    <div class="fade-in">
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🍷🥃🍶</div>
        <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          MBTI 已经过时，<br>WBTI 来了。
        </h1>
        <p class="text-gray-600 mb-8 text-base md:text-lg">
          32 道看似无关的有趣题<br>
          测出你是哪种酒
        </p>
        <a href="#/test" class="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
          开始测试 →
        </a>
        <div class="mt-12 text-sm text-gray-500">
          大约需要 3 分钟 · 不注册 · 不收费
        </div>
      </div>

      <div class="mt-16 border-t border-amber-200 pt-8">
        <h2 class="text-center text-xl font-bold mb-6">🌟 16 种酒人格 🌟</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <a href="#/result/MALT" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🥃</div><div class="text-sm font-semibold mt-1">MALT 麦霸</div>
          </a>
          <a href="#/result/CASK" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🥃</div><div class="text-sm font-semibold mt-1">CASK 老炮</div>
          </a>
          <a href="#/result/BOOZE" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🍹</div><div class="text-sm font-semibold mt-1">BOOZE 派对炸弹</div>
          </a>
          <a href="#/result/FIRE" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🔥</div><div class="text-sm font-semibold mt-1">FIRE 爆裂男孩</div>
          </a>
          <a href="#/result/PEAC" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🍑</div><div class="text-sm font-semibold mt-1">PEAC 桃粉甜心</div>
          </a>
          <a href="#/result/ZEN" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🍵</div><div class="text-sm font-semibold mt-1">ZEN 禅意大叔</div>
          </a>
          <a href="#/result/TIPS" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">💃</div><div class="text-sm font-semibold mt-1">TIPS 蹦迪选手</div>
          </a>
          <a href="#/result/DRAM" class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div class="text-2xl">🌙</div><div class="text-sm font-semibold mt-1">DRAM 深夜电台</div>
          </a>
        </div>
        <div class="text-center mt-6">
          <a href="#/types" class="text-primary text-sm hover:underline">查看全部 16+2 型 →</a>
        </div>
      </div>

      <div class="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>友情提示：</strong>WBTI 是一款娱乐向人格测试，不构成任何医疗、诊疗或饮酒建议。未成年人请勿饮酒。
      </div>
    </div>
  `;
}