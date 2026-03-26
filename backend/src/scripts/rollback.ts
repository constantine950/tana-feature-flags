import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function rollbackLastMigration(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Rolling back last migration...\n");

    // Get last migration
    const result = await pool.query<{
      id: number;
      filename: string;
      executed_at: Date;
    }>(
      "SELECT id, filename, executed_at FROM schema_migrations ORDER BY executed_at DESC LIMIT 1",
    );

    if (result.rows.length === 0) {
      console.log("No migrations to rollback");
      return;
    }

    const lastMigration = result.rows[0];
    console.log(`Rolling back: ${lastMigration.filename}`);
    console.log(`Executed at: ${lastMigration.executed_at.toISOString()}\n`);

    // Warning
    console.log("WARNING: This will delete the migration record.");

    // Remove migration record
    await pool.query("DELETE FROM schema_migrations WHERE id = $1", [
      lastMigration.id,
    ]);

    console.log("Migration record removed");
  } catch (error) {
    console.error("Rollback failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rollbackLastMigration();
