// Fikrnoma backend bilan aloqa: kirish (Telegram yoki dev), token va tipli so‘rovlar.

const BASE: string = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "fikrnoma_token";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let token: string | null = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
} catch {
  /* storage mavjud emas */
}
const saveToken = (t: string | null) => {
  token = t;
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* e'tiborsiz */
  }
};

async function send<T>(method: string, path: string, body?: unknown, withAuth = true): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText);
  return data as T;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
    return await send<T>(method, path, body);
  } catch (e) {
    // Token eskirgan bo‘lsa: bir marta qayta kirib, so‘rovni takrorlaymiz.
    if (e instanceof ApiError && e.status === 401 && token) {
      saveToken(null);
      if (await login()) return send<T>(method, path, body);
    }
    throw e;
  }
}

let pending: Promise<boolean> | null = null;
/** Telegram Mini App ichida initData bilan, lokal dev rejimida dev-kirish bilan. Mehmon bo‘lsa false. */
export function login(): Promise<boolean> {
  pending ??= (async () => {
    try {
      const tg = window.Telegram?.WebApp;
      let res: { token: string };
      if (tg?.initData) {
        res = await send("POST", "/api/auth/telegram", { initData: tg.initData }, false);
      } else if (import.meta.env.DEV) {
        res = await send("POST", "/api/auth/dev", { telegramId: 100001, firstName: "Bekzod", username: "bekzodmh" }, false);
      } else {
        return !!token;
      }
      saveToken(res.token);
      return true;
    } catch {
      return false;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/* ---------- Tiplar ---------- */
type ApiPost = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string | null;
  readMinutes: number;
  author: { id: number; name: string; initials: string };
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
};

export type Post = {
  id: number;
  category: string;
  time: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  initials: string;
  likes: number;
  comments: number;
  image: string;
  liked: boolean;
  saved: boolean;
};
export type Short = { id: number; category: string; quote: string; tone: string };
export type Me = { id: number; name: string; initials: string; username: string | null; role: string; canWrite: boolean };
export type Stats = { answers: number; posts: number; liked: number; saved: number; followers: number; following: number; readsThisMonth: number };

export function toPost(p: ApiPost): Post {
  const read = `${p.readMinutes} daqiqa o‘qish`;
  return {
    id: p.id,
    category: p.category,
    time: read,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content ?? p.excerpt,
    author: p.author.name,
    initials: p.author.initials,
    likes: p.likes,
    comments: p.comments,
    image: p.imageUrl ?? FALLBACK_IMAGE,
    liked: p.liked,
    saved: p.saved,
  };
}

/* ---------- So‘rovlar ---------- */
export const fetchPosts = async () => (await request<{ items: ApiPost[] }>("GET", "/api/posts?limit=50")).items.map(toPost);
export const fetchPost = async (id: number) => toPost(await request<ApiPost>("GET", `/api/posts/${id}`));
export const fetchFeatured = async () => toPost(await request<ApiPost>("GET", "/api/posts/featured"));
export const fetchShorts = async () => (await request<{ items: Short[] }>("GET", "/api/shorts")).items;
export const fetchMe = () => request<Me>("GET", "/api/me");
export const fetchStats = () => request<Stats>("GET", "/api/me/stats");
export const fetchMyList = async (kind: "posts" | "saved" | "liked") =>
  (await request<{ items: ApiPost[] }>("GET", `/api/me/${kind}?limit=50`)).items.map(toPost);
export const createPost = async (b: { category: string; title: string; content: string; imageUrl?: string }) =>
  toPost(await request<ApiPost>("POST", "/api/posts", b));

export async function uploadImage(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  const result = await request<{ url: string }>("POST", "/api/media/upload", {
    fileName: file.name,
    mimeType: file.type,
    data: btoa(binary),
  });
  return result.url;
}
export const setReaction = (id: number, kind: "like" | "save", on: boolean) =>
  request<{ likes?: number }>(on ? "PUT" : "DELETE", `/api/posts/${id}/${kind}`);

/* ---------- Kunlik 5 savol (javoblar faqat foydalanuvchining o‘ziga ko‘rinadi) ---------- */
export type DailyState = {
  day: string;
  questions: Array<{ index: number; text: string; answer: string | null }>;
  done: number;
  streak: number;
  points: number;
  level: { name: string; lo: number; hi: number };
};
export type MyAnswer = { day: string; idx: number; question: string; body: string };
export const fetchDaily = () => request<DailyState>("GET", "/api/daily");
export const saveAnswer = (index: number, body: string) => request<DailyState>("POST", "/api/daily/answer", { index, body });
export const fetchAnswers = async () => (await request<{ items: MyAnswer[] }>("GET", "/api/me/answers?limit=20")).items;
