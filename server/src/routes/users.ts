import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { badRequest, notFound } from "../lib/http.js";
import { makeAuth } from "../lib/auth.js";
import { publicUser, type UserRow } from "../lib/users.js";

const idParam = z.object({ id: z.coerce.number().int().positive() });

export function userRoutes(app: FastifyInstance, { db }: Ctx) {
  const { requireAuth, optionalAuth } = makeAuth(db);
  const count = (sql: string, ...args: unknown[]) => (db.prepare(sql).get(...args) as { n: number }).n;
  const followers = (id: number) => count("SELECT COUNT(*) AS n FROM follows WHERE following_id = ?", id);

  app.get("/api/users/:id", { preHandler: optionalAuth }, async (req) => {
    const { id } = idParam.parse(req.params);
    const u = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
    if (!u) throw notFound("Foydalanuvchi topilmadi");
    return {
      ...publicUser(u),
      posts: count("SELECT COUNT(*) AS n FROM posts WHERE author_id = ?", id),
      followers: followers(id),
      following: req.me ? !!db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?").get(req.me.id, id) : false,
    };
  });

  app.put("/api/users/:id/follow", { preHandler: requireAuth }, async (req) => {
    const { id } = idParam.parse(req.params);
    if (id === req.me!.id) throw badRequest("O‘zingizga obuna bo‘la olmaysiz");
    if (!db.prepare("SELECT 1 FROM users WHERE id = ?").get(id)) throw notFound("Foydalanuvchi topilmadi");
    db.prepare("INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)").run(req.me!.id, id);
    return { following: true, followers: followers(id) };
  });

  app.delete("/api/users/:id/follow", { preHandler: requireAuth }, async (req) => {
    const { id } = idParam.parse(req.params);
    db.prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?").run(req.me!.id, id);
    return { following: false, followers: followers(id) };
  });
}
