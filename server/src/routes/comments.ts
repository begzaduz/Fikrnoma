import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { forbidden, notFound } from "../lib/http.js";
import { makeAuth } from "../lib/auth.js";
import { publicUser } from "../lib/users.js";

const idParam = z.object({ id: z.coerce.number().int().positive() });

type CommentRow = { id: number; body: string; created_at: string; user_id: number; first_name: string; last_name: string | null; username: string | null; avatar_url: string | null };
const SELECT = `SELECT c.id, c.body, c.created_at, c.user_id, u.first_name, u.last_name, u.username, u.avatar_url
                FROM comments c JOIN users u ON u.id = c.user_id`;
const serialize = (r: CommentRow) => ({
  id: r.id,
  body: r.body,
  createdAt: r.created_at,
  author: publicUser({ id: r.user_id, first_name: r.first_name, last_name: r.last_name, username: r.username, avatar_url: r.avatar_url }),
});

export function commentRoutes(app: FastifyInstance, { db }: Ctx) {
  const { requireAuth } = makeAuth(db);

  app.get("/api/posts/:id/comments", async (req) => {
    const { id } = idParam.parse(req.params);
    const q = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50), cursor: z.coerce.number().int().min(0).default(0) }).parse(req.query);
    if (!db.prepare("SELECT 1 FROM posts WHERE id = ?").get(id)) throw notFound("Fikr topilmadi");
    const rows = db.prepare(`${SELECT} WHERE c.post_id = ? AND c.id > ? ORDER BY c.id ASC LIMIT ?`).all(id, q.cursor, q.limit + 1) as CommentRow[];
    const more = rows.length > q.limit;
    const page = more ? rows.slice(0, q.limit) : rows;
    return { items: page.map(serialize), nextCursor: more ? page[page.length - 1]!.id : null };
  });

  app.post("/api/posts/:id/comments", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = idParam.parse(req.params);
    const { body } = z.object({ body: z.string().trim().min(1).max(1000) }).parse(req.body);
    if (!db.prepare("SELECT 1 FROM posts WHERE id = ?").get(id)) throw notFound("Fikr topilmadi");
    const info = db.prepare("INSERT INTO comments (post_id, user_id, body) VALUES (?,?,?)").run(id, req.me!.id, body);
    reply.code(201);
    return serialize(db.prepare(`${SELECT} WHERE c.id = ?`).get(Number(info.lastInsertRowid)) as CommentRow);
  });

  app.delete("/api/comments/:id", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = idParam.parse(req.params);
    const c = db.prepare("SELECT user_id FROM comments WHERE id = ?").get(id) as { user_id: number } | undefined;
    if (!c) throw notFound("Izoh topilmadi");
    if (c.user_id !== req.me!.id && req.me!.role !== "admin") throw forbidden();
    db.prepare("DELETE FROM comments WHERE id = ?").run(id);
    reply.code(204);
  });
}
