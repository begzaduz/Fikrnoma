import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type Db = Database.Database;

export function openDb(path: string): Db {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

const NOW = "(strftime('%Y-%m-%dT%H:%M:%fZ','now'))";

function migrate(db: Db) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL UNIQUE,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    language TEXT NOT NULL DEFAULT 'uz',
    theme TEXT NOT NULL DEFAULT 'system',
    notifications INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    read_minutes INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category, id DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id, id DESC);
  CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (user_id, post_id)
  );
  CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
  CREATE TABLE IF NOT EXISTS saves (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (user_id, post_id)
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, id);
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
  );
  CREATE TABLE IF NOT EXISTS reads (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    read_at TEXT NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (user_id, post_id)
  );
  CREATE TABLE IF NOT EXISTS shorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    quote TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'sand',
    position INTEGER NOT NULL DEFAULT 0
  );
  `);
}
