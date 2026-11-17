import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { HttpError } from "./lib/http.js";
import type { Config } from "./config.js";
import type { Db } from "./db.js";
import { authRoutes } from "./routes/auth.js";
import { postRoutes } from "./routes/posts.js";
import { commentRoutes } from "./routes/comments.js";
import { meRoutes } from "./routes/me.js";
import { userRoutes } from "./routes/users.js";
import { shortsRoutes } from "./routes/shorts.js";
import { mediaRoutes } from "./routes/media.js";

export type Ctx = { db: Db; config: Config };

export async function buildApp(ctx: Ctx, opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? false, trustProxy: true, bodyLimit: 8 * 1024 * 1024 });

  await app.register(cors, {
    origin: ctx.config.corsOrigin === "*" ? true : ctx.config.corsOrigin.split(",").map((s) => s.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  await app.register(jwt, { secret: ctx.config.jwtSecret });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: "Ma’lumot noto‘g‘ri", issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
    }
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    reply.code(status).send({ error: status >= 500 && !(err instanceof HttpError) ? "Server xatosi" : (err as Error).message });
  });
  app.setNotFoundHandler((_req, reply) => reply.code(404).send({ error: "Topilmadi" }));

  app.get("/api/health", async () => ({ ok: true }));
  authRoutes(app, ctx);
  postRoutes(app, ctx);
  commentRoutes(app, ctx);
  meRoutes(app, ctx);
  userRoutes(app, ctx);
  shortsRoutes(app, ctx);
  mediaRoutes(app, ctx);

  return app;
}
