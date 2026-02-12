import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../../.env" });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  SIGNING_LINK_BASE_URL: z.string().url().default("http://localhost:5173/sign"),
  SIGNING_LINK_TTL_HOURS: z.coerce.number().positive().default(72),
  WHATSAPP_PROVIDER: z.string().default("twilio"),
  WHATSAPP_ACCOUNT_SID: z.string().optional(),
  WHATSAPP_AUTH_TOKEN: z.string().optional(),
  WHATSAPP_FROM_NUMBER: z.string().optional(),
});

export const env = envSchema.parse(process.env);
