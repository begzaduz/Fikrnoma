import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { Ctx } from "../app.js";
import { makeAuth } from "../lib/auth.js";
import { HttpError } from "../lib/http.js";

const input = z.object({
  fileName: z.string().trim().min(1).max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  data: z.string().min(100).max(7_000_000),
});
const MAX_BYTES = 5 * 1024 * 1024;

function validImage(bytes: Buffer, mime: string) {
  if (mime === "image/jpeg") return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}

export function mediaRoutes(app: FastifyInstance, { db, config }: Ctx) {
  const { requireAuth } = makeAuth(db);
  app.post("/api/media/upload", {
    preHandler: requireAuth,
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
  }, async (req) => {
    if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
      throw new HttpError(503, "Rasm yuklash xizmati sozlanmagan");
    }
    const body = input.parse(req.body);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(body.data)) throw new HttpError(400, "Rasm fayli noto‘g‘ri");
    const bytes = Buffer.from(body.data, "base64");
    if (!bytes.length || bytes.length > MAX_BYTES || !validImage(bytes, body.mimeType)) {
      throw new HttpError(400, "Faqat 5 MB gacha JPG, PNG yoki WEBP rasm yuklash mumkin");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "fikrnoma/covers";
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${config.cloudinaryApiSecret}`)
      .digest("hex");
    const form = new FormData();
    const fileBytes = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    form.set("file", new Blob([fileBytes], { type: body.mimeType }), body.fileName);
    form.set("api_key", config.cloudinaryApiKey);
    form.set("timestamp", timestamp);
    form.set("folder", folder);
    form.set("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudinaryCloudName)}/image/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30_000),
    }).catch(() => null);
    if (!response?.ok) {
      req.log.error({ status: response?.status }, "Cloudinary upload failed");
      throw new HttpError(502, "Rasmni saqlab bo‘lmadi. Qayta urinib ko‘ring");
    }
    const result = await response.json() as { secure_url?: string; bytes?: number; format?: string };
    if (!result.secure_url?.startsWith("https://")) throw new HttpError(502, "Rasm manzili olinmadi");
    return { url: result.secure_url, bytes: result.bytes ?? bytes.length, format: result.format ?? null };
  });
}
