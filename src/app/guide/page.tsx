import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "คู่มือ" };

const SECTIONS = [
  { id: "pos", title: "ชนิดของคำ (n. v. adj. ...)" },
  { id: "sentence", title: "ส่วนของประโยค" },
  { id: "count", title: "นับได้ นับไม่ได้ และพหูพจน์" },
  { id: "verbs", title: "รูปของกริยา V1 V2 V3" },
  { id: "aux", title: "กริยาช่วย" },
  { id: "tenses", title: "ชื่อ tense ที่เจอในบทเรียน" },
  { id: "symbols", title: "สัญลักษณ์ที่ใช้ในเว็บนี้" },
  { id: "review", title: "การ์ดทวนทำงานอย่างไร" },
  { id: "levels", title: "ระดับ A1 ถึง B2" },
  { id: "tips", title: "เกร็ดเล็ก ๆ ที่มักมองข้าม" },
];

function Section({ id, children }: { id: string; children: ReactNode }) {
  const title = SECTIONS.find((s) => s.id === id)?.title;
  return (
    <section id={id} className="card scroll-mt-20 p-5 sm:p-6">
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      <div className="prose-lesson">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Ex({ en, th }: { en: ReactNode; th: ReactNode }) {
  return (
    <div className="ex">
      {en}
      <div className="th">{th}</div>
    </div>
  );
}

const lesson = (id: string, label: string) => <Link href={`/grammar/${id}`} className="text-brand underline underline-offset-2">{label}</Link>;

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">คู่มือ</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">คำศัพท์ไวยากรณ์และสัญลักษณ์ที่ใช้ในเว็บ</h1>
        <p className="mt-2 max-w-[62ch] text-muted">
          เจอคำอย่าง “กริยาช่วย” “นับไม่ได้” “V3” ในบทเรียนแล้วไม่แน่ใจ กลับมาเปิดหน้านี้ได้ตลอด
        </p>
      </header>

      <nav aria-label="สารบัญ" className="card p-5">
        <p className="eyebrow mb-2">สารบัญ</p>
        <ol className="grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="hover:text-brand"><span className="mr-2 font-mono text-xs text-muted">{i + 1}</span>{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="pos">
        <p>คำแต่ละคำมี <b>หน้าที่</b> ในประโยค พจนานุกรมจะบอกด้วยตัวย่อหลังคำ เช่น <b>deliver (v.)</b> รู้ชนิดของคำแล้วจะรู้ว่าวางตรงไหน และเปลี่ยนรูปอย่างไร</p>
        <Table
          head={["ตัวย่อ", "ชื่อไทย", "หน้าที่", "ตัวอย่าง"]}
          rows={[
            ["n.", "คำนาม (noun)", "ชื่อของคน สิ่งของ สถานที่ ความคิด", "truck, customer, information"],
            ["v.", "กริยา (verb)", "การกระทำ หรือสภาพ", "send, check, know"],
            ["adj.", "คำคุณศัพท์ (adjective)", "ขยายคำนาม บอกว่าเป็นแบบไหน", "fast, urgent, new"],
            ["adv.", "คำวิเศษณ์ (adverb)", "ขยายกริยาหรือคุณศัพท์ บอกว่าอย่างไร บ่อยแค่ไหน", "quickly, always, very"],
            ["pron.", "คำสรรพนาม (pronoun)", "ใช้แทนคำนาม", "I, she, it, them"],
            ["prep.", "คำบุพบท (preposition)", "บอกตำแหน่ง เวลา ความสัมพันธ์ วางหน้าคำนาม", "in, on, at, to, for"],
            ["conj.", "คำสันธาน (conjunction)", "เชื่อมคำหรือประโยค", "and, but, because, although"],
            ["det.", "คำนำหน้านาม (determiner)", "วางหน้าคำนามเพื่อบอกว่าอันไหน เท่าไร", "a, an, the, this, my, some"],
            ["phr.", "วลี (phrase)", "กลุ่มคำที่ใช้ด้วยกันเป็นก้อน", "as soon as possible, in charge of"],
          ]}
        />
        <p><b>คำเดียวเป็นได้หลายชนิด</b> ดูจากตำแหน่งในประโยค:</p>
        <Ex en={<>The <b>order</b> is ready. · Please <b>order</b> more boxes.</>} th="ตัวแรกเป็นคำนาม (คำสั่งซื้อ) เพราะมี The นำหน้า · ตัวที่สองเป็นกริยา (สั่ง) เพราะตามหลัง Please" />
        <p><b>คำลงท้ายช่วยเดาชนิดได้:</b> -tion, -ment, -ness, -er (คนทำ) มักเป็นคำนาม · -ful, -ous, -ive, -able มักเป็นคุณศัพท์ · -ly มักเป็นคำวิเศษณ์ · -ize, -ate มักเป็นกริยา</p>
        <Table
          head={["กริยา", "คำนาม", "คุณศัพท์"]}
          rows={[
            ["deliver (ส่ง)", "delivery (การส่ง)", "-"],
            ["decide (ตัดสินใจ)", "decision (การตัดสินใจ)", "decisive (เด็ดขาด)"],
            ["succeed (สำเร็จ)", "success (ความสำเร็จ)", "successful (ประสบความสำเร็จ)"],
            ["rely (พึ่งพา)", "reliability (ความน่าเชื่อถือ)", "reliable (เชื่อถือได้)"],
          ]}
        />
      </Section>

      <Section id="sentence">
        <Table
          head={["ส่วน", "คือ", "ตัวอย่าง (ส่วนที่ตัวหนา)"]}
          rows={[
            ["ประธาน (subject)", "คนหรือสิ่งที่ทำ อยู่หน้ากริยา", <><b>The driver</b> delivered the goods.</>],
            ["กริยา (verb)", "การกระทำหรือสภาพ ทุกประโยคต้องมี", <>The driver <b>delivered</b> the goods.</>],
            ["กรรม (object)", "สิ่งที่ถูกกระทำ อยู่หลังกริยา", <>The driver delivered <b>the goods</b>.</>],
            ["ส่วนเติมเต็ม (complement)", "สิ่งที่ตามหลัง be เพื่อบอกว่าประธานเป็นอย่างไร", <>The goods are <b>ready</b>.</>],
            ["ส่วนขยาย (modifier)", "บอกที่ไหน เมื่อไร อย่างไร", <>He works <b>at the port every Monday</b>.</>],
          ]}
        />
        <p><b>ประโยคย่อย (clause)</b> คือกลุ่มคำที่มีประธานและกริยาของตัวเอง เช่น <b>although the ship was late</b> หรือ <b>who called this morning</b> บางคำเชื่อมต้องตามด้วยประโยคย่อย บางคำตามด้วยคำนาม ดูบท {lesson("b2-4", "although / however")}</p>
        <p>ภาพรวมการเรียงประโยค ดูบท {lesson("1-1", "โครงประโยค")}</p>
      </Section>

      <Section id="count">
        <p><b>เอกพจน์</b> = หนึ่งสิ่ง (a box) · <b>พหูพจน์</b> = มากกว่าหนึ่ง (two boxes) ภาษาไทยไม่เปลี่ยนรูปคำ แต่ภาษาอังกฤษเปลี่ยน</p>
        <Table
          head={["", "นับได้ (countable)", "นับไม่ได้ (uncountable)"]}
          rows={[
            ["ตัวอย่าง", "box, truck, file, problem", "information, money, feedback, equipment"],
            ["a / an", "a box", "ใช้ไม่ได้"],
            ["พหูพจน์", "two boxes", "ไม่เติม s"],
            ["ถามจำนวน", "How many?", "How much?"],
            ["อยากนับ", "-", "a piece of information · a bottle of water"],
          ]}
        />
        <Table
          head={["วิธีทำพหูพจน์", "ตัวอย่าง"]}
          rows={[
            ["ทั่วไป +s", "truck → trucks"],
            ["ลงท้าย s, x, ch, sh +es", "box → boxes, address → addresses"],
            ["พยัญชนะ + y → ies", "company → companies"],
            ["คำประสม เติมที่คำหลัก", "bill of lading → bills of lading"],
            ["ไม่ปกติ ต้องจำ", "person → people, child → children, man → men"],
          ]}
        />
        <p>ในตารางคำศัพท์ คำนามทุกคำบอกไว้ว่านับได้หรือไม่ และพหูพจน์สะกดอย่างไร · บทเรียน: {lesson("1-2", "ตัว s ท้ายคำ")} · {lesson("a2-5", "นับได้ / นับไม่ได้")}</p>
      </Section>

      <Section id="verbs">
        <Table
          head={["รูป", "ชื่อเรียก", "ใช้ใน", "ตัวอย่าง"]}
          rows={[
            ["V1", "รูปปกติ", "ปัจจุบัน หลัง do / can / will / to", "send"],
            ["V1 + s", "-", "ปัจจุบัน ประธานเอกพจน์ (he, she, it)", "sends"],
            ["V2", "อดีต (past)", "past simple", "sent"],
            ["V3", "past participle", "have + V3, passive (be + V3)", "sent"],
            ["V-ing", "present participle", "กำลังทำ (be + V-ing), หลังบุพบท", "sending"],
            ["to + V1", "infinitive", "หลัง want, need, plan", "to send"],
          ]}
        />
        <p><b>กริยาปกติ (regular)</b> V2 และ V3 เติม -ed เหมือนกัน (work → worked → worked) · <b>กริยาไม่ปกติ (irregular)</b> ต้องจำ (go → went → gone) ฝึกได้ที่หน้า <Link href="/verbs" className="text-brand underline underline-offset-2">V1-V2-V3</Link></p>
        <p>ในตารางคำศัพท์ กริยาทุกคำบอก V2 / V3 ไว้ และติดป้าย “ไม่ปกติ” ถ้าต้องจำ</p>
      </Section>

      <Section id="aux">
        <p><b>กริยาช่วย</b> วางหน้ากริยาหลักเพื่อเติมความหมาย หรือใช้ทำประโยคปฏิเสธและคำถาม (not ต้องเกาะกริยาช่วย และคำถามต้องย้ายกริยาช่วยไปหน้าประธาน)</p>
        <Table
          head={["กลุ่ม", "คำ", "หน้าที่"]}
          rows={[
            ["be", "am, is, are, was, were", "กำลังทำ (be + V-ing) และ passive (be + V3)"],
            ["do", "do, does, did", "ทำปฏิเสธและคำถามของกริยาทั่วไป"],
            ["have", "have, has, had", "present perfect และ past perfect (have + V3)"],
            ["modal", "can, could, will, would, should, must, might, may", "เติมความหมาย ได้ / จะ / ควร / ต้อง / อาจ"],
          ]}
        />
        <p><b>กฎของ modal:</b> ไม่เปลี่ยนรูปตามประธาน (ไม่มี cans) และตามด้วย V1 ไม่มี to · บทเรียน: {lesson("1-4", "do / does")} · {lesson("a1-8", "can")} · {lesson("a2-7", "must / should")}</p>
      </Section>

      <Section id="tenses">
        <p><b>tense</b> คือรูปกริยาที่บอกเวลาและมุมมองของเหตุการณ์ ภาษาไทยใช้คำบอกเวลาช่วย (เมื่อวาน กำลัง แล้ว) แต่ภาษาอังกฤษเปลี่ยนรูปกริยา</p>
        <Table
          head={["ชื่อ", "รูป", "ใช้เมื่อ", "บทเรียน"]}
          rows={[
            ["Present simple", "V1 / V1+s", "ทำประจำ ความจริง", lesson("1-6", "เปิด")],
            ["Present continuous", "am/is/are + V-ing", "กำลังทำตอนนี้", lesson("1-6", "เปิด")],
            ["Past simple", "V2", "จบแล้วในอดีต", lesson("1-7", "เปิด")],
            ["Past continuous", "was/were + V-ing", "กำลังทำในอดีต", lesson("a2-2", "เปิด")],
            ["Present perfect", "have/has + V3", "เกิดแล้ว ผลถึงตอนนี้", lesson("a2-8", "เปิด")],
            ["Present perfect continuous", "have/has been + V-ing", "ทำมาตลอดถึงตอนนี้", lesson("b1-2", "เปิด")],
            ["Past perfect", "had + V3", "เกิดก่อนอีกเรื่องในอดีต", lesson("b2-1", "เปิด")],
            ["Future", "will + V1 / be going to + V1", "อนาคต", lesson("1-8", "เปิด")],
          ]}
        />
      </Section>

      <Section id="symbols">
        <Table
          head={["เห็นแบบนี้", "หมายถึง"]}
          rows={[
            [<s key="s">I am work.</s>, "ขีดฆ่าสีแดง = ประโยคหรือคำที่ผิด"],
            ["A / B", "ใช้ A หรือ B ก็ได้"],
            ["(that)", "ในวงเล็บ = ใส่หรือไม่ใส่ก็ได้"],
            ["___", "ช่องให้เติมคำ"],
            ["+", "ต่อกันตามลำดับ เช่น have + V3"],
            ["/s/ /ɪz/ /θ/", "เครื่องหมายเสียงอ่าน (ดูหน้า ออกเสียง)"],
            ["com-PU-ter หรือ ˈ", "พยางค์ที่เน้นเสียง"],
            ["คำที่มีเส้นประใต้", "แตะเพื่อดูความหมาย และเพิ่มลงการ์ดทวนได้"],
          ]}
        />
      </Section>

      <Section id="review">
        <p>การ์ดคำศัพท์และ V1-V2-V3 ใช้ระบบ <b>กล่อง (Leitner)</b> คำที่จำได้จะกลับมาให้ทวนห่างขึ้นเรื่อย ๆ คำที่ลืมจะกลับมาเร็ว เพราะสมองจำได้นานขึ้นเมื่อทวนตอนที่ใกล้จะลืม</p>
        <Table
          head={["กล่อง", "กลับมาทวนอีกใน"]}
          rows={[["0", "วันนี้"], ["1", "1 วัน"], ["2", "3 วัน"], ["3", "7 วัน (นับว่าจำได้แล้ว)"], ["4", "14 วัน"], ["5", "30 วัน"]]}
        />
        <p>กด <b>จำได้</b> การ์ดเลื่อนขึ้นหนึ่งกล่อง · กด <b>ยังจำไม่ได้</b> การ์ดกลับไปกล่อง 0 ต้อง login ระบบถึงจะจำผลได้</p>
      </Section>

      <Section id="levels">
        <p>A1 ถึง B2 คือระดับภาษาตามมาตรฐานยุโรป (CEFR) ที่บริษัทและการสอบทั่วโลกใช้ เช่นในประกาศรับสมัครงานที่เขียนว่า “English B1 or above”</p>
        <Table
          head={["ระดับ", "ทำอะไรได้"]}
          rows={[
            ["A1", "แนะนำตัว ถามตอบเรื่องง่าย ๆ"],
            ["A2", "เล่าเรื่องที่ผ่านมา บอกแผน เขียนข้อความสั้น"],
            ["B1", "เขียนอีเมลงาน ประชุมเรื่องที่คุ้นเคย"],
            ["B2", "แสดงความเห็นอย่างมีเหตุผล อ่านเอกสารเทคนิค"],
          ]}
        />
      </Section>

      <Section id="tips">
        <h4>คำทับศัพท์ที่ความหมายไม่ตรงกับภาษาอังกฤษ</h4>
        <Table
          head={["คนไทยพูด", "ภาษาอังกฤษใช้", "ระวัง"]}
          rows={[
            ["แอร์", "air conditioner / AC", "air = อากาศ"],
            ["ลายเซ็น", "signature", "sign = เซ็น (กริยา) หรือป้าย"],
            ["โปรโมชั่น", "special offer / deal", "promotion ในที่ทำงาน = การเลื่อนตำแหน่ง"],
            ["แฟน", "boyfriend / girlfriend / partner", "fan = แฟนคลับ หรือพัดลม"],
            ["ปั๊มน้ำมัน", "gas station / petrol station", "pump = เครื่องสูบ"],
            ["มอไซค์", "motorbike / motorcycle", "-"],
          ]}
        />
        <h4>ตัวพิมพ์ใหญ่</h4>
        <p>ขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอ: <b>I</b> (ฉัน) · วันและเดือน (<b>M</b>onday, <b>O</b>ctober) · ภาษาและสัญชาติ (<b>E</b>nglish, <b>T</b>hai) · ชื่อคน บริษัท เมือง · คำแรกของประโยค</p>
        <h4>วันที่และเวลา</h4>
        <ul>
          <li>เขียนวันที่ได้ 2 แบบ: <b>9 October 2026</b> (แบบอังกฤษ) หรือ <b>October 9, 2026</b> (แบบอเมริกัน) อ่านว่า the ninth of October</li>
          <li>ระวัง 09/10 คนอังกฤษอ่านว่า 9 ตุลาคม แต่คนอเมริกันอ่านว่า 10 กันยายน ในอีเมลงานจึงควรเขียนชื่อเดือนเป็นตัวอักษร</li>
          <li>ลำดับที่: 1st, 2nd, 3rd, 4th ... 21st, 22nd</li>
          <li><b>12 pm</b> = เที่ยงวัน · <b>12 am</b> = เที่ยงคืน สับสนบ่อย เขียน <b>noon</b> หรือ <b>midnight</b> จะชัดกว่า</li>
          <li>ตัวเลข: ใช้ comma คั่นหลักพัน (1,500) และจุดเป็นทศนิยม (2.5)</li>
        </ul>
        <h4>สะกดแบบอังกฤษ กับ แบบอเมริกัน</h4>
        <Table
          head={["อังกฤษ", "อเมริกัน"]}
          rows={[["organise", "organize"], ["colour", "color"], ["cancelled", "canceled"], ["centre", "center"], ["lorry", "truck"]]}
        />
        <p>ใช้แบบไหนก็ได้ แต่ให้เหมือนกันทั้งเอกสาร</p>
        <h4>ตัวอักษรที่ไม่ออกเสียง</h4>
        <p>hour (อาว-เออร์), receipt (รี-ซีท), Wednesday (เวนส์-เดย์), listen (ลิส-เซิน), know (โน)</p>
      </Section>
    </div>
  );
}
