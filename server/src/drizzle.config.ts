import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { getEnv } from './lib/getEnv';

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: getEnv("DATABASE_URL"),
  },
});
