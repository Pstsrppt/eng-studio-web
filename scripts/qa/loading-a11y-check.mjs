// Browser check for the lesson loading state, grade contrast, accessible names and touch targets.
// How to run it is in docs/qa/loading-a11y.md.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(`${process.cwd()}/`);
const puppeteer = require("puppeteer-core");
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.argv[2] ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = 0;
function check(name, pass, detail = "") {
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

const browser = await puppeteer.launch({ executablePath: CHROME });
async function open(width, height) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, isMobile: width < 1024, hasTouch: width < 1024 });
  return page;
}
const scan = (page) => page.evaluate(axe).then(() => page.evaluate(async () =>
  (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.html.slice(0, 80)) }))));
const openTheory = (page) => page.evaluate(() => [...document.querySelectorAll("#lesson-content button[aria-pressed]")].find((b) => b.getClientRects().length && /ทฤษฎี/.test(b.innerText))?.click());

// Waiting state: hold the lesson's response and look at the screen.
{
  const page = await open(390, 844);
  await page.goto(`${BASE}/grammar/1-1`, { waitUntil: "networkidle0" });
  await wait(300);
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (r.headers().rsc !== undefined && r.url().includes("grammar/1-2")) return;
    r.continue().catch(() => {});
  });
  await page.evaluate(() => window.next.router.push("/grammar/1-2"));
  const state = () => page.evaluate(() => {
    const box = document.querySelector('main [role="status"]');
    return box && { name: box.getAttribute("aria-label"), opacity: getComputedStyle(box).opacity, hint: getComputedStyle(box.querySelector(".lesson-loading-hint")).visibility };
  });
  await wait(60);
  check("loading state stays out of sight on a quick navigation", (await state())?.opacity === "0");
  await wait(700);
  const shown = await state();
  check("loading state shows and is named", shown?.opacity === "1" && shown?.name === "กำลังเปิดบทเรียน", JSON.stringify(shown));
  check("reload link waits", shown?.hint === "hidden");
  await wait(8000);
  check("reload link appears when no response comes", (await state())?.hint === "visible");
  await page.browserContext().close();
}

// The Roadmap has its own waiting state: tap the real tab, with the response held.
{
  const page = await open(390, 844);
  await page.goto(`${BASE}/grammar/1-1`, { waitUntil: "networkidle0" });
  await wait(500);
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (r.headers().rsc !== undefined && !r.headers()["next-router-prefetch"] && new URL(r.url()).pathname === "/roadmap") return;
    r.continue().catch(() => {});
  });
  await (await page.evaluateHandle(() => [...document.querySelectorAll('nav[aria-label="เมนูหลัก"] a[href="/roadmap"]')].find((a) => a.getClientRects().length))).tap();
  await wait(900);
  const name = await page.evaluate(() => [...document.querySelectorAll('main [role="status"]')].find((e) => e.getClientRects().length)?.getAttribute("aria-label"));
  check("Roadmap shows and names its waiting state", name === "กำลังเปิด Roadmap", String(name));
  await page.browserContext().close();
}

// Contrast of the grade buttons, from the colours the browser actually paints.
for (const width of [390, 1440]) {
  const page = await open(width, 900);
  await page.goto(`${BASE}/learn/session?mode=new`, { waitUntil: "networkidle0" });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /เปิดเฉลย/.test(b.innerText)).click());
  await page.waitForSelector('[role=group][aria-label="ให้คะแนนความจำ"]');
  await wait(400);
  const violations = await scan(page);
  const grades = violations.filter((v) => v.id === "color-contrast").flatMap((v) => v.nodes).filter((n) => /ทวน|<kbd|จำ/.test(n));
  check(`${width}px grade buttons have no contrast failures`, grades.length === 0, grades.join(" "));
  await page.browserContext().close();
}

// Names and targets across the screens that had them.
for (const width of [320, 390, 1440]) {
  for (const path of ["/", "/grammar/1-1", "/grammar/1-7", "/sounds/0-1"]) {
    const page = await open(width, 844);
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
    if (path !== "/") {
      await openTheory(page);
      await wait(200);
    }
    const violations = await scan(page);
    for (const id of ["label-content-name-mismatch", "target-size"]) {
      const found = violations.find((v) => v.id === id);
      check(`${width}px ${path} ${id}`, !found, found?.nodes.join(" ") ?? "");
    }
    const wide = await page.evaluate(() => document.documentElement.scrollWidth);
    check(`${width}px ${path} fits the screen`, wide <= width, String(wide));
    await page.browserContext().close();
  }
}

await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
