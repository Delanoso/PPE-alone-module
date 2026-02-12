import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    success: true,
    message: "HFR PPE API is healthy",
    timestamp: new Date().toISOString(),
  }));
};
