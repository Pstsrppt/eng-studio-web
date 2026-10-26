# Academic Studio photos (Home, Roadmap, Lessons)

Save each image here as WebP with the exact file name below. The Home page shows a placeholder
until the file exists; after adding a file, rebuild or redeploy and the photo appears.

Shared style for all five (paste after each prompt):

> Photorealistic editorial interior photograph, natural daylight from large windows, premium academic
> environment, warm ivory and cream tones with deep navy and subtle brushed-gold accents, soft shadows,
> shallow depth of field, calm and uncluttered, consistent colour grade across a series.
> No people, no hands, no characters, no mascots, no robots, no fantasy elements, no glowing or surreal
> objects. No text, letters, numbers, logos or brand marks anywhere: book spines, paper, mugs and screens
> are blank or unreadable.

| File | Size to export | Aspect | Prompt |
|---|---|---|---|
| `hero-study.webp` | 2400 × 1500 | 16:10 | A modern academic study room seen from inside: a light oak desk in the foreground with a neat stack of navy hardcover books, an open notebook and a fountain pen; tall arched windows behind with soft daylight and a blurred view of classic university stone buildings and green trees; a deep-navy wall panel on the right with a framed world map; a small vintage globe and a plant. Main subjects sit in the right two thirds; keep the left third calm and light (text will be placed there). |
| `skill-listening.webp` | 1200 × 750 | 16:10 | Premium cream over-ear headphones resting on an open notebook on a light wooden desk, a pencil beside them, soft window light from the left, blurred bright study room behind. |
| `skill-reading.webp` | 1200 × 750 | 16:10 | A tidy stack of hardcover books in navy, cream and muted gold lying on a wooden table, one book open on top, blurred bookshelves and daylight in the background. |
| `skill-writing.webp` | 1200 × 750 | 16:10 | An open lined notebook with a few lines of blurred, illegible handwriting, a navy fountain pen with a gold clip resting across it, on a light oak desk in soft daylight. |
| `roadmap-banner.webp` | 2400 × 700 | 24:7 | A wide, quiet view along a sunlit university library hall: long rows of wooden reading tables, tall shelves of navy and cream hardcover books, arched windows with daylight, polished floor, brass reading lamps. Keep the left 40% calm and light (the page title sits there). Until this file exists the Roadmap uses `hero-study.webp`. |
| `lesson-banner.webp` | 1600 × 900 | 16:9 | Close view of a study desk by a window: an open textbook, a notebook with blurred handwriting, a navy pen and a cup, soft daylight from the right, shallow depth of field, bookshelves blurred behind. Subject on the right half. Until this file exists lessons use `skill-reading.webp`. |
| `skill-speaking.webp` | 1200 × 750 | 16:10 | A black studio microphone on a small desk stand in a bright, quiet study room, softly blurred background with a window and books, warm natural light. |

Converting a downloaded PNG or JPG to the right file (from the project folder):

```
node -e "require('sharp')(process.argv[1]).resize(2400,1500,{fit:'cover'}).webp({quality:78}).toFile('public/academic/hero-study.webp')" path/to/download.png
```

Use 1200,750 and the skill file name for the four skill photos.
