# Lesson loading and accessibility check

Unit tests can't see colours, layout or a held network response, so these fixes also have a browser check.

## Run it

```sh
npm run build
npx next start -p 3999
npm i --no-save puppeteer-core axe-core
node scripts/qa/loading-a11y-check.mjs http://localhost:3999
```

Chrome is found at the Windows default path. Elsewhere, set `CHROME_PATH`.

## What it checks

- A lesson navigation stays out of sight for a quick response, then shows "กำลังเปิดบทเรียน".
- If no response comes, a reload link appears.
- The Roadmap shows its own named waiting state.
- The text on the Flashcard grade buttons passes contrast at 390 and 1440px.
- axe finds no `label-content-name-mismatch` or `target-size` failures on Home or lesson theory at 320, 390 and 1440px.
- Those pages fit the screen.

## By hand

- Screen reader: VoiceOver or TalkBack, on a lesson change, a Flashcard reveal and a theory example.
- Browser text at 200% and zoom at 200%, on a lesson and a Flashcard round.
