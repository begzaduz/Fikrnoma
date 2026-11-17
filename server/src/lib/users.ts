import type { Db } from "../db.js";
import type { Config } from "../config.js";
import type { TgUser } from "./telegram.js";

export type UserRow = {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  language: string;
  theme: string;
  notifications: number;
  created_at: string;
};

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0]!.toUpperCase())
    .join("") || "?";

export const fullName = (first: string, last: string | null) => [first, last].filter(Boolean).join(" ");

export function publicUser(u: Pick<UserRow, "id" | "username" | "first_name" | "last_name" | "avatar_url">) {
  const name = fullName(u.first_name, u.last_name);
  return { id: u.id, name, initials: initialsOf(name), username: u.username, avatarUrl: u.avatar_url };
}

export function upsertUser(db: Db, tg: TgUser, config: Config): UserRow {
  const role = config.adminIds.includes(tg.id) ? "admin" : "user";
  return db
    .prepare(
      `INSERT INTO users (telegram_id, username, first_name, last_name, avatar_url, role)
       VALUES (@id, @username, @first_name, @last_name, @photo_url, @role)
       ON CONFLICT(telegram_id) DO UPDATE SET
         username = excluded.username, first_name = excluded.first_name,
         last_name = excluded.last_name, avatar_url = excluded.avatar_url,
         role = CASE WHEN excluded.role = 'admin' THEN 'admin' ELSE users.role END
       RETURNING *`,
    )
    .get({
      id: tg.id,
      username: tg.username ?? null,
      first_name: tg.first_name,
      last_name: tg.last_name ?? null,
      photo_url: tg.photo_url ?? null,
      role,
    }) as UserRow;
}
