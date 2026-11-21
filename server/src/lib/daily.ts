import type { Db } from "../db.js";

/** Kunlik savollar banki. Har kuni 5 tasi tanlanadi (21 ta — 5 ga bo‘linmaydi, shuning uchun to‘plamlar aylanib turadi). */
export const DAILY_QUESTIONS = [
  "Bugun nimani to‘xtatmay o‘ylayapsan?",
  "Oxirgi marta nimadan ilhomlanding?",
  "Qaysi odating seni ushlab turibdi?",
  "Eslab qolishga arziydigan bir lahzani yoz.",
  "Bugun kim bilan haqiqiy suhbat qilding?",
  "Qaysi fikringdan hozir ham qaytmaysan?",
  "Bir yil oldingi o‘zingga nima deb aytar eding?",
  "Seni nima tinchlantiradi?",
  "Hozir nimadan qo‘rqayapsan, lekin buni aytmayapsan?",
  "Qaysi kitob, film yoki qo‘shiq seni o‘zgartirgan?",
  "Bugun nimani yo‘qotding yoki nimadan voz kechding?",
  "Qaysi ishni o‘zing uchun qilding, hech kim uchun emas?",
  "Muvaffaqiyat sen uchun nima degani?",
  "Kimdan nimani o‘rgandingki, u buni bilmaydi?",
  "Nimani endi kechiktirmaslik kerak?",
  "Bugun qaysi odatingni kuzatding?",
  "Kamroq shovqin bo‘lsa, nimani eshitar eding?",
  "Qaysi savolga hali javobing yo‘q?",
  "Odamlar seni nima uchun yaxshi ko‘rishini o‘ylaysanmi?",
  "Bugungi kuningni bitta jumla bilan ayt.",
  "Qaysi qarashing so‘nggi yilda o‘zgardi?",
];

export const LEVELS = [
  { name: "Kuzatuvchi", lo: 0, hi: 100 },
  { name: "Mulohazachi", lo: 100, hi: 300 },
  { name: "Mutafakkir", lo: 300, hi: 600 },
] as const;

/** Sana kaliti Toshkent vaqti (UTC+5) bo‘yicha. */
export const dayKey = (d = new Date()) => new Date(d.getTime() + 5 * 3600_000).toISOString().slice(0, 10);

export function questionsFor(day: string): string[] {
  const n = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
  return Array.from({ length: 5 }, (_, i) => DAILY_QUESTIONS[(n * 5 + i) % DAILY_QUESTIONS.length]!);
}

export function levelOf(points: number) {
  const l = [...LEVELS].reverse().find((x) => points >= x.lo) ?? LEVELS[0];
  return { name: l.name, lo: l.lo, hi: l.hi };
}

const count = (db: Db, sql: string, ...args: unknown[]) => (db.prepare(sql).get(...args) as { n: number }).n;

/** Ball: javob +10, saqlash +3, yoqtirish +1. */
export function pointsOf(db: Db, userId: number) {
  return (
    count(db, "SELECT COUNT(*) AS n FROM daily_answers WHERE user_id = ?", userId) * 10 +
    count(db, "SELECT COUNT(*) AS n FROM saves WHERE user_id = ?", userId) * 3 +
    count(db, "SELECT COUNT(*) AS n FROM likes WHERE user_id = ?", userId)
  );
}

/** Ketma-ket kunlar soni. Bugun hali javob bo‘lmasa, kechagi kundan sanaladi (yumshoq streak). */
export function streakOf(db: Db, userId: number, today: string) {
  const days = new Set(
    (db.prepare("SELECT DISTINCT day FROM daily_answers WHERE user_id = ?").all(userId) as { day: string }[]).map((r) => r.day),
  );
  const shift = (day: string, by: number) => new Date(Date.parse(`${day}T00:00:00Z`) + by * 86_400_000).toISOString().slice(0, 10);
  let cursor = days.has(today) ? today : shift(today, -1);
  let n = 0;
  while (days.has(cursor)) {
    n += 1;
    cursor = shift(cursor, -1);
  }
  return n;
}
