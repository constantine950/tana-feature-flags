import { query } from "../config/database";

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export class AuditService {
  // Log an action
  static async log(
    userId: string,
    action: "create" | "update" | "delete" | "login" | "logout",
    entityType: "user" | "project" | "environment" | "flag" | "rule",
    entityId: string,
    changes?: any,
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          action,
          entityType,
          entityId,
          changes ? JSON.stringify(changes) : null,
        ],
      );
    } catch (error) {
      console.error("Failed to log audit:", error);
    }
  }

  // Get logs for a project
  static async getProjectLogs(
    projectId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    const result = await query(
      `SELECT a.*, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.entity_id = $1 
          OR (a.entity_type = 'flag' AND a.entity_id IN (
            SELECT id FROM feature_flags WHERE project_id = $1
          ))
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [projectId, limit],
    );

    return result.rows;
  }

  // Get logs for a flag
  static async getFlagLogs(
    flagId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    const result = await query(
      `SELECT a.*, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.entity_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [flagId, limit],
    );

    return result.rows;
  }
}
