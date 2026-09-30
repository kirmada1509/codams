import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  DATABASE_SCHEMA: z
    .union([
      z.uuid(), // UUIDs (E2E tests) - allows hyphens
      z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/), // Valid PostgreSQL identifiers
    ])
    .optional(),
  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(604800),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().min(1),
  MAIL_PASS: z.string().min(1),
  MAIL_FROM: z.string().email(),
})

export type Env = z.infer<typeof envSchema>
