// What IELTS is, in plain Thai. Facts follow the published test format; nothing here is a score.
import { BookOpenTextIcon, EarIcon, MicIcon, PenLineIcon, type LucideIcon } from "lucide-react";

type Skill = { en: string; th: string; time: string; what: string; Icon: LucideIcon; tone: string };

export const SKILLS: Skill[] = [
  { en: "Listening", th: "การฟัง", time: "ประมาณ 30 นาที · 40 ข้อ", what: "ฟัง 4 ตอน ตั้งแต่บทสนทนาในชีวิตประจำวันถึงการบรรยายวิชาการ", Icon: EarIcon, tone: "text-[#69d8ff]" },
  { en: "Reading", th: "การอ่าน", time: "60 นาที · 40 ข้อ", what: "อ่าน 3 บทความ ตอบโจทย์หลายแบบ เช่น True / False / Not Given", Icon: BookOpenTextIcon, tone: "text-[#7fe0b8]" },
  { en: "Writing", th: "การเขียน", time: "60 นาที · 2 งาน", what: "Task 1 อธิบายข้อมูลหรือเขียนจดหมาย และ Task 2 เรียงความแสดงความเห็น", Icon: PenLineIcon, tone: "text-[#ffb47a]" },
  { en: "Speaking", th: "การพูด", time: "11–14 นาที · 3 ส่วน", what: "คุยกับผู้สอบตัวต่อตัว ตั้งแต่เรื่องทั่วไปจนถึงแสดงความคิดเห็น", Icon: MicIcon, tone: "text-[#d6a8ff]" },
];

export function IeltsIntro({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 text-[15px] leading-7 text-[#dce5ee]">
          <p>
            <b className="text-white">IELTS</b> (International English Language Testing System) คือข้อสอบวัดความสามารถภาษาอังกฤษ
            ที่มหาวิทยาลัย บริษัท และหน่วยงานด้านวีซ่าในหลายประเทศใช้ ผลสอบบอกเป็น <b className="text-gold-soft">Band 0–9</b>
            แยกทีละทักษะ และมีคะแนนรวม (Overall)
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="glass p-4">
              <b className="block text-white">Academic</b>
              <span className="text-sm text-mist">สำหรับเรียนต่อปริญญาตรี–โท หรือวิชาชีพบางสาขา</span>
            </li>
            <li className="glass p-4">
              <b className="block text-white">General Training</b>
              <span className="text-sm text-mist">สำหรับทำงานหรือย้ายถิ่นฐาน Reading และ Writing Task 1 ต่างจาก Academic</span>
            </li>
          </ul>
          <p className="text-sm text-mist">Listening และ Speaking เหมือนกันทั้งสองแบบ ส่วน Reading และ Writing ต่างกันตามประเภท</p>
        </div>
        <div className="glass flex flex-col gap-3 p-5">
          <H className="font-brand text-lg font-semibold tracking-wide text-gold">Band 0–9 อ่านอย่างไร</H>
          {[
            ["4.0–5.0", "ใช้ภาษาได้จำกัด เข้าใจเรื่องคุ้นเคย"],
            ["5.5–6.5", "ใช้งานได้ดีพอสมควร เป็นเกณฑ์ที่หลายหลักสูตรขอ"],
            ["7.0–8.0", "ใช้ได้คล่อง ผิดบ้างในเรื่องซับซ้อน"],
            ["8.5–9.0", "ใกล้เคียงเจ้าของภาษา"],
          ].map(([band, meaning]) => (
            <div key={band} className="flex items-baseline gap-3 border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
              <span className="w-[4.5rem] shrink-0 font-mono text-sm text-gold-soft">{band}</span>
              <span className="text-sm text-[#dce5ee]">{meaning}</span>
            </div>
          ))}
          <p className="text-xs text-mist">เกณฑ์ที่ต้องใช้ขึ้นกับแต่ละสถาบัน ควรเช็กกับที่ที่คุณจะยื่นผล</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map(({ en, th, time, what, Icon, tone }) => (
          <li key={en} className="glass flex flex-col gap-2 p-5">
            <Icon className={"size-6 " + tone} aria-hidden />
            <H className="font-brand text-lg font-semibold tracking-wide text-white">{en}</H>
            <span className="text-xs text-gold-soft">{th} · {time}</span>
            <p className="text-sm leading-6 text-mist">{what}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
