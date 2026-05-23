import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../data/yaoyorozu181.json", import.meta.url), "utf8"));
const ids = new Set(data.map((item) => item.id));
const required = [
  "id", "name_ja", "name_kana", "name_romaji", "category", "system", "element",
  "human_os_layer", "brain", "heart", "body", "soul", "role", "archetype", "gift",
  "shadow", "emotion", "body_area", "frequency", "tarot_correspondence", "iching_keyword",
  "description_short", "description_long", "activation_question", "practice", "keywords",
  "related_deities", "source_status", "source_text", "historical_note", "symbolic_interpretation"
];

const errors = [];
if (data.length !== 181) errors.push(`Expected 181 deities, got ${data.length}`);
if (ids.size !== data.length) errors.push("IDs are not unique");

for (const item of data) {
  for (const key of required) {
    if (!(key in item)) errors.push(`${item.id} missing ${key}`);
  }
  for (const key of ["brain", "heart", "body", "soul"]) {
    if (typeof item[key] !== "number" || item[key] < 0 || item[key] > 100) {
      errors.push(`${item.id} has invalid ${key}`);
    }
  }
  if (item.source_status !== "classical") errors.push(`${item.id} source_status must be classical`);
  if (!Array.isArray(item.source_text) || item.source_text.length === 0) errors.push(`${item.id} source_text is empty`);
  if (String(item.name_romaji || "").startsWith("Symbolic-")) errors.push(`${item.id} has placeholder romaji`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Data OK: 181 deities");
