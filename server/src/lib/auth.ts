import type { FastifyRequest } from "fastify";
import type { Db } from "../db.js";
import { HttpError } from "./http.js";
import type { UserRow } from "./users.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: number };
    user: { sub: number };
  }
}
declare module "fastify" {
  interface FastifyRequest {
    me?: UserRow;
  }
}

export function makeAuth(db: Db) {
  const find = db.prepare("SELECT * FROM users WHERE id = ?");
  return {
    /** Token majburiy; foydalanuvchi bazada bo‘lishi shart. */
    async requireAuth(req: FastifyRequest) {
      try {
        await req.jwtVerify();
      } catch {
        throw new HttpError(401, "Kirish talab qilinadi");
      }
      const me = find.get(req.user.sub) as UserRow | undefined;
      if (!me) throw new HttpError(401, "Foydalanuvchi topilmadi");
      req.me = me;
    },
    /** Token bo‘lsa o‘qiydi, bo‘lmasa mehmon sifatida davom etadi. */
    async optionalAuth(req: FastifyRequest) {
      try {
        await req.jwtVerify();
        req.me = find.get(req.user.sub) as UserRow | undefined;
      } catch {
        /* mehmon */
      }
    },
  };
}
