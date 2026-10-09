// One-off: convert the old artifact's content.js into typed JSON files under src/content.
// Usage: node scripts/import-content.cjs path/to/content.js
const fs = require("fs");
const path = require("path");
const window = {};
eval(fs.readFileSync(process.argv[2], "utf8"));
const C = window.CONTENT;
const out = path.join(__dirname, "..", "src", "content", "data");
fs.mkdirSync(out, { recursive: true });
const write = (name, value) =>
  fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(value, null, 2) + "\n");
write("levels", C.LEVELS);
write("sounds", C.SOUNDS);
write("grammar", C.GRAMMAR);
write("verbs", C.VERBS.map((v) => ({ id: "vb-" + v.v1, ...v })));
write("verb-groups", C.VERB_GROUPS);
write("gloss", C.GLOSS);
write("vocab", C.VOCAB);
write("decks", C.DECKS.filter((d) => d.id !== "u"));
console.log("wrote", fs.readdirSync(out).join(", "));
