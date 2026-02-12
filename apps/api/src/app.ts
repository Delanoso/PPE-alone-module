import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import { authPlugin } from "./plugins/auth.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { organizationRoutes } from "./routes/organization.js";
import { peopleRoutes } from "./routes/people.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { ppeRoutes } from "./routes/ppe.js";
import { issueRoutes } from "./routes/issues.js";
import { publicSignatureRoutes } from "./routes/public-signature.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: { colorize: true, translateTime: "SYS:standard" },
            }
          : undefined,
    },
  });

  app.register(cors, {
    origin: true,
    credentials: true,
  });
  app.register(helmet, { global: true });
  app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: "1 minute",
  });
  app.register(sensible);
  app.register(authPlugin);

  app.register(healthRoutes, { prefix: "/api/v1" });
  app.register(authRoutes, { prefix: "/api/v1/auth" });
  app.register(organizationRoutes, { prefix: "/api/v1" });
  app.register(peopleRoutes, { prefix: "/api/v1" });
  app.register(dashboardRoutes, { prefix: "/api/v1" });
  app.register(ppeRoutes, { prefix: "/api/v1" });
  app.register(issueRoutes, { prefix: "/api/v1" });
  app.register(publicSignatureRoutes, { prefix: "/api/v1" });

  return app;
}
