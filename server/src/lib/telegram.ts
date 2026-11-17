import { createHmac, timingSafeEqual } from "node:crypto";

export type TgUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

/**
 * Telegram Mini App `initData` ni tekshiradi:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initData: string, botToken: string, maxAgeSec = 86400, nowMs = Date.now()): TgUser | null {
  if (!botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString).digest();
  const given = Buffer.from(hash, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || nowMs / 1000 - authDate > maxAgeSec) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "") as TgUser;
    if (!Number.isInteger(user.id) || !user.first_name) return null;
    return user;
  } catch {
    return null;
  }
}
