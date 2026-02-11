import { query } from "../config/database";
import { Environment } from "../types";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export class EnvironmentService {
  // Generate API key
  static generateApiKey(environmentKey: string): string {
    const random = crypto.randomBytes(16).toString("hex");
    return `ffk_${environmentKey}_${random}`;
  }

  // Create environment
  static async createEnvironment(
    projectId: string,
    name: string,
    key: string,
  ): Promise<Environment> {
    // Generate API key
    const apiKey = this.generateApiKey(key);
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    const result = await query(
      `INSERT INTO environments (project_id, name, key, api_key_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, project_id, name, key, created_at, updated_at`,
      [projectId, name, key, apiKeyHash],
    );

    // Return environment with plain API key (only time it's shown)
    return {
      ...result.rows[0],
      apiKey, // Only shown once!
    };
  }

  // Get environments by project
  static async getEnvironmentsByProject(
    projectId: string,
  ): Promise<Environment[]> {
    const result = await query(
      `SELECT e.id, e.project_id, e.name, e.key, e.created_at, e.updated_at,
        (SELECT COUNT(*) FROM flag_rules WHERE environment_id = e.id) as flag_count
       FROM environments e
       WHERE project_id = $1
       ORDER BY created_at ASC`,
      [projectId],
    );

    return result.rows;
  }

  // Get environment by ID
  static async getEnvironmentById(id: string): Promise<Environment | null> {
    const result = await query(
      `SELECT id, project_id, name, key, created_at, updated_at
       FROM environments
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] || null;
  }

  // Delete environment
  static async deleteEnvironment(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM environments
       WHERE id = $1
       RETURNING id`,
      [id],
    );

    return result.rows.length > 0;
  }

  // Rotate API key
  static async rotateApiKey(environmentId: string): Promise<string> {
    const env = await this.getEnvironmentById(environmentId);
    if (!env) {
      throw new Error("Environment not found");
    }

    // Generate new API key
    const newApiKey = this.generateApiKey(env.key);
    const newApiKeyHash = await bcrypt.hash(newApiKey, 10);

    await query(
      `UPDATE environments
       SET api_key_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [newApiKeyHash, environmentId],
    );

    return newApiKey;
  }

  // Verify API key
  static async verifyApiKey(apiKey: string): Promise<Environment | null> {
    // Extract environment key from API key format: ffk_{env}_{random}
    const parts = apiKey.split("_");
    if (parts.length < 3 || parts[0] !== "ffk") {
      return null;
    }

    const envKey = parts[1];

    // Get all environments with this key
    const result = await query(`SELECT * FROM environments WHERE key = $1`, [
      envKey,
    ]);

    // Check each one's hash
    for (const env of result.rows) {
      const isValid = await bcrypt.compare(apiKey, env.api_key_hash);
      if (isValid) {
        return env;
      }
    }

    return null;
  }
}
