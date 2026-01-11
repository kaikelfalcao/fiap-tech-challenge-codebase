import { z } from 'zod';

export const envSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  APP_PORT: z.coerce.number(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export type Env = z.infer<typeof envSchema>;
