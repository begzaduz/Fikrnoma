# Fikrnoma

Fikrnoma — fikrlar, tafakkur va mazmunli qarashlar uchun raqamli makon.

## Stack
- React + TypeScript
- Vite
- Lucide icons
- CSS design system

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Product structure
- **Bosh sahifa** — saralangan fikrlar va maqolalar
- **Shorts** — keyingi bosqichdagi qisqa video format
- **Profil** — foydalanuvchi sahifasi va saqlangan materiallar

## Backend
`server/` papkasida Node.js + Fastify + SQLite API bor (kirish Telegram orqali, JWT). Batafsil: [`server/README.md`](server/README.md).

### Lokal ishga tushirish (ikkita terminal)
```bash
# 1-terminal: backend  (http://localhost:3000)
cd server && cp .env.example .env && npm install && npm run dev

# 2-terminal: frontend (http://localhost:5173, /api so'rovlari backendga yo'naltiriladi)
npm install && npm run dev
```
Oddiy brauzerda lokal ishlaganda `DEV_AUTH=true` bo'lsa, ilova avtomatik test foydalanuvchi bilan kiradi. Telegram Mini App ichida `initData` bilan kiradi. Production'da frontend `VITE_API_URL` orqali backend manziliga ulanadi.

### Konsepsiya (konsepsiya branchi)
- **Dizayn**: brendbook ranglari (qog‘oz, siyoh, loy, moxor) va Playfair Display + Inter shriftlari.
- **Kunlik 5 savol**: javoblar faqat foydalanuvchining o‘ziga ko‘rinadi (`/api/daily`, `/api/me/answers`).
- **Streak va fikr darajasi**: Kuzatuvchi → Mulohazachi → Mutafakkir. Ball: javob +10, saqlash +3, yoqtirish +1.
- **Yozish**: dastlab faqat Fikrnoma (admin) yozadi. Hamma uchun ochish: `OPEN_WRITING=true`.

### Hozircha ulangan
Fikrlar ro'yxati, "Bugungi tanlov", to'liq maqola, like, saqlash, yangi fikr yozish, Kashf etish, qisqa fikrlar (Shorts), profil va statistika.
Ulanmagan: izohlar interfeysi, sozlamalarni saqlash, obuna tugmasi.
