import type { Db } from "../db.js";
import { publicUser } from "./users.js";

export const CATEGORIES = ["TAFAKKUR", "HAYOT", "PSIXOLOGIYA", "BIZNES", "FALSAFA", "JAMIYAT"] as const;

type PostRow = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  read_minutes: number;
  created_at: string;
  updated_at: string;
  author_id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
  likes: number;
  comments: number;
  liked: number;
  saved: number;
};

const POST_SELECT = `
  SELECT p.*, u.first_name, u.last_name, u.username, u.avatar_url,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = @me) AS liked,
    EXISTS(SELECT 1 FROM saves s WHERE s.post_id = p.id AND s.user_id = @me) AS saved
  FROM posts p JOIN users u ON u.id = p.author_id`;

export function serializePost(r: PostRow, withContent: boolean) {
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt,
    ...(withContent ? { content: r.content } : {}),
    imageUrl: r.image_url,
    readMinutes: r.read_minutes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    author: publicUser({ id: r.author_id, first_name: r.first_name, last_name: r.last_name, username: r.username, avatar_url: r.avatar_url }),
    likes: r.likes,
    comments: r.comments,
    liked: !!r.liked,
    saved: !!r.saved,
  };
}

export function makeExcerpt(content: string) {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length <= 150 ? flat : flat.slice(0, 150).trimEnd() + "…";
}

export function readMinutes(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

export type ListOpts = {
  viewerId: number;
  where?: string[];
  params?: Record<string, unknown>;
  limit: number;
  cursor?: number;
};

export function listPosts(db: Db, o: ListOpts) {
  const where = [...(o.where ?? [])];
  const params: Record<string, unknown> = { ...o.params, me: o.viewerId, limit: o.limit + 1 };
  if (o.cursor) {
    where.push("p.id < @cursor");
    params.cursor = o.cursor;
  }
  const sql = `${POST_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.id DESC LIMIT @limit`;
  const rows = db.prepare(sql).all(params) as PostRow[];
  const hasMore = rows.length > o.limit;
  const page = hasMore ? rows.slice(0, o.limit) : rows;
  return { items: page.map((r) => serializePost(r, false)), nextCursor: hasMore ? page[page.length - 1]!.id : null };
}

export function getPostRow(db: Db, id: number, viewerId: number) {
  return db.prepare(`${POST_SELECT} WHERE p.id = @id`).get({ id, me: viewerId }) as PostRow | undefined;
}
