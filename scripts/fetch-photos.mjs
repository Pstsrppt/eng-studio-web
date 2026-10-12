// Finds a Pixabay photo for every word in vocab.json, using the word's photoQuery (the scene of its example),
// and saves a small WebP copy in public/photos (Pixabay asks apps to host the images themselves).
// Usage: node --env-file=.env.local scripts/fetch-photos.mjs
// Needs PIXABAY_API_KEY (free: https://pixabay.com/api/docs/). Safe to stop and rerun: words with a photo are skipped.
import fs from "node:fs";
import sharp from "sharp";

const VOCAB = "src/content/data/vocab.json";
const OUT = "src/content/data/photos.json";
const DIR = "public/photos";
const key = process.env.PIXABAY_API_KEY;
if (!key) {
  console.error("PIXABAY_API_KEY is missing. Add it to .env.local (free key: https://pixabay.com/api/docs/).");
  process.exit(1);
}

fs.mkdirSync(DIR, { recursive: true });
const words = JSON.parse(fs.readFileSync(VOCAB, "utf8"));
const photos = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const used = new Set(Object.values(photos).map((p) => p.sourceId));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(OUT, JSON.stringify(photos, null, 2) + "\n");

async function search(query) {
  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=20`;
  for (;;) {
    const res = await fetch(url);
    if (res.status === 429) {
      const wait = Number(res.headers.get("x-ratelimit-reset") ?? 60) * 1000 + 1000;
      console.log(`rate limit, waiting ${Math.round(wait / 1000)} s`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`Pixabay answered ${res.status}`);
    return (await res.json()).hits;
  }
}

// Brands, logos and characters don't belong on a vocabulary card.
const AVOID = /(logo|brand|trademark|yoda|star wars|kermit|minion|lego|disney|chrome|google|facebook|instagram|amazon)/i;

/** The unused hit whose tags share the most words with the query and the word itself. */
function best(hits, w) {
  const terms = new Set(`${w.photoQuery} ${w.en}`.toLowerCase().split(/\s+/).filter((t) => t.length > 2));
  const score = (h) => h.tags.toLowerCase().split(/,\s*/).filter((tag) => tag.split(" ").some((t) => terms.has(t))).length;
  const ok = hits.filter((h) => !used.has(h.id) && !AVOID.test(h.tags));
  return [...ok].sort((a, b) => score(b) - score(a))[0] ?? ok[0] ?? hits.find((h) => !AVOID.test(h.tags));
}

const todo = words.filter((w) => w.photoQuery && !photos[w.id]);
console.log(`${todo.length} words need a photo`);

for (const [i, w] of todo.entries()) {
  try {
    // Fall back to fewer keywords when the full scene finds nothing.
    let hits = await search(w.photoQuery);
    if (hits.length === 0) hits = await search(w.photoQuery.split(" ").slice(0, 2).join(" "));
    const pick = best(hits, w);
    if (!pick) {
      console.log(`${i + 1}/${todo.length} ${w.en}: nothing for "${w.photoQuery}"`);
      continue;
    }
    const image = Buffer.from(await (await fetch(pick.largeImageURL)).arrayBuffer());
    const file = `${DIR}/${w.id}.webp`;
    await sharp(image).resize(800, 600, { fit: "cover" }).webp({ quality: 70 }).toFile(file);
    used.add(pick.id);
    photos[w.id] = {
      sourceId: pick.id,
      src: `/photos/${w.id}.webp`,
      alt: pick.tags,
      by: pick.user,
      byUrl: `https://pixabay.com/users/${pick.user}-${pick.user_id}/`,
      url: pick.pageURL,
      site: "Pixabay",
    };
    save();
    console.log(`${i + 1}/${todo.length} ${w.en} <- ${pick.tags}`);
  } catch (e) {
    console.error(`${w.en}: ${e.message}`);
  }
  await sleep(700); // stays under 100 searches a minute
}
console.log(`done: ${Object.keys(photos).length} words have a photo`);
