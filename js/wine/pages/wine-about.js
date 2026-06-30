// js/wine/pages/wine-about.js
// 红酒版关于页
// 文案用"性格/维度"包装，揭晓时才知道映射到酒

export async function renderAbout(app) {
  app.innerHTML = `
    <div class="fade-in">
      <h1 class="text-2xl font-bold mb-4 text-primary">关于这次测试</h1>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🌟 是什么</h2>
        <p>32 道看似无关的小题，测出你骨子里住着什么样的"味道"。<br>
        答完揭晓 18 种性格之一，每种都对应一个意想不到的东西。<br>
        <span class="text-xs text-gray-500">（提示：揭晓时你就知道那个"意想不到"是什么了 🙂）</span></p>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📝 怎么测</h2>
        <ol class="list-decimal pl-5 space-y-1">
          <li>32 道题，每题 3 选 1：不认同 / 中立 / 认同</li>
          <li>题目都是生活场景（餐厅/电影/朋友/做决定……）</li>
          <li>答完自动出结果 + 你的性格代号 + 神秘揭晓</li>
        </ol>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📊 4 维度 · 8 极</h2>
        <p class="text-sm text-gray-600 mb-2">题目不直接谈测试主题，而是用 4 个性格维度去看你：</p>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>浓度</strong>：重（重口/冲击） ↔ 轻（清淡/简约）</li>
          <li><strong>敏锐</strong>：挑（反应快/敏锐） ↔ 钝（接受度高/慢热）</li>
          <li><strong>信息量</strong>：满（厚重/深入） ↔ 轻（简明/点到为止）</li>
          <li><strong>节奏</strong>：慢（念旧/反复回味） ↔ 快（翻篇/干脆）</li>
        </ul>
        <p class="text-sm text-gray-600 mt-3">
          每维度 8 题，每题加给该题归属的极。每极得分 -4..+4。最高的极拼成 4 字母代号 → 查表得人格。
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🎁 隐藏性格</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>酒仙</strong>：4 维都赞同、不强烈反对（你很较真）</li>
          <li><strong>百搭</strong>：4 维最高分都 ≤ 0（你什么都能搭）</li>
        </ul>
      </section>

      <section class="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h2 class="text-lg font-bold mb-2 text-primary">⚠️ 友情提示</h2>
        <p>本测试是娱乐向，结果仅供自娱自乐。<br>
        不构成任何医疗、诊疗或饮酒建议。<br>
        <strong>未成年人请勿饮酒。</strong><br>
        适量饮酒，未醉为度。</p>
      </section>

      <section class="mb-6 text-sm text-gray-500">
        <p>🛠️ v1.1 · 2026-06-30</p>
      </section>
    </div>
  `;
}