const app = document.querySelector("#app");

const state = {
  deities: [],
  categories: [],
};

const navItems = [
  ["/", "Home"],
  ["/deities", "181神柱"],
  ["/oracle", "Oracle"],
  ["/diagnosis", "Diagnosis"],
  ["/map", "Map"],
  ["/admin-json", "JSON"],
];

const layerLabels = ["Brain", "Heart", "Body", "Soul"];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function routePath() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}

function go(path) {
  history.pushState({}, "", path);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function link(path, label) {
  return `<a href="${path}" data-link class="${routePath() === path ? "active" : ""}">${label}</a>`;
}

function layout(content) {
  return `
    <div class="shell">
      <header class="header">
        <a href="/" data-link class="brand">
          <strong>YAOYOROZU-181 OS ∞</strong>
          <span>Mythic Archetype Interface</span>
        </a>
        <nav class="nav">${navItems.map(([path, label]) => link(path, label)).join("")}</nav>
      </header>
      <main class="main">${content}</main>
      <footer class="footer">
        This app treats Japanese deities as cultural, symbolic, psychological, and mythological archetypes.
      </footer>
    </div>
  `;
}

async function loadData() {
  const response = await fetch("/data/yaoyorozu181.json");
  state.deities = await response.json();
  state.categories = [...new Map(state.deities.map((d) => [d.category, d.category_label])).entries()]
    .map(([id, label]) => ({ id, label }));
}

function getAllDeities() {
  return state.deities.slice().sort((a, b) => a.id.localeCompare(b.id));
}

function getDeityById(id) {
  return state.deities.find((deity) => deity.id === id);
}

function getDeitiesByCategory(category) {
  return category ? state.deities.filter((deity) => deity.category === category) : state.deities;
}

function getDeitiesByLayer(layer) {
  return layer ? state.deities.filter((deity) => deity.human_os_layer.includes(layer)) : state.deities;
}

function searchDeities(query) {
  const q = query.trim().toLowerCase();
  if (!q) return state.deities;
  return state.deities.filter((deity) => {
    const haystack = [
      deity.id,
      deity.name_ja,
      deity.name_kana,
      deity.name_romaji,
      deity.category_label,
      deity.role,
      deity.archetype,
      deity.gift,
      deity.shadow,
      deity.source_text?.join(" "),
      deity.symbolic_interpretation,
      deity.keywords.join(" "),
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

function drawRandomDeity(pool = state.deities) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function scoreDeity(deity, answers) {
  let score = 0;
  if (deity.human_os_layer.includes(answers.heavyLayer)) score += 12;
  const joined = `${deity.gift} ${deity.shadow} ${deity.emotion} ${deity.role} ${deity.keywords.join(" ")}`;
  for (const token of [answers.missingPower, answers.emotion, answers.destroy, answers.cultivate]) {
    if (token && joined.includes(token)) score += 8;
  }
  if (answers.destroy && deity.category === "UNDERWORLD") score += 6;
  if (answers.cultivate && deity.category === "EARTH_AGRICULTURE") score += 5;
  if (answers.missingPower?.includes("勇気") && deity.category === "WARRIOR") score += 10;
  if (answers.missingPower?.includes("表現") && deity.category === "ART") score += 10;
  if (answers.missingPower?.includes("愛") && deity.category === "LOVE_RELATIONSHIP") score += 10;
  if (answers.emotion?.includes("怒") && deity.category === "FIRE") score += 7;
  if (answers.emotion?.includes("不安") && deity.category === "LUNAR") score += 7;
  return score;
}

function diagnoseUser(answers) {
  const ranked = state.deities
    .map((deity) => ({ deity, score: scoreDeity(deity, answers) }))
    .sort((a, b) => b.score - a.score || a.deity.id.localeCompare(b.deity.id));
  const current = ranked[0]?.deity || state.deities[0];
  const missing = ranked.find((item) => item.deity.id !== current.id)?.deity || state.deities[1];
  const shadow = state.deities.find((deity) => deity.shadow && answers.destroy && deity.description_long.includes(answers.destroy))
    || state.deities.find((deity) => deity.category === "UNDERWORLD")
    || state.deities[2];
  return {
    current_deity: current,
    missing_deity: missing,
    shadow_deity: shadow,
    activation_practice: `${current.practice} その後、${missing.name_ja}の問い「${missing.activation_question}」に一文で答える。`,
  };
}

function osStats(deity) {
  return `
    <div class="stat-list">
      ${["brain", "heart", "body", "soul"].map((key) => `
        <div class="stat">
          <span>${key.toUpperCase()}</span>
          <span class="bar"><i style="width:${deity[key]}%"></i></span>
          <b>${deity[key]}</b>
        </div>
      `).join("")}
    </div>
  `;
}

function deityCard(deity) {
  return `
    <a href="/deities/${deity.id}" data-link class="deity-card">
      <div class="card-top">
        <span class="tag">${deity.id}</span>
        <span class="tag">${deity.category_label}</span>
        <span class="tag verified">古典文献確認済み</span>
      </div>
      <div>
        <h3>${escapeHtml(deity.name_ja)}</h3>
        <div class="romaji">${escapeHtml(deity.name_romaji)}</div>
      </div>
      <p class="muted">${escapeHtml(deity.description_short)}</p>
      ${osStats(deity)}
      <div class="tag-row">
        ${deity.human_os_layer.map((layer) => `<span class="tag">${layer}</span>`).join("")}
        <span class="tag">${escapeHtml(deity.gift)}</span>
      </div>
    </a>
  `;
}

function deityDetail(deity) {
  const related = deity.related_deities.map(getDeityById).filter(Boolean);
  return `
    <section class="detail-hero">
      <div class="detail-panel">
        <div class="tag-row">
          <span class="tag">${deity.id}</span>
          <span class="tag">${deity.category_label}</span>
          <span class="tag">${deity.system}</span>
          <span class="tag verified">古典文献確認済み</span>
        </div>
        <h1 class="detail-title">${escapeHtml(deity.name_ja)}</h1>
        <p class="romaji">${escapeHtml(deity.name_kana)} / ${escapeHtml(deity.name_romaji)}</p>
        <p class="lead">${escapeHtml(deity.description_long)}</p>
        <div class="actions">
          <a href="/oracle" data-link class="btn primary">今日の神柱を引く</a>
          <a href="/deities" data-link class="btn">一覧へ戻る</a>
        </div>
      </div>
      <aside class="detail-panel">
        <h3>Human OS</h3>
        ${osStats(deity)}
        <div class="tag-row" style="margin-top:1rem">${deity.element.map((e) => `<span class="tag">${escapeHtml(e)}</span>`).join("")}</div>
      </aside>
    </section>
    <section class="section grid cols-3">
      ${infoBox("Archetype", deity.archetype)}
      ${infoBox("Gift", deity.gift)}
      ${infoBox("Shadow", deity.shadow)}
      ${infoBox("Emotion", deity.emotion)}
      ${infoBox("Body Area", deity.body_area)}
      ${infoBox("Frequency", `${deity.frequency} Hz`)}
      ${infoBox("Source", deity.source_text.join(" / "))}
    </section>
    <section class="section grid cols-3">
      ${practiceBox("Activation Question", deity.activation_question)}
      ${practiceBox("Practice", deity.practice)}
      ${practiceBox("Historical Note", deity.historical_note)}
      ${practiceBox("Symbolic Interpretation", deity.symbolic_interpretation)}
    </section>
    <section class="section">
      <h2>Related Aspects</h2>
      <div class="deity-grid">${related.length ? related.map(deityCard).join("") : `<div class="empty">関連する別カテゴリの同名神柱はありません。</div>`}</div>
    </section>
  `;
}

function infoBox(label, value) {
  return `<div class="panel metric"><span class="muted">${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function practiceBox(label, value) {
  return `<div class="panel metric"><h3>${label}</h3><p class="muted">${escapeHtml(value)}</p></div>`;
}

function homePage() {
  return layout(`
    <section class="hero">
      <div>
        <div class="eyebrow">Japanese Myth × Human OS</div>
        <h1>YAOYOROZU–181 OS ∞</h1>
        <p class="lead">八百万の神々を、信仰対象ではなく、人間の思考・感情・身体・魂を読み解くための分散アーキタイプとして扱う意識インターフェース。</p>
        <div class="hero-actions">
          <a href="/deities" data-link class="btn primary">181神柱を探索する</a>
          <a href="/diagnosis" data-link class="btn">OS診断をはじめる</a>
        </div>
      </div>
      <div class="panel hero-card">
        <div class="sigil"><span>181</span></div>
      </div>
    </section>
    <section class="section">
      <h2>What is YAOYOROZU–181 OS?</h2>
      <p class="lead">中央神1柱と18カテゴリ×10柱で構成される、神話を操作するUI。カード、JSON、診断、AIナビゲーションへ拡張できるMVPです。</p>
      <div class="grid cols-4">
        ${infoBox("Central", "1柱")}
        ${infoBox("Categories", "18系統")}
        ${infoBox("Archetypes", "181神柱")}
        ${infoBox("Mode", "Symbolic OS")}
      </div>
    </section>
    <section class="section">
      <h2>Brain / Heart / Body / Soul Map</h2>
      <div class="grid cols-4">
        ${practiceBox("Brain", "思考、言葉、判断、戦略を司るレイヤー。")}
        ${practiceBox("Heart", "感情、関係性、愛着、共鳴を司るレイヤー。")}
        ${practiceBox("Body", "行動、身体感覚、生活基盤、突破力を司るレイヤー。")}
        ${practiceBox("Soul", "中心軸、意味、変容、境界を司るレイヤー。")}
      </div>
    </section>
  `);
}

function deitiesPage() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const category = params.get("category") || "";
  const layer = params.get("layer") || "";
  const element = params.get("element") || "";
  let results = searchDeities(query);
  if (category) results = results.filter((d) => d.category === category);
  if (layer) results = results.filter((d) => d.human_os_layer.includes(layer));
  if (element) results = results.filter((d) => d.element.includes(element));
  const elements = [...new Set(state.deities.flatMap((d) => d.element))].sort();

  return layout(`
    <section>
      <div class="eyebrow">Database Browser</div>
      <h1>181神柱</h1>
      <p class="lead">名前、カテゴリ、OSレイヤー、エレメントから探索できます。同名の神柱はカテゴリごとのOS側面として別IDにしています。</p>
      <form class="filters" id="filters">
        <div class="field"><label>Search</label><input class="input" name="q" value="${escapeHtml(query)}" placeholder="天照 / healing / 統合"></div>
        <div class="field"><label>Category</label><select class="input" name="category">${option("", "すべて", category)}${state.categories.map((c) => option(c.id, c.label, category)).join("")}</select></div>
        <div class="field"><label>Layer</label><select class="input" name="layer">${option("", "すべて", layer)}${layerLabels.map((l) => option(l, l, layer)).join("")}</select></div>
        <div class="field"><label>Element</label><select class="input" name="element">${option("", "すべて", element)}${elements.map((e) => option(e, e, element)).join("")}</select></div>
      </form>
      <p class="muted">${results.length} / 181 pillars</p>
      <div class="deity-grid">${results.length ? results.map(deityCard).join("") : `<div class="empty">該当する神柱がありません。</div>`}</div>
    </section>
  `);
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function oraclePage() {
  const history = JSON.parse(localStorage.getItem("yao-oracle-history") || "[]");
  const latest = history[0] ? getDeityById(history[0].id) : drawRandomDeity();
  return layout(`
    <section class="oracle-card detail-panel">
      <div class="eyebrow">Daily Oracle</div>
      <h1>今日の神柱</h1>
      <div id="oracle-result">${deityCard(latest)}</div>
      <div class="actions">
        <button class="btn primary" id="draw-oracle">一柱引く</button>
        <button class="btn" id="clear-history">履歴を消す</button>
      </div>
    </section>
    <section class="section">
      <h2>Draw History</h2>
      <div class="deity-grid">${history.slice(0, 6).map((h) => getDeityById(h.id)).filter(Boolean).map(deityCard).join("") || `<div class="empty">まだ履歴はありません。</div>`}</div>
    </section>
  `);
}

function diagnosisPage() {
  return layout(`
    <section>
      <div class="eyebrow">Rule-Based MVP</div>
      <h1>Simple OS Diagnosis</h1>
      <p class="lead">5つの問いから、現在の神柱・不足している神柱・影の神柱・実践を提案します。医療・心理診断ではありません。</p>
      <div class="diagnosis">
        <form id="diagnosis-form" class="panel form-card">
          <div class="field"><label>1. 今の自分はどこが一番重いか？</label><select class="input" name="heavyLayer">${layerLabels.map((l) => option(l, l, "Heart")).join("")}</select></div>
          <div class="field"><label>2. 今、足りない力は何か？</label><input class="input" name="missingPower" placeholder="勇気 / 表現 / 愛 / 統合"></div>
          <div class="field"><label>3. 最近よく出る感情は？</label><input class="input" name="emotion" placeholder="不安 / 怒り / 静寂 / 期待"></div>
          <div class="field"><label>4. 今、壊したいものは何か？</label><textarea class="input" name="destroy" placeholder="古い習慣、遠慮、過去のパターンなど"></textarea></div>
          <div class="field"><label>5. 今、育てたいものは何か？</label><textarea class="input" name="cultivate" placeholder="生活基盤、創作、関係性など"></textarea></div>
          <button class="btn primary" type="submit">診断する</button>
        </form>
        <div id="diagnosis-result" class="detail-panel"><p class="muted">回答するとここに結果が表示されます。</p></div>
      </div>
    </section>
  `);
}

function diagnosisResultView(result) {
  return `
    <h2>Diagnosis Result</h2>
    <div class="grid">
      ${practiceBox("Current Deity", `${result.current_deity.name_ja} - ${result.current_deity.role}`)}
      ${practiceBox("Missing Deity", `${result.missing_deity.name_ja} - ${result.missing_deity.gift}`)}
      ${practiceBox("Shadow Deity", `${result.shadow_deity.name_ja} - ${result.shadow_deity.shadow}`)}
      ${practiceBox("Activation Practice", result.activation_practice)}
    </div>
  `;
}

function mapPage() {
  return layout(`
    <section>
      <div class="eyebrow">Symbolic Wheel</div>
      <h1>18カテゴリの神話OSマップ</h1>
      <p class="lead">複雑な神学体系ではなく、機能別の象徴ホイールとしてカテゴリを扱います。</p>
      <div class="wheel">
        ${state.categories.filter((c) => c.id !== "CENTRAL_CORE").map((c) => `<a href="/deities?category=${c.id}" data-link><span>${c.label}<br><small>${c.id}</small></span></a>`).join("")}
      </div>
    </section>
  `);
}

function adminJsonPage() {
  return layout(`
    <section>
      <div class="eyebrow">Developer</div>
      <h1>Raw JSON</h1>
      <p class="lead">181神柱データをコピーして、カード生成、AIナビゲーション、Supabase seedに転用できます。</p>
      <button class="btn primary" id="copy-json">JSONをコピー</button>
      <pre class="json-box"><code>${escapeHtml(JSON.stringify(state.deities, null, 2))}</code></pre>
    </section>
  `);
}

function notFoundPage() {
  return layout(`<div class="empty">ページが見つかりません。</div>`);
}

function render() {
  const path = routePath();
  if (path === "/") app.innerHTML = homePage();
  else if (path === "/deities") app.innerHTML = deitiesPage();
  else if (path.startsWith("/deities/")) {
    const deity = getDeityById(path.split("/").pop());
    app.innerHTML = deity ? layout(deityDetail(deity)) : notFoundPage();
  }
  else if (path === "/oracle") app.innerHTML = oraclePage();
  else if (path === "/diagnosis") app.innerHTML = diagnosisPage();
  else if (path === "/map") app.innerHTML = mapPage();
  else if (path === "/admin-json") app.innerHTML = adminJsonPage();
  else app.innerHTML = notFoundPage();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-link]").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http")) return;
      event.preventDefault();
      go(href);
    });
  });

  const filters = document.querySelector("#filters");
  if (filters) {
    filters.addEventListener("input", () => {
      const params = new URLSearchParams(new FormData(filters));
      for (const [key, value] of [...params.entries()]) {
        if (!value) params.delete(key);
      }
      history.replaceState({}, "", `/deities${params.toString() ? `?${params}` : ""}`);
      render();
    });
  }

  const drawButton = document.querySelector("#draw-oracle");
  if (drawButton) {
    drawButton.addEventListener("click", () => {
      const deity = drawRandomDeity();
      const history = JSON.parse(localStorage.getItem("yao-oracle-history") || "[]");
      history.unshift({ id: deity.id, at: new Date().toISOString() });
      localStorage.setItem("yao-oracle-history", JSON.stringify(history.slice(0, 30)));
      render();
    });
  }

  const clearButton = document.querySelector("#clear-history");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      localStorage.removeItem("yao-oracle-history");
      render();
    });
  }

  const diagnosisForm = document.querySelector("#diagnosis-form");
  if (diagnosisForm) {
    diagnosisForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(diagnosisForm).entries());
      const result = diagnoseUser(data);
      document.querySelector("#diagnosis-result").innerHTML = diagnosisResultView(result);
    });
  }

  const copyButton = document.querySelector("#copy-json");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(JSON.stringify(state.deities, null, 2));
      copyButton.textContent = "コピーしました";
      setTimeout(() => { copyButton.textContent = "JSONをコピー"; }, 1400);
    });
  }
}

window.addEventListener("popstate", render);

loadData()
  .then(render)
  .catch((error) => {
    app.innerHTML = `<main class="main"><div class="empty">データの読み込みに失敗しました: ${escapeHtml(error.message)}</div></main>`;
  });

window.YAOYOROZU = {
  getAllDeities,
  getDeityById,
  getDeitiesByCategory,
  getDeitiesByLayer,
  searchDeities,
  drawRandomDeity,
  diagnoseUser,
};
