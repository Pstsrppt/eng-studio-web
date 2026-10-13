// Finds a Pixabay photo for each word and verb that has a photoQuery but no image yet, and adds it as a
// candidate for review (/review/images in `npm run dev`). Nothing goes live until someone approves it.
// Usage: npm run images:pixabay   (needs PIXABAY_API_KEY in .env.local; free key: https://pixabay.com/api/docs/)
// Keeps under Pixabay's 100 searches a minute and saves each picture locally, as Pixabay asks apps to do.
import fs from "node:fs";
import { addCandidate, readManifest, usedSourceIds } from "../src/lib/image-pipeline.mjs";

const key = process.env.PIXABAY_API_KEY;
if (!key) {
  console.error("PIXABAY_API_KEY is missing. Add it to .env.local (free key: https://pixabay.com/api/docs/).");
  process.exit(1);
}

// Verbs search the same way; `en` is only used to score how well a photo's tags fit.
const words = [
  ...JSON.parse(fs.readFileSync("src/content/data/vocab.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/content/data/verbs.json", "utf8")).map((v) => ({ ...v, en: v.v1 })),
];
const manifest = readManifest();
const used = usedSourceIds(manifest);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
const AVOID = /(logo|brand|trademark|yoda|star wars|kermit|minion|lego|disney|chrome|google|facebook|instagram|amazon)/i;

/** The unused hit whose tags share the most words with the query and the word itself. */
function best(hits, w) {
  const terms = new Set(`${w.photoQuery} ${w.en}`.toLowerCase().split(/\s+/).filter((t) => t.length > 2));
  const score = (h) => h.tags.toLowerCase().split(/,\s*/).filter((tag) => tag.split(" ").some((t) => terms.has(t))).length;
  const ok = hits.filter((h) => !used.has(h.id) && !AVOID.test(h.tags));
  return [...ok].sort((a, b) => score(b) - score(a))[0];
}

const todo = words.filter((w) => w.photoQuery && manifest[w.id] && !manifest[w.id].image && !manifest[w.id].candidate);
console.log(`${todo.length} words need a photo`);

for (const [i, w] of todo.entries()) {
  try {
    // Fall back to fewer keywords when the full scene finds nothing.
    let hits = await search(w.photoQuery);
    if (hits.length === 0) hits = await search(w.photoQuery.split(" ").slice(0, 2).join(" "));
    const pick = best(hits, w);
    if (!pick) {
      console.log(`${i + 1}/${todo.length} ${w.en}: nothing new for "${w.photoQuery}"`);
      continue;
    }
    const image = Buffer.from(await (await fetch(pick.largeImageURL)).arrayBuffer());
    used.add(pick.id);
    await addCandidate(w.id, image, {
      origin: "pixabay",
      site: "Pixabay",
      by: pick.user,
      byUrl: `https://pixabay.com/users/${pick.user}-${pick.user_id}/`,
      url: pick.pageURL,
      sourceId: pick.id,
      alt: pick.tags,
      license: "Pixabay Content License",
      originalName: `pixabay-${pick.id}`,
    });
    console.log(`${i + 1}/${todo.length} ${w.en} <- ${pick.tags}`);
  } catch (e) {
    console.error(`${w.en}: ${e.message}`);
  }
  await sleep(700); // stays under 100 searches a minute
}
console.log("done. Review the candidates at http://localhost:3000/review/images");
