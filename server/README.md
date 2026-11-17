# Fikrnoma backend

Node.js 22 + TypeScript + Fastify + SQLite (`better-sqlite3`). Telegram Mini App orqali kirish, JWT sessiya.

## Ishga tushirish
```bash
cd server
cp .env.example .env      # keyin qiymatlarni to'ldiring
npm install
npm run dev               # http://localhost:3000  (SEED=true bo'lsa namunaviy ma'lumotlar bilan)
npm test
```
`npm run dev` va `npm start` `.env` faylini o'zi o'qiydi (bo'lmasa muhit o'zgaruvchilaridan foydalanadi).

Production: `npm run build && NODE_ENV=production npm start` (JWT_SECRET va TELEGRAM_BOT_TOKEN majburiy).
Baza — bitta fayl (`DB_PATH`), uni muntazam zaxiralab turing.

## Kirish (auth)
| Metod | Yo'l | Izoh |
|---|---|---|
| POST | `/api/auth/telegram` | `{ initData }` — `window.Telegram.WebApp.initData`. Javob: `{ token, user }` |
| POST | `/api/auth/dev` | Faqat `DEV_AUTH=true`: `{ telegramId, firstName }` |

Keyingi so'rovlarda: `Authorization: Bearer <token>`.

## Endpointlar
| Metod | Yo'l | Auth | Izoh |
|---|---|---|---|
| GET | `/api/categories` | – | Kategoriyalar (`Barchasi` bilan) |
| GET | `/api/posts` | ixtiyoriy | `?category=&q=&author=&limit=&cursor=` → `{ items, nextCursor }` |
| GET | `/api/posts/featured` | ixtiyoriy | "Bugungi tanlov" |
| GET | `/api/posts/:id` | ixtiyoriy | To'liq matn bilan; kirgan bo'lsa "o'qildi" deb yoziladi |
| POST | `/api/posts` | ha | `{ category, title, content, imageUrl? }` |
| PATCH / DELETE | `/api/posts/:id` | ha | Faqat muallif yoki admin |
| PUT / DELETE | `/api/posts/:id/like` | ha | Yoqtirish |
| PUT / DELETE | `/api/posts/:id/save` | ha | Saqlash |
| GET / POST | `/api/posts/:id/comments` | POST: ha | Izohlar |
| DELETE | `/api/comments/:id` | ha | Faqat muallif yoki admin |
| GET | `/api/shorts` | – | Qisqa fikrlar |
| GET / PATCH / DELETE | `/api/me` | ha | Profil, sozlamalar (`language`, `theme`, `notifications`) |
| GET | `/api/me/stats` | ha | Fikrlar, sevimlilar, obunachilar, bu oyda o'qilgan |
| GET | `/api/me/posts` `/saved` `/liked` | ha | Profil tablari |
| GET | `/api/users/:id` | ixtiyoriy | Ochiq profil |
| PUT / DELETE | `/api/users/:id/follow` | ha | Obuna |

Xatolar: `{ "error": "..." }`, tekshiruv xatosida qo'shimcha `issues`.

## Eslatmalar
- Qidiruv SQLite `LIKE` — o'zbekcha harflarda katta/kichik harf farqiga sezgir bo'lishi mumkin.
- `/api/me/saved` va `/liked` yangi fikrlar birinchi tartibida (saqlangan vaqt bo'yicha emas).
- Rasm yuklash hali yo'q: `imageUrl` faqat `https://` havola.
