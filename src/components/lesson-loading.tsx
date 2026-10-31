/**
 * What shows while a lesson streams in. A quick navigation never sees it: it stays transparent for its first moments
 * (.lesson-loading in globals.css). The link appears only if the wait runs long, because a response that never
 * arrives raises no error and would otherwise leave the learner here for good.
 */
export function LessonLoading() {
  return (
    <div role="status" aria-label="กำลังเปิดบทเรียน" className="lesson-loading page-bleed min-h-[70vh] bg-page">
      <div className="mx-auto flex max-w-[908px] flex-col gap-5 px-4 pt-6 cramped:px-2 sm:px-6">
        <p className="text-sm font-semibold text-heading">กำลังเปิดบทเรียน…</p>
        <div className="flex animate-pulse flex-col gap-5" aria-hidden>
          <div className="h-7 w-2/3 rounded-lg bg-sunken" />
          <div className="flex gap-2 overflow-hidden">
            <div className="h-11 w-28 shrink-0 rounded-xl bg-sunken" />
            <div className="h-11 w-28 shrink-0 rounded-xl bg-sunken" />
            <div className="h-11 w-28 shrink-0 rounded-xl bg-sunken" />
          </div>
          <div className="h-64 rounded-2xl border border-rule bg-card" />
        </div>
        {/* An empty href is this page's own address, so it reloads the lesson whatever the fallback was rendered for. */}
        <p className="lesson-loading-hint text-sm text-body">
          ใช้เวลานานกว่าปกติ <a href="" className="inline-flex min-h-11 items-center font-semibold text-primary underline">โหลดหน้านี้อีกครั้ง</a>
        </p>
      </div>
    </div>
  );
}
