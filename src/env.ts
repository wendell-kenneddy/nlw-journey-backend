import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  ORIGIN: z.string(),
  PORT: z.coerce.number().default(5000),
  API_BASE_URL: z.string().url(),
  WEB_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
