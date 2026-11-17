import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { HttpError } from "../lib/http.js";
import { verifyInitData } from "../lib/telegram.js";
import { publicUser, upsertUser } from "../lib/users.js";

const limit = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

export function authRoutes(app: FastifyInstance, { db, config }: Ctx) {
  const issue = (u: ReturnType<typeof upsertUser>) => ({
    token: app.jwt.sign({ sub: u.id }, { expiresIn: "30d" }),
    user: { ...publicUser(u), role: u.role },
  });

  // Telegram Mini App: frontend `window.Telegram.WebApp.initData` ni yuboradi.
  app.post("/api/auth/telegram", limit, async (req) => {
    const { initData } = z.object({ initData: z.string().min(10).max(4096) }).parse(req.body);
    const tg = verifyInitData(initData, config.botToken);
    if (!tg) throw new HttpError(401, "Telegram ma’lumoti yaroqsiz yoki eskirgan");
    return issue(upsertUser(db, tg, config));
  });

  // Faqat lokal ishlab chiqish uchun (DEV_AUTH=true va production emas).
  if (config.devAuth) {
    app.post("/api/auth/dev", limit, async (req) => {
      const b = z
        .object({
          telegramId: z.number().int().positive(),
          firstName: z.string().min(1).max(64),
          lastName: z.string().max(64).optional(),
          username: z.string().max(64).optional(),
        })
        .parse(req.body);
      return issue(upsertUser(db, { id: b.telegramId, first_name: b.firstName, last_name: b.lastName, username: b.username }, config));
    });
  }
}
