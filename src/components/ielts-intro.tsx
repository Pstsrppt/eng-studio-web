// What IELTS is, in plain Thai. Facts follow the published test format; nothing here is a score.
import { BookOpenTextIcon, EarIcon, MicIcon, PenLineIcon, type LucideIcon } from "lucide-react";

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
            <b className="text-(--ac-navy)">IELTS</b> (International English Language Testing System) คือข้อสอบวัดความสามารถภาษาอังกฤษ
            ที่มหาวิทยาลัย บริษัท และหน่วยงานด้านวีซ่าในหลายประเทศใช้ ผลสอบบอกเป็น <b className="text-(--ac-navy)">Band 0–9</b>
            แยกทีละทักษะ และมีคะแนนรวม (Overall)
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="card p-5">
              <b className="block text-(--ac-navy)">Academic</b>
              <span className="text-sm leading-6 text-(--ac-muted)">สำหรับเรียนต่อปริญญาตรี–โท หรือวิชาชีพบางสาขา</span>
            </li>
            <li className="card p-5">
              <b className="block text-(--ac-navy)">General Training</b>
              <span className="text-sm leading-6 text-(--ac-muted)">สำหรับทำงานหรือย้ายถิ่นฐาน Reading และ Writing Task 1 ต่างจาก Academic</span>
            </li>
          </ul>
          <p className="text-sm text-(--ac-muted)">Listening และ Speaking เหมือนกันทั้งสองแบบ ส่วน Reading และ Writing ต่างกันตามประเภท</p>
        </div>
        <div className="on-dark flex flex-col gap-3 rounded-2xl bg-(--ac-navy) p-6 text-white">
          <H className="ac-serif text-xl font-bold text-white">Band 0–9 อ่านอย่างไร</H>
          {[
            ["4.0–5.0", "ใช้ภาษาได้จำกัด เข้าใจเรื่องคุ้นเคย"],
            ["5.5–6.5", "ใช้งานได้ดีพอสมควร เป็นเกณฑ์ที่หลายหลักสูตรขอ"],
            ["7.0–8.0", "ใช้ได้คล่อง ผิดบ้างในเรื่องซับซ้อน"],
            ["8.5–9.0", "ใกล้เคียงเจ้าของภาษา"],
          ].map(([band, meaning]) => (
            <div key={band} className="flex items-baseline gap-3 border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
              <span className="w-[4.5rem] shrink-0 font-mono text-sm text-(--ac-gold-bright)">{band}</span>
              <span className="text-sm text-[#dfe5ee]">{meaning}</span>
            </div>
          ))}
          <p className="text-xs text-[#c9d3e1]">เกณฑ์ที่ต้องใช้ขึ้นกับแต่ละสถาบัน ควรเช็กกับที่ที่คุณจะยื่นผล</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map(({ en, th, time, what, Icon }) => (
          <li key={en} className="card flex flex-col gap-2 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-(--ac-gold-soft) text-(--ac-gold-ink)"><Icon className="size-5" aria-hidden /></span>
            <H className="ac-serif mt-1 text-xl font-bold text-(--ac-navy)">{en}</H>
            <span className="text-xs font-medium text-(--ac-gold-ink)">{th} · {time}</span>
            <p className="text-sm leading-6 text-(--ac-body)">{what}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
