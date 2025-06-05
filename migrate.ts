import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

export async function runMigrations() {
  if (!DATABASE_URL) {
    console.log('⏭️ Using in-memory storage - no migrations needed');
    return;
  }

  try {
    console.log('🔄 Running database migrations...');
    const sql = postgres(DATABASE_URL);
    const db = drizzle(sql);
    
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}