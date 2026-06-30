// js/pages/home.js
// 首页：标题 + 开始测试 CTA + 钩子文案 + 友情提示
// 注意：不在首页展示任何具体人格名（保留测一测的悬念）

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
        <div class="mt-8 text-sm text-gray-500">
          大约需要 3 分钟
        </div>
      </div>

      <!-- 钩子区：4 维 + 仪式感，不暴露具体人格 -->
      <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl mb-1">🌑</div>
          <div class="text-xs text-gray-500">浓度</div>
          <div class="text-sm font-semibold text-primary">重 · 轻</div>
        </div>
        <div class="bg-white rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl mb-1">👤</div>
          <div class="text-xs text-gray-500">场景</div>
          <div class="text-sm font-semibold text-primary">独处 · 群嗨</div>
        </div>
        <div class="bg-white rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl mb-1">🍇</div>
          <div class="text-xs text-gray-500">风味</div>
          <div class="text-sm font-semibold text-primary">果香 · 木桶</div>
        </div>
        <div class="bg-white rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl mb-1">🎵</div>
          <div class="text-xs text-gray-500">节奏</div>
          <div class="text-sm font-semibold text-primary">古典 · 新潮</div>
        </div>
      </div>

      <!-- 测出来后的钩子 -->
      <div class="mt-10 bg-amber-50 border border-amber-200 rounded-lg p-5">
        <p class="text-sm text-gray-700 leading-relaxed text-center">
          测完会得到一个 <strong>4 字母代号</strong>、一段戏剧化的人格速写，<br>
          还有 <strong>2 款真正适合你的酒</strong>。<br>
          <span class="text-gray-500 text-xs mt-2 inline-block">—— 如果你测出了 HHHH，那恭喜你解锁了隐藏人格。</span>
        </p>
      </div>

      <div class="mt-10 text-center">
        <a href="#/test" class="inline-block text-primary border border-primary px-6 py-2 rounded-full text-sm hover:bg-primary hover:text-white transition-all">
          再来一次 →
        </a>
      </div>

      <div class="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>友情提示：</strong>WBTI 是一款娱乐向人格测试，不构成任何医疗、诊疗或饮酒建议。未成年人请勿饮酒。
      </div>
    </div>
  `;
}