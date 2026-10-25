// Facts about IELTS for the Home page guide. English first, Thai alongside (shown with the
// "คำแปลไทย" toggle). Band descriptions quote the official IELTS band scale:
// https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail
// Nothing here is a learner's score; the explorer only explains what a band means.

export type Bilingual = { en: string; th: string };

export type TestType = {
  id: "academic" | "general";
  name: string;
  tagline: Bilingual;
  suitable: Bilingual[];
  reading: Bilingual;
  writing: Bilingual;
};

export const TEST_TYPES: TestType[] = [
  {
    id: "academic",
    name: "IELTS Academic",
    tagline: { en: "For study at university level and some professional registrations.", th: "สำหรับเรียนต่อระดับมหาวิทยาลัย และการขึ้นทะเบียนวิชาชีพบางสาขา" },
    suitable: [
      { en: "University and higher education", th: "เรียนต่อปริญญาตรี โท และสูงกว่า" },
      { en: "Professional registration where required", th: "ขึ้นทะเบียนวิชาชีพที่กำหนดให้ใช้" },
      { en: "Academic English preparation", th: "เตรียมภาษาอังกฤษเชิงวิชาการ" },
    ],
    reading: { en: "Three long texts from books, journals, magazines and newspapers.", th: "บทความยาว 3 เรื่อง จากหนังสือ วารสาร นิตยสาร และหนังสือพิมพ์" },
    writing: { en: "Task 1: describe a graph, table, chart, diagram or process. Task 2: an essay.", th: "Task 1 อธิบายกราฟ ตาราง แผนภูมิ หรือขั้นตอน · Task 2 เรียงความ" },
  },
  {
    id: "general",
    name: "IELTS General Training",
    tagline: { en: "For work, migration where accepted, and training below degree level.", th: "สำหรับทำงาน ย้ายถิ่นฐานในที่ที่รับผลนี้ และการฝึกอบรมต่ำกว่าระดับปริญญา" },
    suitable: [
      { en: "Migration where accepted", th: "ย้ายถิ่นฐาน ในประเทศหรือหน่วยงานที่รับผลประเภทนี้" },
      { en: "Workplace and everyday English", th: "ภาษาอังกฤษในที่ทำงานและชีวิตประจำวัน" },
      { en: "Training and education below degree level", th: "การฝึกอบรมและการเรียนที่ต่ำกว่าระดับปริญญา" },
    ],
    reading: { en: "Everyday texts such as notices, adverts and workplace handbooks, then one longer text.", th: "ข้อความในชีวิตประจำวัน เช่น ประกาศ โฆษณา คู่มือพนักงาน แล้วตามด้วยบทความยาว 1 เรื่อง" },
    writing: { en: "Task 1: a letter (formal, semi-formal or informal). Task 2: an essay.", th: "Task 1 เขียนจดหมาย (ทางการ กึ่งทางการ หรือไม่เป็นทางการ) · Task 2 เรียงความ" },
  },
];

export const TEST_NOTES: Bilingual[] = [
  { en: "Listening and Speaking are the same in both tests.", th: "Listening และ Speaking เหมือนกันทั้งสองประเภท" },
  { en: "Reading and Writing are different.", th: "Reading และ Writing มีเนื้อหาต่างกัน" },
  { en: "Check what your university, employer or authority asks for before you choose.", th: "ตรวจข้อกำหนดของมหาวิทยาลัย องค์กร หรือหน่วยงานที่จะยื่นผลก่อนเลือกประเภทสอบ" },
];

export type BandInfo = {
  band: string;
  /** Official skill level for whole bands; half bands sit between two of them. */
  level: string;
  /** Quoted from the official band scale (whole bands only). */
  official?: string;
  officialTh?: string;
  focus: Bilingual[];
  stage: string;
};

const WHOLE: Record<number, { level: string; official: string; officialTh: string }> = {
  5: {
    level: "Modest",
    official: "The test taker has a partial command of the language and copes with overall meaning in most situations, although they are likely to make many mistakes. They should be able to handle basic communication in their own field.",
    officialTh: "ใช้ภาษาได้บางส่วน เข้าใจความหมายโดยรวมในสถานการณ์ส่วนใหญ่ แต่มีแนวโน้มผิดพลาดมาก ควรสื่อสารพื้นฐานในสายงานของตัวเองได้",
  },
  6: {
    level: "Competent",
    official: "The test taker has an effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings. They can use and understand reasonably complex language, particularly in familiar situations.",
    officialTh: "ใช้ภาษาได้อย่างมีประสิทธิภาพ แม้มีจุดผิด ใช้ไม่เหมาะสม หรือเข้าใจผิดบ้าง ใช้และเข้าใจภาษาที่ค่อนข้างซับซ้อนได้ โดยเฉพาะในเรื่องที่คุ้นเคย",
  },
  7: {
    level: "Good",
    official: "The test taker has operational command of the language, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations. They generally handle complex language well and understand detailed reasoning.",
    officialTh: "ใช้ภาษาได้คล่อง แม้บางครั้งมีจุดผิด ใช้ไม่เหมาะสม หรือเข้าใจผิดในบางสถานการณ์ โดยทั่วไปรับมือภาษาที่ซับซ้อนได้ดี และเข้าใจการให้เหตุผลที่ละเอียด",
  },
  8: {
    level: "Very good",
    official: "The test taker has fully operational command of the language with only occasional unsystematic inaccuracies and inappropriate usage. They may misunderstand some things in unfamiliar situations. They handle complex and detailed argumentation well.",
    officialTh: "ใช้ภาษาได้คล่องเต็มที่ ผิดหรือใช้ไม่เหมาะสมเพียงบางครั้งโดยไม่เป็นรูปแบบ อาจเข้าใจผิดบ้างในสถานการณ์ที่ไม่คุ้นเคย รับมือการโต้แย้งที่ซับซ้อนและละเอียดได้ดี",
  },
};

/** General study focus for each band: guidance only, not a promise of a result. */
const FOCUS: Record<string, Bilingual[]> = {
  "5.0": [
    { en: "Secure core grammar: tenses, sentence structure, questions.", th: "ปูไวยากรณ์หลักให้แน่น: tense โครงประโยค และการตั้งคำถาม" },
    { en: "Learn high-frequency vocabulary with example sentences.", th: "จำคำศัพท์ที่ใช้บ่อยพร้อมประโยคตัวอย่าง" },
  ],
  "5.5": [
    { en: "Widen your grammar range and word bank.", th: "ขยายรูปแบบไวยากรณ์และคลังคำศัพท์" },
    { en: "Start short timed practice with each question type.", th: "เริ่มฝึกจับเวลาสั้นๆ กับโจทย์แต่ละแบบ" },
  ],
  "6.0": [
    { en: "Aim for accuracy in longer, complex sentences.", th: "เน้นความถูกต้องในประโยคยาวและซับซ้อน" },
    { en: "Practise paraphrasing and clear paragraph structure.", th: "ฝึกถอดความ (paraphrase) และจัดย่อหน้าให้ชัด" },
  ],
  "6.5": [
    { en: "Use less common vocabulary and structures with fewer errors.", th: "ใช้คำศัพท์และโครงสร้างที่หลากหลายขึ้นโดยผิดน้อยลง" },
    { en: "Learn strategies for each part of the test.", th: "เรียนเทคนิคของแต่ละส่วนในข้อสอบ" },
  ],
  "7.0": [
    { en: "Build well-supported arguments in Writing Task 2.", th: "เขียนเหตุผลที่มีหลักฐานรองรับใน Writing Task 2" },
    { en: "Work on precise word choice and natural collocations.", th: "เลือกคำให้แม่นและใช้คำที่มักใช้คู่กันอย่างเป็นธรรมชาติ" },
  ],
  "7.5": [
    { en: "Reduce the occasional errors that remain under time pressure.", th: "ลดข้อผิดพลาดที่ยังเหลือเมื่อต้องทำภายใต้เวลาจำกัด" },
    { en: "Get feedback on Writing and Speaking regularly.", th: "ขอคำติชมงานเขียนและการพูดอย่างสม่ำเสมอ" },
  ],
  "8.0": [
    { en: "Keep your accuracy consistent across full, timed tests.", th: "รักษาความแม่นยำให้คงที่ตลอดการสอบเต็มชุดแบบจับเวลา" },
    { en: "Polish nuance and flexibility in complex topics.", th: "ขัดเกลาความลึกและความยืดหยุ่นของภาษาในเรื่องซับซ้อน" },
  ],
};

const STAGE_FOR: Record<string, string> = { "5.0": "foundation", "5.5": "grammar", "6.0": "grammar", "6.5": "skills", "7.0": "strategy", "7.5": "practice", "8.0": "practice" };

export const BANDS: BandInfo[] = ["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0"].map((band) => {
  const n = Number(band);
  const whole = WHOLE[n];
  return whole
    ? { band, level: whole.level, official: whole.official, officialTh: whole.officialTh, focus: FOCUS[band], stage: STAGE_FOR[band] }
    : { band, level: `Between ${WHOLE[Math.floor(n)].level} and ${WHOLE[Math.ceil(n)].level}`, focus: FOCUS[band], stage: STAGE_FOR[band] };
});

/** Official rule for the overall band (quoted from the same page). */
export const OVERALL_RULE: Bilingual = {
  en: "The overall band score is the average of the four section band scores rounded to the nearest half band.",
  th: "Band รวมคือค่าเฉลี่ยของ 4 ทักษะ ปัดเป็นครึ่ง Band ที่ใกล้ที่สุด",
};

export const FAQ: { q: string; a: Bilingual }[] = [
  {
    q: "What is IELTS?",
    a: {
      en: "IELTS (International English Language Testing System) tests Listening, Reading, Writing and Speaking. Results are given as bands from 0 to 9 for each skill, plus an overall band. Universities, employers and immigration authorities in many countries use it.",
      th: "IELTS วัดภาษาอังกฤษ 4 ทักษะ คือ ฟัง อ่าน เขียน พูด ผลออกเป็น Band 0–9 แยกทีละทักษะ และมี Band รวม มหาวิทยาลัย นายจ้าง และหน่วยงานด้านวีซ่าในหลายประเทศใช้ผลนี้",
    },
  },
  {
    q: "Can I start learning with little English knowledge?",
    a: {
      en: "Yes. Start with the placement test, then follow the roadmap from English Foundation. Every lesson begins with its new words, and Thai translations can stay on while you learn.",
      th: "ได้ เริ่มจากสอบวัดระดับ แล้วเรียนตาม Roadmap ตั้งแต่ English Foundation ทุกบทเริ่มจากคำศัพท์ใหม่ของบท และเปิดคำแปลไทยไว้ระหว่างเรียนได้",
    },
  },
  {
    q: "What is the difference between Academic and General Training?",
    a: {
      en: "Listening and Speaking are the same. Academic Reading uses longer academic texts and Writing Task 1 describes visual information; General Training uses everyday texts and Task 1 is a letter. Choose the one your university, employer or authority asks for.",
      th: "Listening และ Speaking เหมือนกัน Academic ใช้บทความวิชาการและ Writing Task 1 เป็นการอธิบายข้อมูลภาพ ส่วน General Training ใช้ข้อความในชีวิตประจำวันและ Task 1 เป็นจดหมาย เลือกตามที่สถาบันหรือหน่วยงานที่จะยื่นกำหนด",
    },
  },
  {
    q: "How do IELTS band scores work?",
    a: {
      en: "Each skill gets a band from 0 to 9, and half bands such as 6.5 are possible. The overall band is the average of the four, rounded to the nearest half band. Many institutions ask for an overall band and a minimum in each skill.",
      th: "แต่ละทักษะได้ Band 0–9 และมีครึ่ง Band เช่น 6.5 ได้ Band รวมคือค่าเฉลี่ยของ 4 ทักษะ ปัดเป็นครึ่ง Band ที่ใกล้ที่สุด หลายสถาบันกำหนดทั้ง Band รวมและคะแนนขั้นต่ำของแต่ละทักษะ",
    },
  },
  {
    q: "How should I start preparing?",
    a: {
      en: "Find out what band you need and which test type. Take the placement test to see where your English is now, then study a little every day: grammar and vocabulary first, then skills and exam practice.",
      th: "หาให้ได้ก่อนว่าต้องใช้ Band เท่าไรและสอบประเภทไหน สอบวัดระดับเพื่อดูพื้นฐานตอนนี้ แล้วเรียนทุกวันทีละน้อย เริ่มจากไวยากรณ์และคำศัพท์ ต่อด้วยทักษะและการฝึกทำข้อสอบ",
    },
  },
  {
    q: "Are practice scores on this website official IELTS results?",
    a: {
      en: "No. Quiz and practice scores show how well you know a lesson, and the placement test gives a CEFR level (A1–B2), not an IELTS band. Official results come only from an IELTS test taken at an official test centre.",
      th: "ไม่ใช่ คะแนนแบบทดสอบและแบบฝึกบอกว่าเข้าใจบทเรียนแค่ไหน และสอบวัดระดับบอกระดับ CEFR (A1–B2) ไม่ใช่ Band IELTS ผลอย่างเป็นทางการได้จากการสอบ IELTS ที่ศูนย์สอบที่ได้รับอนุญาตเท่านั้น",
    },
  },
];
