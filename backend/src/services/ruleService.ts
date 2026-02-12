import { query } from "../config/database";
import { FlagRule } from "../types";
import { EvaluationService } from "./evaluationService";
import { FlagService } from "./flagService";

export class RuleService {
  // Get or create rule
  static async getOrCreateRule(
    flagId: string,
    environmentId: string,
  ): Promise<FlagRule> {
    // Try to get existing rule
    let result = await query(
      `SELECT * FROM flag_rules
       WHERE flag_id = $1 AND environment_id = $2`,
      [flagId, environmentId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create default rule
    result = await query(
      `INSERT INTO flag_rules (flag_id, environment_id, enabled, percentage, user_whitelist, user_blacklist)
       VALUES ($1, $2, false, 0, ARRAY[]::text[], ARRAY[]::text[])
       RETURNING *`,
      [flagId, environmentId],
    );

    return result.rows[0];
  }

  static async updateRule(
    flagId: string,
    environmentId: string,
    updates: {
      enabled?: boolean;
      percentage?: number;
      userWhitelist?: string[];
      userBlacklist?: string[];
    },
  ): Promise<FlagRule> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.enabled !== undefined) {
      fields.push(`enabled = $${paramCount}`);
      values.push(updates.enabled);
      paramCount++;
    }

    if (updates.percentage !== undefined) {
      if (updates.percentage < 0 || updates.percentage > 100) {
        throw new Error("Percentage must be between 0 and 100");
      }
      fields.push(`percentage = $${paramCount}`);
      values.push(updates.percentage);
      paramCount++;
    }

    if (updates.userWhitelist !== undefined) {
      fields.push(`user_whitelist = $${paramCount}`);
      values.push(updates.userWhitelist);
      paramCount++;
    }

    if (updates.userBlacklist !== undefined) {
      fields.push(`user_blacklist = $${paramCount}`);
      values.push(updates.userBlacklist);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.getOrCreateRule(flagId, environmentId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(flagId, environmentId);

    const result = await query(
      `UPDATE flag_rules
       SET ${fields.join(", ")}
       WHERE flag_id = $${paramCount} AND environment_id = $${paramCount + 1}
       RETURNING *`,
      values,
    );

    const rule =
      result.rows[0] || (await this.getOrCreateRule(flagId, environmentId));

    // Invalidate cache - NEW
    const flag = await FlagService.getFlagById(flagId);
    if (flag) {
      await EvaluationService.invalidateCache(
        flag.project_id,
        environmentId,
        flag.key,
      );
    }

    return rule;
  }

  // Get rule
  static async getRule(
    flagId: string,
    environmentId: string,
  ): Promise<FlagRule | null> {
    const result = await query(
      `SELECT * FROM flag_rules
       WHERE flag_id = $1 AND environment_id = $2`,
      [flagId, environmentId],
    );

    return result.rows[0] || null;
  }
}
