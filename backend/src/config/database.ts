import { Pool, PoolClient } from "pg";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event handlers
pool.on("connect", () => {
  console.log("✅ Database connected");
});

pool.on("error", (err) => {
  console.error("❌ Database error:", err);
});

// Helper for queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === "development") {
    console.log("📊 Query:", {
      text: text.substring(0, 50),
      duration: `${duration}ms`,
      rows: res.rowCount,
    });
  }

  return res;
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query("SELECT NOW() as now");
    console.log("✅ Database test successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return false;
  }
};

// Get a client from pool
export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

// Close pool
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log("Database pool closed");
};

export default pool;
