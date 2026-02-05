import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { Pool } from "pg";

async function runMigrations(): Promise<void> {
  const pool = new Pool({
    connectionString:
      "postgresql://postgres:postgres@localhost:5432/tana_flags",
  });

  try {
    console.log("🚀 Starting database migrations...\n");

    // Create migrations tracking table if it doesn't exist
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

    if (files.length === 0) {
      console.log("⚠️  No migration files found");
      return;
    }

    // Process each migration
    for (const file of files) {
      // Check if migration already executed
      const result = await pool.query<{ filename: string }>(
        "SELECT filename FROM schema_migrations WHERE filename = $1",
        [file],
      );

      if (result.rows.length > 0) {
        console.log(`⏭️  ${file} - already executed`);
        continue;
      }

      console.log(`📝 Running migration: ${file}`);

      try {
        // Read migration file
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

        // Execute migration in a transaction
        await pool.query("BEGIN");
        await pool.query(sql);

        // Record migration
        await pool.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );

        await pool.query("COMMIT");

        console.log(`✅ ${file} - completed\n`);
      } catch (error) {
        await pool.query("ROLLBACK");
        console.error(`❌ ${file} - failed:`, error);
        throw error;
      }
    }

    console.log("🎉 All migrations completed successfully!\n");

    // Show migration status
    const allMigrations = await pool.query<{
      filename: string;
      executed_at: Date;
    }>(
      "SELECT filename, executed_at FROM schema_migrations ORDER BY executed_at",
    );

    console.log("📊 Migration History:");
    allMigrations.rows.forEach((row) => {
      console.log(`   ✓ ${row.filename} (${row.executed_at.toISOString()})`);
    });
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
