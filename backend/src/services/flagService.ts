import { query } from "../config/database";
import { FeatureFlag, FlagWithRule } from "../types";

export class FlagService {
  // Create flag
  static async createFlag(
    projectId: string,
    key: string,
    name: string,
    description: string | null,
    createdBy: string,
  ): Promise<FeatureFlag> {
    // Validate key format (snake_case)
    if (!/^[a-z0-9_]+$/.test(key)) {
      throw new Error(
        "Flag key must be lowercase letters, numbers, and underscores only",
      );
    }

    const result = await query(
      `INSERT INTO feature_flags (project_id, key, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, 'active', $5)
       RETURNING *`,
      [projectId, key, name, description, createdBy],
    );

    return result.rows[0];
  }

  // Get flags by project
  static async getFlagsByProject(projectId: string): Promise<FeatureFlag[]> {
    const result = await query(
      `SELECT * FROM feature_flags
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId],
    );

    return result.rows;
  }

  // Get flag by ID
  static async getFlagById(id: string): Promise<FeatureFlag | null> {
    const result = await query(`SELECT * FROM feature_flags WHERE id = $1`, [
      id,
    ]);

    return result.rows[0] || null;
  }

  // Get flag by key and project
  static async getFlagByKey(
    projectId: string,
    key: string,
  ): Promise<FeatureFlag | null> {
    const result = await query(
      `SELECT * FROM feature_flags
       WHERE project_id = $1 AND key = $2`,
      [projectId, key],
    );

    return result.rows[0] || null;
  }

  // Update flag
  static async updateFlag(
    id: string,
    updates: {
      name?: string;
      description?: string;
      status?: "active" | "inactive" | "archived";
    },
  ): Promise<FeatureFlag | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(updates.name);
      paramCount++;
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(updates.description);
      paramCount++;
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(updates.status);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.getFlagById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE feature_flags
       SET ${fields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    return result.rows[0] || null;
  }

  // Delete flag
  static async deleteFlag(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM feature_flags WHERE id = $1 RETURNING id`,
      [id],
    );

    return result.rows.length > 0;
  }

  // Get flags with rules for environment
  static async getFlagsWithRules(
    projectId: string,
    environmentId: string,
  ): Promise<FlagWithRule[]> {
    const result = await query(
      `SELECT 
        f.*,
        json_build_object(
          'id', r.id,
          'flag_id', r.flag_id,
          'environment_id', r.environment_id,
          'enabled', r.enabled,
          'percentage', r.percentage,
          'user_whitelist', r.user_whitelist,
          'user_blacklist', r.user_blacklist,
          'created_at', r.created_at,
          'updated_at', r.updated_at
        ) as rule
       FROM feature_flags f
       LEFT JOIN flag_rules r ON f.id = r.flag_id AND r.environment_id = $2
       WHERE f.project_id = $1
       ORDER BY f.created_at DESC`,
      [projectId, environmentId],
    );

    return result.rows.map((row) => ({
      ...row,
      rule: row.rule.id ? row.rule : null,
    }));
  }
}
