// Takes images you made yourself (ChatGPT, Gemini, a camera…) from image-inbox/ and adds each one as a
// candidate for review: resized to 800×600 WebP, checked, and recorded in the manifest with where it came from.
// Name each file after the word's id (c129.png) or the word (employer.png). Live images don't change until approved.
// Usage: npm run images:ingest -- --tool "ChatGPT"      (other options: --origin own, --license "...")
import fs from "node:fs";
import path from "node:path";
import { addCandidate, INBOX_DIR, readManifest, resolveId } from "../src/lib/image-pipeline.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const origin = opt("origin", "ai");
const tool = opt("tool", origin === "ai" ? "AI image tool (not named)" : undefined);
const license = opt("license", origin === "ai" ? "AI-generated for this project by its owner" : "Owned by the project owner");

const DONE = path.join(INBOX_DIR, "done");
fs.mkdirSync(DONE, { recursive: true });
const files = fs.readdirSync(INBOX_DIR).filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));
if (files.length === 0) {
  console.log(`No images in ${path.relative(process.cwd(), INBOX_DIR)}/. Save them there as <id>.png, e.g. c129.png`);
  process.exit(0);
}

let added = 0;
for (const file of files) {
  try {
    const id = resolveId(file, readManifest());
    const entry = await addCandidate(id, fs.readFileSync(path.join(INBOX_DIR, file)), { origin, tool, license, site: origin === "ai" ? "AI" : "Own photo", by: tool, originalName: file });
    // Keep the original next to the others already done, in case it needs another crop.
    fs.renameSync(path.join(INBOX_DIR, file), path.join(DONE, `${Date.now()}-${file}`));
    const notes = entry.candidate.warnings.length ? ` (ตรวจ: ${entry.candidate.warnings.join("; ")})` : "";
    console.log(`✓ ${file} → ${id} ${entry.word}${notes}`);
    added++;
  } catch (e) {
    console.log(`✗ ${file}: ${e.message}`);
  }
}
console.log(`\n${added}/${files.length} added as candidates. Review them at http://localhost:3000/review/images`);
