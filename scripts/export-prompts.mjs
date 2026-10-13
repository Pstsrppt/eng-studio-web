// Writes image-inbox/prompts.md: one prompt per word that still needs a picture, with the file name to save it as.
// Usage: npm run images:prompts   (add --kind scene or --kind photo to list one kind)
import fs from "node:fs";
import path from "node:path";
import { INBOX_DIR, readManifest } from "../src/lib/image-pipeline.mjs";

const i = process.argv.indexOf("--kind");
const kind = i >= 0 ? process.argv[i + 1] : undefined;
const words = Object.fromEntries(
  [...JSON.parse(fs.readFileSync("src/content/data/vocab.json", "utf8")), ...JSON.parse(fs.readFileSync("src/content/data/verbs.json", "utf8"))].map((w) => [w.id, w]),
);

const todo = Object.entries(readManifest()).filter(([, e]) => e.prompt && !e.image && !e.candidate && (!kind || e.kind === kind));
const lines = [`# Image prompts (${todo.length})`, "", "Save each image in image-inbox/ with the file name shown, then run `npm run images:ingest -- --tool \"<tool name>\"`.", ""];
for (const [id, e] of todo) {
  const w = words[id];
  lines.push(`## ${id}.png — ${e.word} (${e.kind})`, "", `Meaning: ${w?.th ?? ""}  `, `Example: ${w?.ex ?? w?.ex2 ?? ""}`, "", "```", e.prompt, "```", "");
}
fs.mkdirSync(INBOX_DIR, { recursive: true });
const out = path.join(INBOX_DIR, "prompts.md");
fs.writeFileSync(out, lines.join("\n"));
console.log(`${todo.length} prompts → ${path.relative(process.cwd(), out)}`);
