import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { makeAuth } from "../lib/auth.js";
import { dayKey, levelOf, pointsOf, questionsFor, streakOf } from "../lib/daily.js";

const answerInput = z.object({
  index: z.number().int().min(0).max(4),
  body: z.string().trim().min(1).max(1000),
});
const history = z.object({ limit: z.coerce.number().int().min(1).max(100).default(30) });

export function dailyRoutes(app: FastifyInstance, { db }: Ctx) {
  const { requireAuth } = makeAuth(db);

  /** Bugungi 5 savol + foydalanuvchining (faqat o‘ziga ko‘rinadigan) javoblari, streak va daraja. */
  const state = (userId: number) => {
    const day = dayKey();
    const rows = db.prepare("SELECT idx, body FROM daily_answers WHERE user_id = ? AND day = ?").all(userId, day) as { idx: number; body: string }[];
    const byIdx = new Map(rows.map((r) => [r.idx, r.body]));
    const points = pointsOf(db, userId);
    return {
      day,
      questions: questionsFor(day).map((text, index) => ({ index, text, answer: byIdx.get(index) ?? null })),
      done: rows.length,
      streak: streakOf(db, userId, day),
      points,
      level: levelOf(points),
    };
  };

  app.get("/api/daily", { preHandler: requireAuth }, async (req) => state(req.me!.id));

  app.post("/api/daily/answer", { preHandler: requireAuth }, async (req) => {
    const b = answerInput.parse(req.body);
    const day = dayKey();
    db.prepare(
      `INSERT INTO daily_answers (user_id, day, idx, question, body) VALUES (?,?,?,?,?)
       ON CONFLICT(user_id, day, idx) DO UPDATE SET body = excluded.body`,
    ).run(req.me!.id, day, b.index, questionsFor(day)[b.index]!, b.body);
    return state(req.me!.id);
  });

  // "Mening fikrlarim": o‘z javoblari tarixi (boshqalarga ko‘rinmaydi).
  app.get("/api/me/answers", { preHandler: requireAuth }, async (req) => {
    const q = history.parse(req.query);
    const items = db
      .prepare("SELECT day, idx, question, body FROM daily_answers WHERE user_id = ? ORDER BY day DESC, idx DESC LIMIT ?")
      .all(req.me!.id, q.limit);
    return { items };
  });
}
