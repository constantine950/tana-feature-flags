
import fs from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function showMigrationStatus(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("📊 Migration Status\n");

    // Ensure migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, "../../migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    // Get executed migrations
    const executedResult = await pool.query<{
      filename: string;
      executed_at: Date;
    }>("SELECT filename, executed_at FROM schema_migrations ORDER BY filename");

    const executedMap = new Map(
      executedResult.rows.map((row) => [row.filename, row.executed_at]),
    );

    console.log("Status  | Migration File");
    console.log("--------|" + "-".repeat(50));

    let pendingCount = 0;
    let executedCount = 0;

    for (const file of files) {
      const executed = executedMap.get(file);
      if (executed) {
        console.log(`✅      | ${file} (${executed.toISOString()})`);
        executedCount++;
      } else {
        console.log(`⏳      | ${file} (pending)`);
        pendingCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`Total: ${files.length} migrations`);
    console.log(`Executed: ${executedCount}`);
    console.log(`Pending: ${pendingCount}`);

    if (pendingCount > 0) {
      console.log("\n💡 Run `npm run migrate` to execute pending migrations");
    } else {
      console.log("\n✨ All migrations are up to date!");
    }
  } catch (error) {
    console.error("❌ Failed to check migration status:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

showMigrationStatus();
