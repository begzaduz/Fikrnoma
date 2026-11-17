import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { openDb } from "../src/db.js";
import { seedIfEmpty } from "../src/seed.js";
import { verifyInitData } from "../src/lib/telegram.js";

const BOT = "123456:TEST-TOKEN";
const config = { ...loadConfig({} as NodeJS.ProcessEnv), devAuth: true, botToken: BOT, dbPath: ":memory:" };
const db = openDb(":memory:");
seedIfEmpty(db);
const app = await buildApp({ db, config });

after(() => app.close());

const login = async (telegramId: number, firstName: string) => {
  const r = await app.inject({ method: "POST", url: "/api/auth/dev", payload: { telegramId, firstName } });
  assert.equal(r.statusCode, 200);
  return { Authorization: `Bearer ${r.json().token}` };
};

function signedInitData(user: object, authDate = Math.floor(Date.now() / 1000), token = BOT) {
  const p = new URLSearchParams({ auth_date: String(authDate), query_id: "AAH", user: JSON.stringify(user) });
  const dcs = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  p.set("hash", createHmac("sha256", secret).update(dcs).digest("hex"));
  return p.toString();
}

test("health va seed ma’lumotlari", async () => {
  assert.deepEqual((await app.inject("/api/health")).json(), { ok: true });
  const list = (await app.inject("/api/posts")).json();
  assert.equal(list.items.length, 4);
  assert.equal(list.items[0].content, undefined); // ro‘yxatda to‘liq matn yo‘q
  assert.equal((await app.inject("/api/shorts")).json().items.length, 3);
  assert.ok((await app.inject("/api/categories")).json().items.includes("Barchasi"));
});

test("kategoriya va qidiruv filtri", async () => {
  const byCat = (await app.inject("/api/posts?category=jamiyat")).json();
  assert.equal(byCat.items.length, 1);
  assert.equal(byCat.items[0].category, "JAMIYAT");
  assert.equal((await app.inject("/api/posts?category=Barchasi")).json().items.length, 4);
  assert.equal((await app.inject("/api/posts?q=kamroq")).json().items.length, 1);
  assert.equal((await app.inject("/api/posts?q=100%25")).json().items.length, 0); // LIKE belgilari escape qilinadi
});

test("sahifalash (cursor)", async () => {
  const p1 = (await app.inject("/api/posts?limit=3")).json();
  assert.equal(p1.items.length, 3);
  assert.ok(p1.nextCursor);
  const p2 = (await app.inject(`/api/posts?limit=3&cursor=${p1.nextCursor}`)).json();
  assert.equal(p2.items.length, 1);
  assert.equal(p2.nextCursor, null);
});

test("kirishsiz yozish mumkin emas", async () => {
  assert.equal((await app.inject({ method: "POST", url: "/api/posts", payload: {} })).statusCode, 401);
  assert.equal((await app.inject({ method: "PUT", url: "/api/posts/1/like" })).statusCode, 401);
  assert.equal((await app.inject({ method: "GET", url: "/api/me" })).statusCode, 401);
});

test("fikr yaratish, tahrirlash, o‘chirish va ruxsatlar", async () => {
  const a = await login(1001, "Ali");
  const b = await login(1002, "Vali");

  const bad = await app.inject({ method: "POST", url: "/api/posts", headers: a, payload: { category: "YOQ", title: "x", content: "qisqa" } });
  assert.equal(bad.statusCode, 400);
  assert.ok(bad.json().issues.length >= 2);

  const created = await app.inject({ method: "POST", url: "/api/posts", headers: a, payload: { category: "hayot", title: "Mening fikrim", content: "Bu juda uzun bo‘lmagan, ammo yetarli matn." } });
  assert.equal(created.statusCode, 201);
  const post = created.json();
  assert.equal(post.category, "HAYOT");
  assert.equal(post.author.name, "Ali");

  assert.equal((await app.inject({ method: "PATCH", url: `/api/posts/${post.id}`, headers: b, payload: { title: "Hack" } })).statusCode, 403);
  const edited = await app.inject({ method: "PATCH", url: `/api/posts/${post.id}`, headers: a, payload: { title: "Yangilangan sarlavha" } });
  assert.equal(edited.json().title, "Yangilangan sarlavha");

  assert.equal((await app.inject({ method: "DELETE", url: `/api/posts/${post.id}`, headers: b })).statusCode, 403);
  assert.equal((await app.inject({ method: "DELETE", url: `/api/posts/${post.id}`, headers: a })).statusCode, 204);
  assert.equal((await app.inject(`/api/posts/${post.id}`)).statusCode, 404);
});

test("like, save, izoh va profil statistikasi", async () => {
  const h = await login(2001, "Sardor");
  const like1 = (await app.inject({ method: "PUT", url: "/api/posts/1/like", headers: h })).json();
  const like2 = (await app.inject({ method: "PUT", url: "/api/posts/1/like", headers: h })).json(); // takror — o‘zgarmaydi
  assert.deepEqual(like1, like2);
  assert.equal(like1.likes, 1);
  assert.equal((await app.inject({ method: "PUT", url: "/api/posts/1/save", headers: h })).json().saved, true);

  const detail = (await app.inject({ url: "/api/posts/1", headers: h })).json();
  assert.equal(detail.liked, true);
  assert.equal(detail.saved, true);
  assert.ok(detail.content.length > 50);

  const c = await app.inject({ method: "POST", url: "/api/posts/1/comments", headers: h, payload: { body: "  Juda yaxshi!  " } });
  assert.equal(c.statusCode, 201);
  assert.equal(c.json().body, "Juda yaxshi!");
  assert.equal((await app.inject("/api/posts/1/comments")).json().items.length, 1);
  assert.equal((await app.inject({ url: "/api/posts/1" })).json().comments, 1);
  assert.equal((await app.inject({ method: "POST", url: "/api/posts/1/comments", headers: h, payload: { body: "   " } })).statusCode, 400);

  const stats = (await app.inject({ url: "/api/me/stats", headers: h })).json();
  assert.equal(stats.liked, 1);
  assert.equal(stats.saved, 1);
  assert.equal(stats.readsThisMonth, 1);
  assert.equal((await app.inject({ url: "/api/me/saved", headers: h })).json().items.length, 1);
  assert.equal((await app.inject({ url: "/api/me/liked", headers: h })).json().items.length, 1);

  assert.equal((await app.inject({ method: "DELETE", url: "/api/posts/1/like", headers: h })).json().likes, 0);
  assert.equal((await app.inject({ url: "/api/me/liked", headers: h })).json().items.length, 0);
});

test("sozlamalar va obuna", async () => {
  const a = await login(3001, "Dilnoza");
  const b = await login(3002, "Jasur");
  const meB = (await app.inject({ url: "/api/me", headers: b })).json();

  const s = (await app.inject({ method: "PATCH", url: "/api/me", headers: a, payload: { theme: "dark", notifications: false } })).json();
  assert.deepEqual(s.settings, { language: "uz", theme: "dark", notifications: false });
  assert.equal((await app.inject({ method: "PATCH", url: "/api/me", headers: a, payload: { theme: "pink" } })).statusCode, 400);

  const f = (await app.inject({ method: "PUT", url: `/api/users/${meB.id}/follow`, headers: a })).json();
  assert.deepEqual(f, { following: true, followers: 1 });
  assert.equal((await app.inject({ url: `/api/users/${meB.id}`, headers: a })).json().following, true);
  const meA = (await app.inject({ url: "/api/me", headers: a })).json();
  assert.equal((await app.inject({ method: "PUT", url: `/api/users/${meA.id}/follow`, headers: a })).statusCode, 400);
  assert.equal((await app.inject({ method: "DELETE", url: `/api/users/${meB.id}/follow`, headers: a })).json().followers, 0);
});

test("Telegram initData tekshiruvi", async () => {
  const user = { id: 777, first_name: "Test", username: "tester" };
  assert.equal(verifyInitData(signedInitData(user), BOT)?.id, 777);
  assert.equal(verifyInitData(signedInitData(user, undefined, "boshqa:token"), BOT), null); // noto‘g‘ri imzo
  assert.equal(verifyInitData(signedInitData(user, Math.floor(Date.now() / 1000) - 90000), BOT), null); // eskirgan
  assert.equal(verifyInitData(signedInitData(user).replace("Test", "Hack"), BOT), null); // o‘zgartirilgan

  const ok = await app.inject({ method: "POST", url: "/api/auth/telegram", payload: { initData: signedInitData(user) } });
  assert.equal(ok.statusCode, 200);
  assert.equal(ok.json().user.username, "tester");
  const no = await app.inject({ method: "POST", url: "/api/auth/telegram", payload: { initData: "hash=" + "0".repeat(64) + "&user=x" } });
  assert.equal(no.statusCode, 401);
});

test("config: bo‘sh .env qiymatlari standart qiymatga tushadi", () => {
  const c = loadConfig({ JWT_SECRET: "", PORT: "", CORS_ORIGIN: "", TELEGRAM_BOT_TOKEN: "" } as NodeJS.ProcessEnv);
  assert.equal(c.port, 3000);
  assert.ok(c.jwtSecret.length > 10);
  assert.equal(c.corsOrigin, "*");
  assert.throws(() => loadConfig({ NODE_ENV: "production", JWT_SECRET: "", TELEGRAM_BOT_TOKEN: "x" } as NodeJS.ProcessEnv));
});


test("media upload autentifikatsiya va storage konfiguratsiyasi bilan himoyalangan", async () => {
  const noAuth = await app.inject({
    method: "POST",
    url: "/api/media/upload",
    payload: { fileName: "cover.jpg", mimeType: "image/jpeg", data: "a".repeat(120) },
  });
  assert.equal(noAuth.statusCode, 401);

  const headers = await login(4001, "Media test");
  const noStorage = await app.inject({
    method: "POST",
    url: "/api/media/upload",
    headers,
    payload: { fileName: "cover.jpg", mimeType: "image/jpeg", data: "a".repeat(120) },
  });
  assert.equal(noStorage.statusCode, 503);
  assert.match(noStorage.json().error, /sozlanmagan/);
});
