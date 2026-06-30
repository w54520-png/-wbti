// js/wine/pages/wine-about.js
// 红酒版关于页

export async function renderAbout(app) {
  app.innerHTML = `
    <div class="fade-in">
      <h1 class="text-2xl font-bold mb-4 text-primary">关于 WBTI·Red</h1>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🌟 是什么</h2>
        <p>WBTI·Red 是 WBTI（WBTI Wine + Big + Type + Indicator）的红酒版。用"测一测你像哪种酒"的方式，从 <strong>4 个品酒维度</strong>看你骨子里住着哪个葡萄品种。</p>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📝 怎么测</h2>
        <ol class="list-decimal pl-5 space-y-1">
          <li>32 道看似无关的有趣题（不直接谈酒）</li>
          <li>每题 3 选 1：不认同 / 中立 / 认同</li>
          <li>答完自动出结果 + 你的酒人格代号 + 推荐酒款</li>
        </ol>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📊 4 维度 · 8 极</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>单宁</strong>：T 强（咬舌、挂杯、涩） ↔ S 弱（顺滑、果味、清透）</li>
          <li><strong>酸度</strong>：A 高（流口水、活泼） ↔ C 低（圆润、温柔）</li>
          <li><strong>酒体</strong>：F 满（厚重、覆盖舌头） ↔ L 轻（清流、走嘴）</li>
          <li><strong>回味</strong>：R 长（半小时还有味） ↔ Q 短（干脆利落）</li>
        </ul>
        <p class="text-sm text-gray-600 mt-3">
          每维度 8 题，每题加给该题归属的极。每极得分 -8..+8。最高的极拼成 4 字母代号 → 查表得人格。
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🎁 隐藏人格</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>VINT 老饕</strong>：4 维最高极都 ≥ 5，且维度间有差异（你很较真）</li>
          <li><strong>BLEN 调酒师</strong>：4 维最高极都 < 5，且维度间极差小（你什么酒都能搭）</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🍷 酒款推荐</h2>
        <p>每个人格附 2 款酒：¥150-250 主流 + ¥500+ 精品，涵盖新旧世界。理性饮酒。</p>
      </section>

      <section class="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h2 class="text-lg font-bold mb-2 text-primary">⚠️ 友情提示</h2>
        <p>WBTI·Red 是娱乐向测试，结果仅供自娱自乐。<br>
        不构成任何医疗、诊疗或饮酒建议。<br>
        <strong>未成年人请勿饮酒。</strong><br>
        适量饮酒，未醉为度。</p>
      </section>

      <section class="mb-6 text-sm text-gray-500">
        <p>🛠️ v1.0 MVP · 2026-06-30</p>
      </section>
    </div>
  `;
}