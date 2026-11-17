import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { makeAuth } from "../lib/auth.js";
import { listPosts } from "../lib/posts.js";
import { publicUser, type UserRow } from "../lib/users.js";

const page = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.coerce.number().int().positive().optional(),
});
const settings = z
  .object({
    language: z.enum(["uz", "ru", "en"]),
    theme: z.enum(["system", "light", "dark"]),
    notifications: z.boolean(),
  })
  .partial();

const settingsOf = (u: UserRow) => ({ language: u.language, theme: u.theme, notifications: !!u.notifications });

export function meRoutes(app: FastifyInstance, { db }: Ctx) {
  const { requireAuth } = makeAuth(db);
  const pre = { preHandler: requireAuth };
  const count = (sql: string, ...args: unknown[]) => (db.prepare(sql).get(...args) as { n: number }).n;

  app.get("/api/me", pre, async (req) => ({ ...publicUser(req.me!), role: req.me!.role, settings: settingsOf(req.me!) }));

  app.patch("/api/me", pre, async (req) => {
    const b = settings.parse(req.body);
    const u = req.me!;
    db.prepare("UPDATE users SET language=?, theme=?, notifications=? WHERE id=?").run(
      b.language ?? u.language,
      b.theme ?? u.theme,
      b.notifications === undefined ? u.notifications : b.notifications ? 1 : 0,
      u.id,
    );
    const fresh = db.prepare("SELECT * FROM users WHERE id = ?").get(u.id) as UserRow;
    return { settings: settingsOf(fresh) };
  });

  // Profil sahifasidagi sonlar: Fikrlar / Sevimlilar / Obunachilar / "Bu oyda N maqola".
  app.get("/api/me/stats", pre, async (req) => {
    const id = req.me!.id;
    return {
      posts: count("SELECT COUNT(*) AS n FROM posts WHERE author_id = ?", id),
      liked: count("SELECT COUNT(*) AS n FROM likes WHERE user_id = ?", id),
      saved: count("SELECT COUNT(*) AS n FROM saves WHERE user_id = ?", id),
      followers: count("SELECT COUNT(*) AS n FROM follows WHERE following_id = ?", id),
      following: count("SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?", id),
      readsThisMonth: count("SELECT COUNT(*) AS n FROM reads WHERE user_id = ? AND read_at >= strftime('%Y-%m-01T00:00:00.000Z','now')", id),
    };
  });

  const lists: Array<[string, string]> = [
    ["posts", "p.author_id = @me"],
    ["saved", "EXISTS(SELECT 1 FROM saves s WHERE s.post_id = p.id AND s.user_id = @me)"],
    ["liked", "EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = @me)"],
  ];
  for (const [name, cond] of lists) {
    app.get(`/api/me/${name}`, pre, async (req) => {
      const q = page.parse(req.query);
      return listPosts(db, { viewerId: req.me!.id, where: [cond], limit: q.limit, cursor: q.cursor });
    });
  }

  app.delete("/api/me", pre, async (req, reply) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.me!.id);
    reply.code(204);
  });
}
