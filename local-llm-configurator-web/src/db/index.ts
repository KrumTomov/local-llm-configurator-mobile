import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create the postgres client
const client = postgres(DATABASE_URL);

// Create the drizzle instance
export const db = drizzle(client, { schema });

// Type exports
export type * from './schema';
