import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    user: {
      userId: string;
      roleCode: string;
      email: string;
    };
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  await app.register(import("@fastify/jwt"), {
    secret: env.JWT_ACCESS_SECRET,
  });

  app.decorate("authenticate", async (request: FastifyRequest) => {
    await request.jwtVerify();
  });
});
