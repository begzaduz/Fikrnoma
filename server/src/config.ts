export type Config = {
  port: number;
  dbPath: string;
  jwtSecret: string;
  botToken: string;
  corsOrigin: string;
  devAuth: boolean;
  seed: boolean;
  adminIds: number[];
  /** true bo‘lsa har bir foydalanuvchi fikr yoza oladi; aks holda faqat admin (Fikrnoma). */
  openWriting: boolean;
  production: boolean;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const production = env.NODE_ENV === "production";
  const config: Config = {
    port: Number(env.PORT || 3000),
    dbPath: env.DB_PATH || "./data/fikrnoma.db",
    jwtSecret: env.JWT_SECRET || "dev-only-secret-change-me",
    botToken: env.TELEGRAM_BOT_TOKEN || "",
    corsOrigin: env.CORS_ORIGIN || "*",
    devAuth: env.DEV_AUTH === "true" && !production,
    seed: env.SEED === "true",
    adminIds: (env.ADMIN_TELEGRAM_IDS || "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0),
    openWriting: env.OPEN_WRITING === "true",
    production,
    cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: env.CLOUDINARY_API_SECRET || "",
  };
  if (production) {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET (kamida 32 belgi) production uchun majburiy");
    if (!config.botToken) throw new Error("TELEGRAM_BOT_TOKEN production uchun majburiy");
  }
  return config;
}
