// Small pure helpers for choosing a stage on the Roadmap, kept apart so they can be tested without a browser.

/** The page address with ?stage= set to this stage; every other parameter (e.g. view) is kept. */
export function withStage(href: string, id: string): string {
  const url = new URL(href);
  url.searchParams.set("stage", id);
  return url.toString();
}

/** How a click on "ดู Stage …" brings the Stage Path into view: no animation when the learner asks for less motion. */
export function jumpScroll(reducedMotion: boolean): ScrollIntoViewOptions {
  return { behavior: reducedMotion ? "auto" : "smooth", block: "start" };
}
