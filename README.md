# YAOYOROZU-181 OS ∞

日本神話・八百万の神々を、信仰対象ではなく「人間OSの分散アーキタイプ」として扱うWebアプリMVPです。

中央神1柱と18カテゴリ×10柱、合計181神柱をJSONデータベース化し、探索、カード表示、日次オラクル、簡易診断、JSONコピーができます。

## Tech Stack

このMVPは、現在の実行環境で確実に動くことを優先し、依存ゼロの静的Webアプリとして実装しています。

- HTML
- CSS
- JavaScript modules
- JSON seed data
- LocalStorage
- Node.js local server
- TypeScript type definitions in `src/types.ts`

Next.js / Tailwind CSS / shadcn/ui / Supabaseへ移行しやすいように、`data`、`src`、utility functions、component-like render functionsを分けています。

## How to Run

```bash
node server.js
```

Open:

```txt
http://localhost:4173
```

Optional data check:

```bash
node scripts/check-data.mjs
```

## File Structure

```txt
.
├── data/
│   └── yaoyorozu181.json
├── scripts/
│   └── check-data.mjs
├── src/
│   ├── app.js
│   ├── styles.css
│   └── types.ts
├── index.html
├── package.json
├── server.js
└── README.md
```

## App Screens

- `/` landing page
- `/deities` deity database browser
- `/deities/YAO-001` individual deity detail page
- `/oracle` daily deity draw
- `/diagnosis` rule-based symbolic diagnosis
- `/map` 18 category symbolic wheel
- `/admin-json` raw JSON viewer and copy tool

## Data Structure

Each deity object includes:

- `id`
- `name_ja`
- `name_kana`
- `name_romaji`
- `category`
- `system`
- `element`
- `human_os_layer`
- `brain`
- `heart`
- `body`
- `soul`
- `role`
- `archetype`
- `gift`
- `shadow`
- `emotion`
- `body_area`
- `frequency`
- `tarot_correspondence`
- `iching_keyword`
- `description_short`
- `description_long`
- `activation_question`
- `practice`
- `keywords`
- `related_deities`
- `source_status`
- `source_text`
- `historical_note`
- `symbolic_interpretation`

## How to Add New Deities

1. Add a new object to `data/yaoyorozu181.json`.
2. Use a unique `id`.
3. Keep `brain`, `heart`, `body`, and `soul` between 0 and 100.
4. Add at least one `human_os_layer`.
5. Set `source_status` to `classical` only when the神名 can be checked in classical sources.
6. Add source names such as `古事記`, `日本書紀`, `風土記`, `延喜式`, or `祝詞` to `source_text`.
7. Keep `historical_note` limited to what can be confirmed.
8. Put OS/archetype meaning in `symbolic_interpretation`, separated from the historical note.
9. Run:

```bash
node scripts/check-data.mjs
```

## Diagnosis Logic

The MVP uses simple rule-based matching.

It scores deities by:

- selected heavy OS layer
- missing power keywords
- recent emotion
- destroy/cultivate text
- category boosts for warrior, art, love, fire, lunar, underworld, and agriculture

The result returns:

- `current_deity`
- `missing_deity`
- `shadow_deity`
- `activation_practice`

This is symbolic navigation, not psychological diagnosis.

## Future API Integration

Suggested next steps:

- Move data into Supabase table `deities`
- Add user profiles and draw history
- Add AI navigator endpoint
- Add card image generation pipeline
- Add EGO MON style archetype evolution
- Add shrine-map network with location metadata
- Add export to CSV / JSON / printable cards

## Important Disclaimer

This app uses only deity names selected as classically attested for this MVP dataset, with `source_status`, `source_text`, and `historical_note` fields attached to each entry.

The `source_text` field identifies the classical source category used for adoption, primarily `古事記`, supplemented in future versions by `日本書紀`, `風土記`, `延喜式`, and `祝詞` where needed.

This app treats Japanese deities as cultural, symbolic, psychological, and mythological archetypes.

It is not a religious authority, medical tool, psychological diagnosis, or historical claim engine.

神名・系譜・性格付けには文献差、地域差、時代差があります。このMVPでは、神名の採用根拠とOS解釈を分離します。`historical_note` は確認できる範囲に限定し、`symbolic_interpretation` は人間の心理・行動・感情・身体・創造性を理解するための象徴的再構成として扱います。

神仏習合神、人物神、近現代神、創作神名は、この181柱データセットから除外しています。
