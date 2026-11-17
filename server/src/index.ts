import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { openDb } from "./db.js";
import { seedIfEmpty } from "./seed.js";

const config = loadConfig();
const db = openDb(config.dbPath);
if (config.seed) seedIfEmpty(db);

const app = await buildApp({ db, config }, { logger: true });
await app.listen({ port: config.port, host: "0.0.0.0" });

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, async () => {
    await app.close();
    db.close();
    process.exit(0);
  });
}
