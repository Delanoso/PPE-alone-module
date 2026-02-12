import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = buildApp();

const bootstrap = async () => {
  try {
    await app.listen({ host: "0.0.0.0", port: env.APP_PORT });
    app.log.info(`API listening on port ${env.APP_PORT}`);
  } catch (error) {
    app.log.error(error, "Failed to start API");
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

void bootstrap();
