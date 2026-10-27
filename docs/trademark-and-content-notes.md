# IELTS name, trade mark and official content: notes for the owner

Status: open decision for the owner. This is not legal advice and has not been reviewed by a lawyer.
Last checked: 27 October 2026 (branch `fix/phase3-p0-accuracy`).

## What changed in P0

- The verbatim official band descriptors (Bands 5–8, English plus a close Thai translation) were removed from
  `src/content/ielts-guide.ts`. The Band Explorer now shows study notes written for Odyssey, labelled
  "not the official band descriptor", with a link to the official page.
- The official level names (Modest, Competent, Good, Very good) are still shown as short labels.
- An independence notice is shown in the site footer (Thai and English) and on `/ielts#about-odyssey`, with a
  trade mark note naming the IELTS partners (British Council, IDP IELTS, Cambridge University Press & Assessment)
  and saying Odyssey has no licence, partnership or endorsement from them.
- Home no longer says "Exam-format practice" or "Everything you need to confidently reach your target band".
- A regression test (`src/content/ielts-guide.test.ts`) fails if distinctive descriptor phrases or
  "official / endorsed / partner" claims appear anywhere in `src/`.

A disclaimer helps readers understand that Odyssey is independent. It does not on its own make the use of the
IELTS mark in a brand name acceptable.

## Where the IELTS mark is used (not changed in this round)

| Place | Use |
| --- | --- |
| `src/app/manifest.ts` | Installed app name "IELTS Odyssey — A Higher You" |
| `src/app/opengraph-image.png`, `twitter-image.png` and the `.alt.txt` files | "IELTS Odyssey" in the link preview image and its alt text |
| `src/components/site-header.tsx` | Subtitle "IELTS · A HIGHER YOU" under the ODYSSEY wordmark |
| `src/app/layout.tsx` | Page title and description ("เตรียมสอบ IELTS ตั้งแต่พื้นฐาน"): a descriptive use |
| Page copy (Home, /ielts, FAQ, roadmap) | Naming the test, its parts and its scores: descriptive uses |

## Risk

- **Higher:** "IELTS" as part of the product name ("IELTS Odyssey") and in the installed app name. A reader
  may take it as an official or licensed product, and trade mark owners usually object most to this kind of use.
- **Lower:** naming the test to describe what the site prepares for ("prepare for IELTS", "IELTS Academic").
  This is usually treated as descriptive use, but it still needs to stay accurate and avoid any suggestion of
  affiliation.
- **Removed:** reproducing the official band descriptors. ielts.org's copyright statement allows personal,
  non-commercial use only.

## Options for the owner (choose with a trade mark lawyer)

1. **Keep "Odyssey" as the brand and use IELTS only descriptively.** For example, use "Odyssey — IELTS
   preparation" or "Odyssey · English & IELTS prep". Change the manifest name, the social image text and the
   header subtitle. This is the lowest-risk option, with a small rebrand cost.
2. **Keep "IELTS Odyssey"** after a lawyer review and, if needed, written permission from the mark owners.
   This needs a decision on the owners' published trade mark guidelines.
3. **Interim step.** Keep the current name until advice arrives, with the disclaimer in place, and avoid
   paid marketing, app store listings or domain purchases that use "IELTS" in the name.

Not to be done without the owner's decision: changing the brand name, domain, logo or app name.
