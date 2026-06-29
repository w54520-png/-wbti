// js/pages/about.js
// 关于页：是什么 / 怎么测 / 计分规则 / 隐藏人格 / 友情提示 / 联系

export async function renderAbout(app) {
  app.innerHTML = `
    <div class="fade-in prose prose-sm max-w-none">
      <h1 class="text-2xl font-bold mb-4">关于 WBTI</h1>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🌟 是什么</h2>
        <p>WBTI（Wine + Big + Type + Indicator）是一款娱乐向酒人格测试，借鉴 MBTI 和 SBTI 的 16 型人格测试结构，做了一个"测你像哪种酒"的版本。</p>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📝 怎么测</h2>
        <ol class="list-decimal pl-5 space-y-1">
          <li>32 道看似无关的有趣题（不直接谈酒）</li>
          <li>每题 3 选 1：不认同 / 中立 / 认同</li>
          <li>答完自动出结果 + 你的酒人格代号</li>
          <li>可能有 1 道额外"饮酒分支"题</li>
        </ol>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">📊 计分规则</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li>32 题对应 4 个维度：浓度 / 场景 / 风味 / 节奏</li>
          <li>每维度 2 极（如浓度：重 H / 轻 L）</li>
          <li>每维度得分最高的极 → 组合成 4 字母代号</li>
          <li>查到对应的人格（如 HSFC = MALT 麦霸）</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-bold mb-2">🎁 隐藏人格</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>DRUNK 酒鬼</strong>：浓度重口味 + 饮酒分支选 A</li>
          <li><strong>HHHH 傻乐者</strong>：所有维度最高得分都 &lt; 5（即你的偏好太平均了）</li>
        </ul>
      </section>

      <section class="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h2 class="text-lg font-bold mb-2 text-primary">⚠️ 友情提示</h2>
        <p>WBTI 是娱乐向测试，结果仅供自娱自乐。<br>
        不构成任何医疗、诊疗或饮酒建议。<br>
        <strong>未成年人请勿饮酒。</strong><br>
        适量饮酒，未醉为度。</p>
      </section>

      <section class="mb-6 text-sm text-gray-500">
        <p>📮 联系：微信公众号「WBTI 酒人格」（v0.2 上线后）</p>
        <p>🛠️ v0.1 MVP · 2026-06-30</p>
      </section>
    </div>
  `;
}