import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { openDb, type Db } from "./db.js";
import { makeExcerpt, readMinutes } from "./lib/posts.js";

const img = (id: string, w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const users = [
  { tg: -1, first: "Fikrnoma", last: null },
  { tg: -2, first: "Aziza", last: "Rahimova" },
  { tg: -3, first: "Bekzod", last: "M." },
];

const posts = [
  { author: 0, category: "TAFAKKUR", image: img("photo-1519501025264-65ba15a82390", 1200), title: "Ba’zan to‘g‘ri savol — javobdan muhimroq.",
    content: "Biz javoblarni izlashga shoshilamiz. Chunki javob aniq, o‘lchash mumkin va ko‘pincha xotirjamlik beradi. Savol esa aksincha — fikrimizni bezovta qiladi.\n\nLekin rivojlanish ko‘pincha tayyor javobdan emas, to‘g‘ri qo‘yilgan savoldan boshlanadi. Savol biz ko‘rmayotgan jihatni ochadi, odatiy qarashlarimizni qayta ko‘rib chiqishga undaydi.\n\nBalki ba’zan javob topishdan oldin, nimani so‘rayotganimizni aniqlab olishimiz kerakdir." },
  { author: 1, category: "HAYOT", image: img("photo-1500530855697-b586d89ba3ee", 900), title: "Kamroq shovqin — ko‘proq mazmun.",
    content: "Har kuni bizga minglab xabarlar, fikrlar va tasvirlar yetib keladi. Ularning barchasiga munosabat bildirishga urinish esa ichki ovozimizni eshitishni qiyinlashtiradi.\n\nSukut — hech narsa bo‘lmayotgan vaqt emas. U fikrlar joyiga tushadigan, muhim va ikkinchi darajali narsalar ajraladigan makon bo‘lishi mumkin." },
  { author: 0, category: "FALSAFA", image: img("photo-1495474472287-4d71bcdd2085", 1200), title: "Baxt — bu orzu emas, holatdir.",
    content: "Baxt ko‘pincha katta maqsadlar bilan bog‘lanadi. Go‘yoki biror narsaga erishsak, keyin hammasi yaxshi bo‘ladigandek. Ammo hayot faqat marralardan iborat emas.\n\nBaxt ba’zan oddiy lahzada, yaqin inson bilan suhbatda yoki o‘zimizni anglashda namoyon bo‘ladi." },
  { author: 2, category: "JAMIYAT", image: img("photo-1497366754035-f200968a6e72", 900), title: "Kelajak haqida kim o‘ylayapti?",
    content: "Kelajak o‘z-o‘zidan paydo bo‘lmaydi. U bugun qilayotgan tanlovlarimiz, qurayotgan tizimlarimiz va e’tibor berayotgan qadriyatlarimizdan shakllanadi." },
];

const shorts = [
  { category: "TAFAKKUR", tone: "sand", quote: "Ko‘p narsani bilish — dono bo‘lish degani emas. Muhimi, bilganing haqida qanday fikrlashing." },
  { category: "JAMIYAT", tone: "olive", quote: "Shahar — xaritadagi ko‘chalar emas. U odamlar bir-biriga qanchalik yaqin yashashidir." },
  { category: "HAYOT", tone: "ink", quote: "Ba’zan oldinga yurish uchun tezlashish emas, nimaga shoshilayotganingni anglash kerak." },
];

/** Baza bo‘sh bo‘lsa, frontenddagi namunaviy ma’lumotlar bilan to‘ldiradi. */
export function seedIfEmpty(db: Db) {
  const has = (db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number }).n;
  if (has > 0) return false;
  db.transaction(() => {
    const ids = users.map((u) =>
      Number(db.prepare("INSERT INTO users (telegram_id, first_name, last_name) VALUES (?,?,?)").run(u.tg, u.first, u.last).lastInsertRowid),
    );
    [...posts].reverse().forEach((p) => {
      db.prepare("INSERT INTO posts (author_id, category, title, excerpt, content, image_url, read_minutes) VALUES (?,?,?,?,?,?,?)").run(
        ids[p.author], p.category, p.title, makeExcerpt(p.content), p.content, p.image, readMinutes(p.content),
      );
    });
    shorts.forEach((s, i) => db.prepare("INSERT INTO shorts (category, quote, tone, position) VALUES (?,?,?,?)").run(s.category, s.quote, s.tone, i));
  })();
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDb(loadConfig().dbPath);
  console.log(seedIfEmpty(db) ? "Namunaviy ma’lumotlar qo‘shildi" : "Baza bo‘sh emas, o‘tkazib yuborildi");
}
