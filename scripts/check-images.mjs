// Checks the image manifest against the files: every approved image exists as an 800×600 WebP,
// every candidate file is there, and nothing in public/photos is unaccounted for. Prints the counts.
// Usage: npm run images:check   (exits with 1 if something is wrong)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CANDIDATE_DIR, PUBLIC_DIR, readManifest, statusOf } from "../src/lib/image-pipeline.mjs";

const manifest = readManifest();
const problems = [];
const count = { approved: 0, candidate: 0, rejected: 0, missing: 0 };
const byKind = {};
const live = new Set();

for (const [id, e] of Object.entries(manifest)) {
  const status = statusOf(e);
  if (e.status !== status) problems.push(`${id}: status says ${e.status} but should be ${status}`);
  count[status]++;
  const k = (byKind[e.kind] ??= { approved: 0, waiting: 0 });
  if (e.image) k.approved++;
  else k.waiting++;

  if (e.image) {
    const file = path.join(PUBLIC_DIR, `${id}.webp`);
    live.add(`${id}.webp`);
    if (!e.image.src.startsWith(`/photos/${id}.webp`)) problems.push(`${id}: src ${e.image.src} doesn't match the id`);
    if (!fs.existsSync(file)) problems.push(`${id}: approved but public/photos/${id}.webp is missing`);
    else {
      const m = await sharp(file).metadata();
      if (m.format !== "webp" || m.width !== 800 || m.height !== 600) problems.push(`${id}: ${m.format} ${m.width}×${m.height}, expected 800×600 webp`);
    }
    if (!e.image.origin || !e.image.license) problems.push(`${id}: approved image has no origin or license`);
  }
  if (e.candidate && !fs.existsSync(path.join(CANDIDATE_DIR, e.candidate.file))) problems.push(`${id}: candidate file ${e.candidate.file} is missing (made on another computer?)`);
  if (e.kind === "diagram" && !e.diagram) problems.push(`${id}: kind is diagram but there is no diagram`);
  if ((e.kind === "photo" || e.kind === "scene") && !e.image && !e.prompt) problems.push(`${id}: no image and no prompt`);
}

for (const f of fs.readdirSync(PUBLIC_DIR)) if (!live.has(f)) problems.push(`public/photos/${f} is not in the manifest`);

const files = fs.readdirSync(PUBLIC_DIR).length;
console.log(`items: ${Object.keys(manifest).length} | image files in public/photos: ${files}`);
console.log(`approved ${count.approved} · candidate ${count.candidate} · rejected ${count.rejected} · missing ${count.missing}`);
for (const [kind, k] of Object.entries(byKind)) console.log(`  ${kind}: ${k.approved} with an image, ${k.waiting} without`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("\nAll good.");
