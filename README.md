# English Studio

เว็บเรียนภาษาอังกฤษทีละขั้น ตั้งแต่โครงประโยคจนใช้ทำงานได้ มี Grammar A1–A2 จำนวน 20 บท (ทฤษฎี ฝึก ทดสอบ), V1-V2-V3 จำนวน 80 คำ, การ์ดคำศัพท์ที่ทวนตามรอบ (Leitner) และแตะคำในประโยคเพื่อดูความหมาย

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL + Auth + Row Level Security)

## โครงสร้างโปรเจกต์

```
src/
  app/                 หน้าเว็บ (App Router)
    page.tsx           หน้าวันนี้: บทที่เรียนต่อ แผน 60 นาที ความสม่ำเสมอ
    grammar/           รายการบท และหน้าบทเรียน /grammar/[id]
    verbs/             V1-V2-V3 (ฝึกพิมพ์ + ตาราง)
    vocab/             การ์ดคำศัพท์
    login/             เข้าสู่ระบบ / สมัคร
    auth/callback/     รับลิงก์ยืนยันอีเมล
    actions.ts         Server Actions: บันทึกคะแนน ทวนการ์ด เพิ่มคำ
  components/          UI ฝั่ง client (บทเรียน แบบฝึก การ์ด หน้าต่างความหมายคำ)
  content/             เนื้อหาบทเรียน (JSON) และฟังก์ชันค้นคำ
  lib/
    data.ts            อ่านข้อมูลผู้เรียนจาก Supabase (ฝั่ง server)
    queue.ts           เลือกการ์ดที่ถึงรอบทวน
    supabase/          สร้าง Supabase client ฝั่ง server และ proxy
  proxy.ts             ต่ออายุ session ทุก request (Next 16 เปลี่ยนชื่อจาก middleware)
supabase/schema.sql    ตาราง วิว ฟังก์ชัน และ RLS ทั้งหมด
```

เนื้อหาบทเรียนอยู่ใน `src/content/data/*.json` ส่วนฐานข้อมูลเก็บเฉพาะสิ่งที่ผู้เรียนทำ:

| ตาราง | เก็บอะไร |
|---|---|
| `lesson_attempts` | ทุกครั้งที่ทำแบบทดสอบ คะแนน และผ่านหรือไม่ |
| `cards` | การ์ดทวนของแต่ละคน กล่อง Leitner 0–5 และวันที่ต้องทวนครั้งถัดไป |
| `reviews` | ทุกครั้งที่ทวน ตอบถูกไหม ใช้เวลากี่ ms (ใช้เป็น dataset ทำ ML ได้) |
| `mistakes` | คำตอบที่ผิด เพื่อสรุปข้อผิดที่เจอบ่อย |
| `lesson_best` (view) | คะแนนสูงสุดของแต่ละบท |
| `activity_days` (view) | วันที่มีการเรียน ใช้นับวันติดกันและวาดตาราง 6 สัปดาห์ |
| `record_review()` (function) | บันทึกการทวน 1 ครั้งและเลื่อนกล่องการ์ดในคำสั่งเดียว |

## ติดตั้งและรันบนเครื่อง

ต้องมี Node.js 20.9 ขึ้นไป

### 1. สร้างโปรเจกต์ Supabase

1. สมัครที่ https://supabase.com แล้วกด **New project** ตั้งชื่อ `english-studio` เลือก Region ที่ใกล้ที่สุด (เช่น Singapore) และจดรหัสผ่านฐานข้อมูลไว้
2. เมื่อสร้างเสร็จ ไปที่ **SQL Editor** > **New query** เปิดไฟล์ `supabase/schema.sql` คัดลอกทั้งหมดไปวาง แล้วกด **Run** ถ้าขึ้น `Success. No rows returned` ถือว่าใช้ได้
3. ไปที่ **Table Editor** ควรเห็นตาราง `lesson_attempts`, `cards`, `reviews`, `mistakes`
4. (ถ้าใช้คนเดียว) ไปที่ **Authentication** > **Sign In / Providers** > **Email** แล้วปิด **Confirm email** จะสมัครแล้วเข้าได้ทันทีโดยไม่ต้องยืนยันอีเมล

### 2. ใส่ค่าเชื่อมต่อ

```bash
cp .env.example .env.local
```

เปิด `.env.local` แล้วใส่ค่าจาก Supabase > กดปุ่ม **Connect** ด้านบน (หรือ **Project Settings** > **API Keys**):

- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Publishable key (ขึ้นต้นด้วย `sb_publishable_`) ถ้าโปรเจกต์เก่ายังไม่มี ใช้ `anon` key แทนได้

ห้ามใส่ `service_role` / secret key ลงในไฟล์นี้ เพราะตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูกส่งไปที่เบราว์เซอร์ ความปลอดภัยของข้อมูลมาจาก Row Level Security ใน `schema.sql`

### (ไม่บังคับ) เปิดปุ่ม "เข้าใช้งานด้วย Google"

1. ไปที่ https://console.cloud.google.com > สร้างโปรเจกต์ใหม่ > **APIs & Services** > **OAuth consent screen** ตั้งเป็น External ใส่ชื่อแอปและอีเมล
2. **Credentials** > **Create credentials** > **OAuth client ID** > เลือก **Web application**
3. ช่อง **Authorized redirect URIs** ใส่ `https://<project-ref>.supabase.co/auth/v1/callback` (ดูค่าที่ถูกต้องได้ใน Supabase หน้าเปิด Google provider)
4. คัดลอก **Client ID** กับ **Client secret** ไปวางที่ Supabase > **Authentication** > **Sign In / Providers** > **Google** แล้วเปิดใช้งาน
5. ใน `.env.local` ตั้ง `NEXT_PUBLIC_AUTH_GOOGLE=true` แล้วรัน `npm run dev` ใหม่

ถ้าไม่เปิด Google หน้าเข้าใช้งานจะมีแค่อีเมลกับรหัสผ่าน ปุ่มเดียวใช้ได้ทั้งสมัครใหม่และเข้าสู่ระบบ

### 3. รัน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 แล้วไปหน้า **เข้าใช้งาน** ใส่อีเมลและรหัสผ่าน (8 ตัวขึ้นไป) แล้วกด **เข้าใช้งาน** ถ้ายังไม่มีบัญชี ระบบจะสร้างให้อัตโนมัติ

ถ้ายังไม่ได้ใส่ `.env.local` เว็บก็ยังเปิดได้ทุกหน้า แต่จะไม่บันทึกความคืบหน้า

## Deploy ขึ้น Vercel

1. สร้าง repo บน GitHub แล้ว push โค้ดนี้ขึ้นไป
2. ที่ https://vercel.com กด **Add New** > **Project** แล้วเลือก repo นั้น
3. ใน **Environment Variables** ใส่ค่าเดียวกับ `.env.local` แล้วกด **Deploy**
4. นำ URL ที่ได้ (เช่น `https://english-studio.vercel.app`) ไปใส่ที่ Supabase > **Authentication** > **URL Configuration** ทั้งช่อง **Site URL** และ **Redirect URLs** (`https://english-studio.vercel.app/auth/callback`)

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันโหมดพัฒนา แก้โค้ดแล้วหน้าเว็บเปลี่ยนทันที |
| `npm run build` | build แบบ production (ใช้เช็กว่าไม่มี error ก่อน deploy) |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |
| `npx tsc --noEmit` | ตรวจ type ของ TypeScript |

## ดึงข้อมูลไปทำ ML

ข้อมูลการทวนทุกครั้งอยู่ในตาราง `reviews` ส่งออกเป็น CSV ได้จาก Supabase > **Table Editor** > `reviews` > **Export** หรือใช้ SQL:

```sql
select item_id, kind, box_before, correct, ms,
       extract(hour from reviewed_at at time zone 'Asia/Bangkok') as hour,
       reviewed_at
from reviews
order by reviewed_at;
```

`correct` คือ label ว่าจำได้หรือไม่ ใช้ฝึกโมเดล Decision Tree / Random Forest ทำนายว่าการ์ดใบไหนกำลังจะถูกลืม
