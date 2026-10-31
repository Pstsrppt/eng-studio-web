"use client";

import Link from "next/link";

/** A lesson that failed to render says so and offers a way on, rather than leaving a blank or loading page. */
export function LessonRouteError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="card mx-auto my-6 flex max-w-xl flex-col items-start gap-3 p-6">
      <h1 className="text-xl font-bold text-heading">เปิดบทเรียนไม่สำเร็จ</h1>
      <p className="text-body">ลองเปิดอีกครั้ง ถ้ายังไม่ขึ้น กลับไปเลือกบทเรียนจาก Roadmap</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={retry}>ลองอีกครั้ง</button>
        <Link href="/roadmap" className="btn-ghost">กลับไป Roadmap</Link>
      </div>
    </div>
  );
}
