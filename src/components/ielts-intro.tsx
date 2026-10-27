// What IELTS is, in plain Thai. Facts follow the published test format; nothing here is a score.
import { BookOpenTextIcon, EarIcon, ExternalLinkIcon, MicIcon, MonitorIcon, PenLineIcon, SigmaIcon, type LucideIcon } from "lucide-react";
import { FORMAT_SOURCE, FORMAT_UPDATE, OVERALL_RULE, ROUNDING_EXAMPLES, SCORING_SOURCE } from "@/content/ielts-guide";

type Skill = { en: string; th: string; time: string; what: string; Icon: LucideIcon };

export const SKILLS: Skill[] = [
  { en: "Listening", th: "การฟัง", time: "ประมาณ 30 นาที · 40 ข้อ", what: "ฟัง 4 ตอน ตั้งแต่บทสนทนาในชีวิตประจำวันถึงการบรรยายวิชาการ", Icon: EarIcon },
  { en: "Reading", th: "การอ่าน", time: "60 นาที · 40 ข้อ", what: "อ่าน 3 บทความ ตอบโจทย์หลายแบบ เช่น True / False / Not Given", Icon: BookOpenTextIcon },
  { en: "Writing", th: "การเขียน", time: "60 นาที · 2 งาน", what: "Task 1 อธิบายข้อมูลหรือเขียนจดหมาย และ Task 2 เรียงความแสดงความเห็น", Icon: PenLineIcon },
  { en: "Speaking", th: "การพูด", time: "11–14 นาที · 3 ส่วน", what: "คุยกับผู้สอบตัวต่อตัว ตั้งแต่เรื่องทั่วไปจนถึงแสดงความคิดเห็น", Icon: MicIcon },
];

/** Drawn with the Academic Studio tokens, so it sits inside an <AcademicPage>. */
export function IeltsIntro({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 text-[16px] leading-7 text-(--ac-body)">
          <p>
            <b className="text-(--ac-heading)">IELTS</b> (International English Language Testing System) คือข้อสอบวัดความสามารถภาษาอังกฤษ
            ที่มหาวิทยาลัย บริษัท และหน่วยงานด้านวีซ่าในหลายประเทศใช้ ผลสอบบอกเป็น <b className="text-(--ac-heading)">Band 0–9</b>
            แยกทีละทักษะ และมีคะแนนรวม (Overall)
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="card p-5">
              <b className="block text-(--ac-heading)">Academic</b>
              <span className="text-sm leading-6 text-(--ac-muted)">สำหรับเรียนต่อปริญญาตรี–โท หรือวิชาชีพบางสาขา</span>
            </li>
            <li className="card p-5">
              <b className="block text-(--ac-heading)">General Training</b>
              <span className="text-sm leading-6 text-(--ac-muted)">สำหรับทำงานหรือย้ายถิ่นฐาน Reading และ Writing Task 1 ต่างจาก Academic</span>
            </li>
          </ul>
          <p className="text-sm text-(--ac-muted)">Listening และ Speaking เหมือนกันทั้งสองแบบ ส่วน Reading และ Writing ต่างกันตามประเภท</p>
        </div>
        <div className="on-dark flex flex-col gap-3 rounded-2xl bg-(--ac-dark) p-6 text-white">
          <H className="ac-serif text-xl font-bold text-white">Band 0–9 อ่านอย่างไร</H>
          {[
            ["4.0–5.0", "ใช้ภาษาได้จำกัด เข้าใจเรื่องคุ้นเคย"],
            ["5.5–6.5", "ใช้งานได้ดีพอสมควร เป็นเกณฑ์ที่หลายหลักสูตรขอ"],
            ["7.0–8.0", "ใช้ได้คล่อง ผิดบ้างในเรื่องซับซ้อน"],
            ["8.5–9.0", "ใช้ได้แม่นและยืดหยุ่นแทบทุกสถานการณ์"],
          ].map(([band, meaning]) => (
            <div key={band} className="flex items-baseline gap-3 border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
              <span className="w-[4.5rem] shrink-0 font-mono text-sm text-(--ac-gold-bright)">{band}</span>
              <span className="text-sm text-on-dark">{meaning}</span>
            </div>
          ))}
          <p className="text-xs text-on-dark-muted">สรุปอย่างย่อโดย Odyssey ไม่ใช่คำอธิบาย Band ทางการ เกณฑ์ที่ต้องใช้ขึ้นกับแต่ละสถาบัน ควรเช็กกับที่ที่คุณจะยื่นผล</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map(({ en, th, time, what, Icon }) => (
          <li key={en} className="card flex flex-col gap-2 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-(--ac-gold-soft) text-(--ac-gold-ink)"><Icon className="size-5" aria-hidden /></span>
            <H className="ac-serif mt-1 text-xl font-bold text-(--ac-heading)">{en}</H>
            <span className="text-xs font-medium text-(--ac-gold-ink)">{th} · {time}</span>
            <p className="text-sm leading-6 text-(--ac-body)">{what}</p>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card flex flex-col gap-3 p-5 sm:p-6" aria-labelledby="overall-title">
          <span className="grid size-11 place-items-center rounded-xl bg-(--ac-gold-soft) text-(--ac-gold-ink)"><SigmaIcon className="size-5" aria-hidden /></span>
          <H id="overall-title" className="ac-serif text-xl font-bold text-(--ac-heading)">Band รวม (Overall) คิดอย่างไร</H>
          <p className="text-sm leading-6 text-(--ac-body)">{OVERALL_RULE.th}</p>
          <ul className="grid grid-cols-3 gap-2">
            {ROUNDING_EXAMPLES.map((e) => (
              <li key={e.average} className="rounded-lg bg-(--ac-bg) px-3 py-2.5 text-center">
                <span className="block font-mono text-xs text-(--ac-muted)">เฉลี่ย {e.average}</span>
                <b className="font-mono text-lg text-(--ac-navy)">{e.overall.toFixed(1)}</b>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-5 text-(--ac-muted)">
            ใช้อธิบายกติกาเท่านั้น คะแนนแบบทดสอบและการสอบวัดระดับในเว็บนี้ไม่ใช่ Band IELTS{" "}
            <a href={SCORING_SOURCE} target="_blank" rel="noreferrer" className="inline-flex min-h-6 items-center gap-1 underline hover:text-(--ac-navy)">ที่มา: ielts.org<ExternalLinkIcon className="size-3" aria-hidden /></a>
          </p>
        </section>
        <section className="card flex flex-col gap-3 p-5 sm:p-6" aria-labelledby="format-title">
          <span className="grid size-11 place-items-center rounded-xl bg-(--ac-gold-soft) text-(--ac-gold-ink)"><MonitorIcon className="size-5" aria-hidden /></span>
          <H id="format-title" className="ac-serif text-xl font-bold text-(--ac-heading)">รูปแบบการสอบตั้งแต่ปี 2026</H>
          <ul className="flex flex-col gap-2">
            {FORMAT_UPDATE.points.map((p) => (
              <li key={p.en} className="flex gap-2.5 text-sm leading-6 text-(--ac-body)">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-(--ac-gold)" aria-hidden />
                {p.th}
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-(--ac-gold-soft) px-3 py-2.5 text-sm font-medium text-(--ac-heading)">{FORMAT_UPDATE.advice.th}</p>
          <p className="text-xs leading-5 text-(--ac-muted)">
            ตามประกาศวันที่ {FORMAT_UPDATE.announcedTh} · ตรวจข้อมูลล่าสุด {FORMAT_UPDATE.checkedTh}{" "}
            <a href={FORMAT_SOURCE} target="_blank" rel="noreferrer" className="inline-flex min-h-6 items-center gap-1 underline hover:text-(--ac-navy)">ที่มา: ielts.org<ExternalLinkIcon className="size-3" aria-hidden /></a>
          </p>
        </section>
      </div>
    </div>
  );
}
