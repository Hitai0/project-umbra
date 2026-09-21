import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
const connectionString = process.env.DATABASE_URL || 'postgres://mmo_user:mmo_password@localhost:5432/mmo_game';
export let db = null;
export function initDatabase() {
    try {
        const client = postgres(connectionString, { max: 10, connect_timeout: 3 });
        db = drizzle(client, { schema });
        console.log('✅ PostgreSQL connection pool initialized');
    }
    catch (err) {
        console.warn('⚠️ Database connection deferred or not available:', err.message);
    }
}
