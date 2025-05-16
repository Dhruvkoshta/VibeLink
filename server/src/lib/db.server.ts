import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { getEnv } from './getEnv';



const sql = neon(getEnv("DATABASE_URL"));
const db = drizzle({ client: sql });

export default db;
