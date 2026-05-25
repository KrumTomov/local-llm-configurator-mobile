import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = postgres(databaseUrl);

  return drizzle(client, { schema });
}

type Database = ReturnType<typeof createDb>;

let dbInstance: Database | null = null;

function getDb() {
  dbInstance ??= createDb();

  return dbInstance;
}

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, property, receiver);

    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// Type exports
export type * from './schema';
