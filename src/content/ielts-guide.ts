// Facts about IELTS for the Home page guide and /ielts. English first, Thai alongside (shown with the
// "คำแปลไทย" toggle). Scoring facts follow the official page linked as SCORING_SOURCE; the band
// summaries are written for this site and are not the official band descriptors.
// Nothing here is a learner's score; the explorer only explains what a band means.

export type Bilingual = { en: string; th: string };

export const SCORING_SOURCE = "https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail";
export const FORMAT_SOURCE = "https://ielts.org/news-and-insights/updates-to-ielts-test-delivery";

/** Shown in the footer and on /ielts. A disclaimer alone does not settle trade mark questions; see the P0 notes. */
export const DISCLAIMER: Bilingual = {
  en: "Odyssey is an independent English and IELTS preparation website. It is not part of, and is not endorsed by, the organisations that run the IELTS test.",
  th: "Odyssey เป็นเว็บไซต์เตรียมภาษาอังกฤษและ IELTS อิสระ ไม่ได้เป็นส่วนหนึ่งของหรือได้รับการรับรองโดยผู้จัดสอบ IELTS",
};

/** Owners as named on ielts.org (copyright and trade mark statement, checked 27 October 2026). */
export const TRADEMARK_NOTE: Bilingual = {
  en: "IELTS is a trade mark of the IELTS partners: the British Council, IDP IELTS and Cambridge University Press & Assessment. Odyssey is an independent website and has no licence, partnership or endorsement from them.",
  th: "IELTS เป็นเครื่องหมายการค้าของหุ้นส่วน IELTS ได้แก่ British Council, IDP IELTS และ Cambridge University Press & Assessment Odyssey เป็นเว็บไซต์อิสระ ไม่ได้รับอนุญาต ไม่ได้เป็นหุ้นส่วน และไม่ได้รับการรับรองจากองค์กรเหล่านี้",
};

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
  /** The official level name for whole bands (a label only); half bands sit between two of them. */
  level: string;
  /** Our own study-oriented summary, written for this site. Not the official descriptor and not a translation of it. */
  summary: Bilingual;
  focus: Bilingual[];
  stage: string;
};

/** Level names from the official band scale. Only the names are used; every description below is ours. */
const LEVEL: Record<number, string> = { 5: "Modest", 6: "Competent", 7: "Good", 8: "Very good" };

/** What learners around each band tend to manage and struggle with, seen from the teaching side. Planning help only. */
const SUMMARY: Record<string, Bilingual> = {
  "5.0": {
    en: "Short, everyday exchanges work: you can ask and answer questions, talk about your routine and pick out key facts from simple texts. Longer or abstract material is hard to keep up with, and frequent grammar slips mean people sometimes have to work to understand you.",
    th: "บทสนทนาสั้นๆ ในชีวิตประจำวันทำได้ ถามตอบ เล่าเรื่องกิจวัตร และหาข้อมูลสำคัญจากข้อความง่ายๆ ได้ แต่เนื้อหายาวหรือนามธรรมยังตามได้ยาก และไวยากรณ์พลาดบ่อยจนบางครั้งคนฟังต้องพยายามจึงจะเข้าใจ",
  },
  "5.5": {
    en: "A step beyond 5: everyday communication feels more secure, but accuracy and range are still uneven. One skill is often clearly ahead of the others, so the overall band can hide a weaker area.",
    th: "ก้าวต่อจาก 5 การสื่อสารในชีวิตประจำวันมั่นใจขึ้น แต่ความแม่นและความหลากหลายของภาษายังไม่สม่ำเสมอ มักมีทักษะหนึ่งนำทักษะอื่นชัด Band รวมจึงอาจบังจุดอ่อนไว้",
  },
  "6.0": {
    en: "You can study or work in English day to day: join a discussion, write a structured answer, read most of a course text. Harder ideas take noticeably more effort, and mistakes and the odd wrong word still show, though they rarely stop the message getting through.",
    th: "ใช้ภาษาอังกฤษเรียนหรือทำงานในแต่ละวันได้ ร่วมอภิปราย เขียนคำตอบที่มีโครงสร้าง และอ่านเอกสารประกอบการเรียนได้เป็นส่วนใหญ่ เรื่องที่ยากขึ้นยังต้องใช้แรงมากกว่าชัดเจน และยังเห็นจุดผิดหรือการเลือกคำพลาด แต่แทบไม่ทำให้สื่อสารไม่ได้",
  },
  "6.5": {
    en: "A common target for university entry. Between 6 and 7: longer sentences and less common words come more often and with more control, but errors still creep in when time is short or the topic is new to you.",
    th: "เป็นเป้าหมายที่หลายมหาวิทยาลัยขอ อยู่ระหว่าง 6 กับ 7 ใช้ประโยคยาวและคำที่ไม่พื้นฐานได้บ่อยขึ้นและคุมได้ดีขึ้น แต่ยังพลาดเมื่อเวลาจำกัดหรือเจอหัวข้อใหม่",
  },
  "7.0": {
    en: "Long, demanding texts and talks are within reach. You can explain a view with reasons and pick words for effect, not just to be understood. Errors turn up now and then rather than in every paragraph, and seldom change what you mean.",
    th: "บทอ่านและการบรรยายที่ยาวและยากอยู่ในระดับที่รับมือได้ อธิบายความเห็นพร้อมเหตุผลได้ และเลือกคำให้ได้ผลตามต้องการ ไม่ใช่แค่ให้เข้าใจ ข้อผิดพลาดมีเป็นครั้งคราว ไม่ใช่ทุกย่อหน้า และไม่ค่อยเปลี่ยนความหมาย",
  },
  "7.5": {
    en: "Between 7 and 8: control is strong across most tasks. What separates you from 8 is usually consistency, keeping precision and natural word choice all the way through a timed paper.",
    th: "อยู่ระหว่าง 7 กับ 8 ควบคุมภาษาได้ดีในงานเกือบทุกแบบ สิ่งที่ห่างจาก 8 มักเป็นความสม่ำเสมอ คือรักษาความแม่นและการเลือกคำที่เป็นธรรมชาติไว้ได้ตลอดการสอบแบบจับเวลา",
  },
  "8.0": {
    en: "English rarely limits what you can do. You can argue a case in depth, adjust your tone to the audience and recover quickly from the rare slip. Remaining gaps tend to show only on very specialised subjects.",
    th: "ภาษาอังกฤษแทบไม่จำกัดสิ่งที่คุณทำได้ โต้แย้งประเด็นได้ลึก ปรับน้ำเสียงให้เหมาะกับผู้ฟัง และแก้ตัวได้เร็วเมื่อพลาดซึ่งเกิดไม่บ่อย ช่องว่างที่เหลือมักเห็นเฉพาะในเรื่องเฉพาะทางมากๆ",
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
  const level = LEVEL[n] ?? `Between ${LEVEL[Math.floor(n)]} and ${LEVEL[Math.ceil(n)]}`;
  return { band, level, summary: SUMMARY[band], focus: FOCUS[band], stage: STAGE_FOR[band] };
});

/**
 * The overall band from the average of the four skills, as the scoring page explains it: nearest half band,
 * with .25 rounding up to the next half band and .75 up to the next whole band. For explaining the rule only;
 * nothing on this site produces an IELTS band.
 */
export function overallBand(average: number): number {
  // Averages of half bands are multiples of 0.125, so this is exact in floating point.
  return Math.floor(average * 2 + 0.5) / 2;
}

export const ROUNDING_EXAMPLES: { average: number; overall: number }[] = [
  { average: 6.25, overall: 6.5 },
  { average: 6.75, overall: 7.0 },
  { average: 6.125, overall: 6.0 },
];

const examples = ROUNDING_EXAMPLES.map((e) => `${e.average} → ${e.overall.toFixed(1)}`).join(", ");

export const OVERALL_RULE: Bilingual = {
  en: `The overall band is the average of the Listening, Reading, Writing and Speaking bands, rounded to a whole or half band. An average ending in .25 rounds up to the next half band, and one ending in .75 rounds up to the next whole band. Examples: ${examples}.`,
  th: `Band รวมคือค่าเฉลี่ยของ Listening, Reading, Writing และ Speaking แล้วปัดเป็น Band เต็มหรือครึ่ง Band ถ้าค่าเฉลี่ยลงท้าย .25 ปัดขึ้นเป็นครึ่ง Band ถัดไป ถ้าลงท้าย .75 ปัดขึ้นเป็น Band เต็มถัดไป ตัวอย่าง: ${examples}`,
};

/** The move to computer delivery, from the announcement of 5 March 2026. Re-check the source before relying on it. */
export const FORMAT_UPDATE = {
  announced: "5 March 2026",
  announcedTh: "5 มีนาคม 2026",
  checked: "27 October 2026",
  checkedTh: "27 ตุลาคม 2026",
  points: [
    {
      en: "From mid-2026, IELTS is moving from paper to computer delivery. Exact timelines vary by country and test centre.",
      th: "ตั้งแต่กลางปี 2026 IELTS ทยอยเปลี่ยนจากสอบบนกระดาษเป็นสอบบนคอมพิวเตอร์ กำหนดการจริงต่างกันไปตามประเทศและศูนย์สอบ",
    },
    {
      en: "In selected markets only, you may be able to choose Writing on Paper: you handwrite the Writing test while the other parts stay on computer.",
      th: "บางตลาดเท่านั้นที่อาจเลือก Writing on Paper ได้ คือเขียน Writing ด้วยมือบนกระดาษ ส่วนทักษะอื่นยังสอบบนคอมพิวเตอร์",
    },
    {
      en: "Paper-based results you already have are not affected.",
      th: "ผลสอบแบบกระดาษที่มีอยู่แล้วไม่ได้รับผลกระทบ",
    },
  ] satisfies Bilingual[],
  advice: {
    en: "Before you book, check which format your test centre offers on your date.",
    th: "ก่อนสมัคร ตรวจกับศูนย์สอบว่าวันที่คุณเลือกสอบในรูปแบบใด",
  } satisfies Bilingual,
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
      en: `Each skill gets a band from 0 to 9, and half bands such as 6.5 are possible. ${OVERALL_RULE.en} Many institutions ask for an overall band and a minimum in each skill.`,
      th: `แต่ละทักษะได้ Band 0–9 และมีครึ่ง Band เช่น 6.5 ได้ ${OVERALL_RULE.th} หลายสถาบันกำหนดทั้ง Band รวมและคะแนนขั้นต่ำของแต่ละทักษะ`,
    },
  },
  {
    q: "Is IELTS still taken on paper?",
    a: {
      en: `${FORMAT_UPDATE.points[0].en} ${FORMAT_UPDATE.points[1].en} ${FORMAT_UPDATE.advice.en} (Announced ${FORMAT_UPDATE.announced}; checked ${FORMAT_UPDATE.checked}.)`,
      th: `${FORMAT_UPDATE.points[0].th} ${FORMAT_UPDATE.points[1].th} ${FORMAT_UPDATE.advice.th} (ประกาศเมื่อ ${FORMAT_UPDATE.announcedTh} ตรวจข้อมูลล่าสุด ${FORMAT_UPDATE.checkedTh})`,
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
  {
    q: "Is Odyssey an official IELTS website?",
    a: {
      en: `No. ${DISCLAIMER.en} The band summaries here are our own study notes; the official band descriptions and scoring rules are on ielts.org.`,
      th: `ไม่ใช่ ${DISCLAIMER.th} คำอธิบาย Band ในเว็บนี้เป็นบันทึกการเรียนที่เราเขียนเอง คำอธิบายและเกณฑ์คะแนนทางการอยู่ที่ ielts.org`,
    },
  },
];
