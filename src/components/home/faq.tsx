import { PlusIcon } from "lucide-react";
import { FAQ } from "@/content/ielts-guide";
import { Thai } from "./thai";

/** Native <details>: keyboard and screen-reader friendly, and opens even before scripts load. */
export function Faq() {
  return (
    <div className="divide-y divide-(--ac-line) overflow-hidden rounded-2xl border border-(--ac-line) bg-white shadow-(--ac-shadow)">
      {FAQ.map((item, i) => (
        <details key={item.q} className="group" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-(--ac-bg) [&::-webkit-details-marker]:hidden">
            <span className="ac-serif text-[18px] font-semibold text-(--ac-navy) sm:text-[19px]">{item.q}</span>
            <PlusIcon className="size-5 shrink-0 text-(--ac-gold) transition group-open:rotate-45" aria-hidden />
          </summary>
          <div className="px-6 pb-6 text-[15px] leading-7 text-(--ac-body)">
            <p>{item.a.en}</p>
            <Thai className="mt-2 text-[15px] leading-7 text-(--ac-muted)">{item.a.th}</Thai>
          </div>
        </details>
      ))}
    </div>
  );
}
