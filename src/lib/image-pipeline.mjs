// The image manifest and the path every image takes: candidate → approved or rejected.
// Plain JavaScript so the Node scripts in /scripts and the local review page share one copy.
// Only approved images are copied into public/photos; candidates wait in image-review/ (not committed).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
export const MANIFEST = path.join(ROOT, "src/content/data/image-manifest.json");
export const PUBLIC_DIR = path.join(ROOT, "public/photos");
export const INBOX_DIR = path.join(ROOT, "image-inbox");
export const CANDIDATE_DIR = path.join(ROOT, "image-review/candidates");
export const REJECTED_DIR = path.join(ROOT, "image-review/rejected");
export const REPLACED_DIR = path.join(ROOT, "image-review/replaced");
export const WIDTH = 800;
export const HEIGHT = 600;
/** Pixabay photos turned down before the manifest existed. */
const LEGACY_REJECTED = path.join(ROOT, "src/content/data/photos-rejected.json");

export function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

/** Writes through a temp file so a crash never leaves half a manifest. */
export function writeManifest(manifest) {
  const tmp = `${MANIFEST}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(manifest, null, 2) + "\n");
  fs.renameSync(tmp, MANIFEST);
}

/** approved: an image is live. candidate: one is waiting for review (the live one, if any, stays). */
export function statusOf(entry) {
  if (entry.candidate) return "candidate";
  if (entry.image) return "approved";
  if (entry.rejected?.length) return "rejected";
  return "missing";
}

function log(entry, action, note) {
  entry.history = [...(entry.history ?? []), { at: new Date().toISOString(), action, ...(note ? { note } : {}) }];
  entry.status = statusOf(entry);
}

/** Pixabay ids that must never be picked again: ones on a card and ones a person turned down. */
export function usedSourceIds(manifest) {
  const ids = new Set(fs.existsSync(LEGACY_REJECTED) ? JSON.parse(fs.readFileSync(LEGACY_REJECTED, "utf8")) : []);
  for (const e of Object.values(manifest)) {
    for (const img of [e.image, e.candidate, ...(e.rejected ?? [])]) if (img?.sourceId) ids.add(img.sourceId);
  }
  return ids;
}

/** 64-bit average hash as 16 hex digits; close hashes mean near-identical pictures. */
export async function averageHash(input) {
  const px = await sharp(input).resize(8, 8, { fit: "fill" }).grayscale().raw().toBuffer();
  const avg = px.reduce((a, b) => a + b, 0) / px.length;
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) nibble = (nibble << 1) | (px[i + j] >= avg ? 1 : 0);
    hex += nibble.toString(16);
  }
  return hex;
}

export function hashDistance(a, b) {
  let bits = 0;
  for (let i = 0; i < 16; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      bits += x & 1;
      x >>= 1;
    }
  }
  return bits;
}

/**
 * Finds the manifest id for a file name or word: "c129", "c129__chatgpt", "employer" or a senseId.
 * Throws when a word matches more than one sense, so the image can't land on the wrong one.
 */
export function resolveId(name, manifest) {
  const key = name.replace(/\.[a-z0-9]+$/i, "").split("__")[0].trim();
  if (manifest[key]) return key;
  const low = key.toLowerCase();
  const hits = Object.entries(manifest).filter(([, e]) => e.word.toLowerCase() === low || e.senseId === key);
  if (hits.length === 1) return hits[0][0];
  if (hits.length > 1) throw new Error(`"${key}" ตรงกับหลายความหมาย: ${hits.map(([id, e]) => `${id} (${e.senseId})`).join(", ")} ให้ตั้งชื่อไฟล์เป็นรหัสแทน`);
  throw new Error(`ไม่พบคำหรือรหัส "${key}" ใน manifest`);
}

/**
 * Resizes an image to 800×600 WebP, checks it and saves it as the item's candidate.
 * Never touches the live image: that only changes on approve().
 * `source`: { origin: "ai" | "pixabay" | "own", tool?, site?, by?, byUrl?, url?, sourceId?, license?, alt?, originalName? }
 */
export async function addCandidate(id, input, source) {
  const manifest = readManifest();
  const entry = manifest[id];
  if (!entry) throw new Error(`ไม่พบรหัส ${id} ใน manifest`);

  const meta = await sharp(input).metadata().catch(() => null);
  if (!meta?.width || !meta?.height) throw new Error("ไฟล์นี้ไม่ใช่ภาพที่อ่านได้");
  const warnings = [];
  if (meta.width < WIDTH || meta.height < HEIGHT) warnings.push(`ภาพต้นฉบับเล็ก (${meta.width}×${meta.height}) อาจไม่คม`);
  const ratio = meta.width / meta.height;
  if (Math.abs(ratio - WIDTH / HEIGHT) > 0.25) warnings.push(`สัดส่วนภาพ ${ratio.toFixed(2)}:1 ต่างจาก 4:3 ขอบภาพจะถูกตัดออก`);

  // "attention" keeps the busiest part of the picture when cropping to 4:3.
  const out = await sharp(input).rotate().resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" }).webp({ quality: 75 }).toBuffer();
  const { channels } = await sharp(out).stats();
  const mean = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
  const spread = (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3;
  if (mean < 45) warnings.push("ภาพมืดมาก");
  if (mean > 225) warnings.push("ภาพสว่างจ้ามาก");
  if (spread < 18) warnings.push("ภาพเกือบเป็นสีเดียว");

  const hash = await averageHash(out);
  for (const [otherId, other] of Object.entries(manifest)) {
    if (otherId !== id && other.image?.hash && hashDistance(hash, other.image.hash) <= 3) {
      warnings.push(`เกือบเหมือนภาพของ ${otherId} (${other.word}) ตรวจว่าไม่ใช่ภาพซ้ำ`);
    }
  }

  fs.mkdirSync(CANDIDATE_DIR, { recursive: true });
  const replacing = entry.candidate;
  fs.writeFileSync(path.join(CANDIDATE_DIR, `${id}.webp`), out);
  entry.candidate = {
    file: `${id}.webp`,
    ...source,
    alt: source.alt ?? entry.word,
    original: { width: meta.width, height: meta.height, format: meta.format },
    sha256: crypto.createHash("sha256").update(out).digest("hex"),
    hash,
    warnings,
    addedAt: new Date().toISOString(),
  };
  log(entry, "candidate", replacing ? `แทน candidate เดิม (${replacing.originalName ?? replacing.file})` : source.originalName);
  writeManifest(manifest);
  return entry;
}

/** Makes the candidate live: copies it to public/photos and keeps the old live image in image-review/replaced. */
export function approve(id) {
  const manifest = readManifest();
  const entry = manifest[id];
  const c = entry?.candidate;
  if (!c) throw new Error(`${id} ไม่มีภาพรอตรวจ`);
  const from = path.join(CANDIDATE_DIR, c.file);
  if (!fs.existsSync(from)) throw new Error(`ไม่พบไฟล์ ${c.file} ใน image-review/candidates`);

  const to = path.join(PUBLIC_DIR, `${id}.webp`);
  if (entry.image && fs.existsSync(to)) {
    fs.mkdirSync(REPLACED_DIR, { recursive: true });
    fs.copyFileSync(to, path.join(REPLACED_DIR, `${id}-${Date.now()}.webp`));
  }
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.copyFileSync(from, to);
  fs.rmSync(from);

  const rest = { ...c };
  delete rest.file;
  delete rest.warnings;
  delete rest.addedAt;
  const addedAt = c.addedAt;
  // ?v= changes with the picture, so browsers don't keep showing an old copy.
  entry.image = { ...rest, src: `/photos/${id}.webp?v=${c.sha256.slice(0, 8)}`, ...(c.origin === "ai" && entry.prompt ? { prompt: entry.prompt } : {}), addedAt, approvedAt: new Date().toISOString() };
  delete entry.candidate;
  log(entry, "approved");
  writeManifest(manifest);
  return entry;
}

/** Turns the candidate down; the file moves to image-review/rejected so it can still be looked at. */
export function reject(id, reason) {
  const manifest = readManifest();
  const entry = manifest[id];
  const c = entry?.candidate;
  if (!c) throw new Error(`${id} ไม่มีภาพรอตรวจ`);
  const from = path.join(CANDIDATE_DIR, c.file);
  const file = `${id}-${Date.now()}.webp`;
  if (fs.existsSync(from)) {
    fs.mkdirSync(REJECTED_DIR, { recursive: true });
    fs.renameSync(from, path.join(REJECTED_DIR, file));
  }
  const rest = { ...c };
  delete rest.warnings;
  entry.rejected = [...(entry.rejected ?? []), { ...rest, file, reason: reason || undefined, rejectedAt: new Date().toISOString() }];
  delete entry.candidate;
  log(entry, "rejected", reason);
  writeManifest(manifest);
  return entry;
}
