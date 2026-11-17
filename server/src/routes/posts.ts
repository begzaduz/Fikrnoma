import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { forbidden, notFound } from "../lib/http.js";
import { CATEGORIES, escapeLike, getPostRow, listPosts, makeExcerpt, readMinutes, serializePost } from "../lib/posts.js";
import { makeAuth } from "../lib/auth.js";

const idParam = z.object({ id: z.coerce.number().int().positive() });
const category = z.preprocess((v) => (typeof v === "string" ? v.toUpperCase() : v), z.enum(CATEGORIES));
const postInput = z.object({
  category,
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(10).max(20000),
  imageUrl: z.string().url().startsWith("https://").max(500).nullish(),
});
const listQuery = z.object({
  category: z.string().max(30).optional(),
  q: z.string().trim().max(100).optional(),
  author: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.coerce.number().int().positive().optional(),
});

export function postRoutes(app: FastifyInstance, { db }: Ctx) {
  const { requireAuth, optionalAuth } = makeAuth(db);
  const viewer = (req: { me?: { id: number } }) => req.me?.id ?? 0;

  app.get("/api/categories", async () => ({ items: ["Barchasi", ...CATEGORIES] }));

  app.get("/api/posts", { preHandler: optionalAuth }, async (req) => {
    const q = listQuery.parse(req.query);
    const where: string[] = [];
    const params: Record<string, unknown> = {};
    if (q.category && q.category.toLowerCase() !== "barchasi") {
      where.push("p.category = @category");
      params.category = q.category.toUpperCase();
    }
    if (q.q) {
      where.push("(p.title LIKE @q ESCAPE '\\' OR p.excerpt LIKE @q ESCAPE '\\' OR u.first_name LIKE @q ESCAPE '\\')");
      params.q = `%${escapeLike(q.q)}%`;
    }
    if (q.author) {
      where.push("p.author_id = @author");
      params.author = q.author;
    }
    return listPosts(db, { viewerId: viewer(req), where, params, limit: q.limit, cursor: q.cursor });
  });

  // "Bugungi tanlov": so‘nggi 7 kundagi eng ko‘p yoqtirilgan, bo‘lmasa eng yangisi.
  app.get("/api/posts/featured", { preHandler: optionalAuth }, async (req) => {
    const me = viewer(req);
    const top = db
      .prepare(
        `SELECT p.id FROM posts p WHERE p.created_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-7 days')
         ORDER BY (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) DESC, p.id DESC LIMIT 1`,
      )
      .get() as { id: number } | undefined;
    const id = top?.id ?? (db.prepare("SELECT MAX(id) AS id FROM posts").get() as { id: number | null }).id;
    const row = id ? getPostRow(db, id, me) : undefined;
    if (!row) throw notFound("Hozircha fikrlar yo‘q");
    return serializePost(row, true);
  });

  app.get("/api/posts/:id", { preHandler: optionalAuth }, async (req) => {
    const { id } = idParam.parse(req.params);
    const row = getPostRow(db, id, viewer(req));
    if (!row) throw notFound("Fikr topilmadi");
    if (req.me) db.prepare("INSERT OR IGNORE INTO reads (user_id, post_id) VALUES (?, ?)").run(req.me.id, id);
    return serializePost(row, true);
  });

  app.post("/api/posts", { preHandler: requireAuth }, async (req, reply) => {
    const b = postInput.parse(req.body);
    const info = db
      .prepare("INSERT INTO posts (author_id, category, title, excerpt, content, image_url, read_minutes) VALUES (?,?,?,?,?,?,?)")
      .run(req.me!.id, b.category, b.title, makeExcerpt(b.content), b.content, b.imageUrl ?? null, readMinutes(b.content));
    reply.code(201);
    return serializePost(getPostRow(db, Number(info.lastInsertRowid), req.me!.id)!, true);
  });

  app.patch("/api/posts/:id", { preHandler: requireAuth }, async (req) => {
    const { id } = idParam.parse(req.params);
    const b = postInput.partial().parse(req.body);
    const cur = db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as { author_id: number; category: string; title: string; content: string; image_url: string | null } | undefined;
    if (!cur) throw notFound("Fikr topilmadi");
    if (cur.author_id !== req.me!.id && req.me!.role !== "admin") throw forbidden();
    const content = b.content ?? cur.content;
    db.prepare(
      `UPDATE posts SET category=?, title=?, content=?, excerpt=?, image_url=?, read_minutes=?,
         updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`,
    ).run(
      b.category ?? cur.category,
      b.title ?? cur.title,
      content,
      makeExcerpt(content),
      b.imageUrl === undefined ? cur.image_url : b.imageUrl,
      readMinutes(content),
      id,
    );
    return serializePost(getPostRow(db, id, req.me!.id)!, true);
  });

  app.delete("/api/posts/:id", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = idParam.parse(req.params);
    const cur = db.prepare("SELECT author_id FROM posts WHERE id = ?").get(id) as { author_id: number } | undefined;
    if (!cur) throw notFound("Fikr topilmadi");
    if (cur.author_id !== req.me!.id && req.me!.role !== "admin") throw forbidden();
    db.prepare("DELETE FROM posts WHERE id = ?").run(id);
    reply.code(204);
  });

  // Like / Save — PUT qo‘shadi, DELETE olib tashlaydi (takror chaqirish xavfsiz).
  for (const [path, table, key] of [["like", "likes", "liked"], ["save", "saves", "saved"]] as const) {
    const exists = db.prepare("SELECT 1 FROM posts WHERE id = ?");
    const add = db.prepare(`INSERT OR IGNORE INTO ${table} (user_id, post_id) VALUES (?, ?)`);
    const del = db.prepare(`DELETE FROM ${table} WHERE user_id = ? AND post_id = ?`);
    const count = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE post_id = ?`);
    const reply = (id: number, on: boolean) => ({ [key]: on, ...(table === "likes" ? { likes: (count.get(id) as { n: number }).n } : {}) });
    app.put(`/api/posts/:id/${path}`, { preHandler: requireAuth }, async (req) => {
      const { id } = idParam.parse(req.params);
      if (!exists.get(id)) throw notFound("Fikr topilmadi");
      add.run(req.me!.id, id);
      return reply(id, true);
    });
    app.delete(`/api/posts/:id/${path}`, { preHandler: requireAuth }, async (req) => {
      const { id } = idParam.parse(req.params);
      if (!exists.get(id)) throw notFound("Fikr topilmadi");
      del.run(req.me!.id, id);
      return reply(id, false);
    });
  }
}
