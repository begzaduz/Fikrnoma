import type { FastifyInstance } from "fastify";
import type { Ctx } from "../app.js";

export function shortsRoutes(app: FastifyInstance, { db }: Ctx) {
  app.get("/api/shorts", async () => ({
    items: db.prepare("SELECT id, category, quote, tone FROM shorts ORDER BY position, id").all(),
  }));
}
