import { z } from 'zod';
import type { StringValue } from 'ms';

export const envSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  APP_PORT: z.coerce.number(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.custom<StringValue>().default('1d'),
});

export type Env = z.infer<typeof envSchema>;
