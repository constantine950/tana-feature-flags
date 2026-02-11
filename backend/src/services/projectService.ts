import { query } from "../config/database";
import { Project } from "../types";

export class ProjectService {
  // Create project
  static async createProject(
    name: string,
    ownerId: string,
    description?: string,
  ): Promise<Project> {
    const result = await query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, ownerId],
    );

    return result.rows[0];
  }

  // Get all projects for a user
  static async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    const result = await query(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM environments WHERE project_id = p.id) as environment_count,
        (SELECT COUNT(*) FROM feature_flags WHERE project_id = p.id) as flag_count
       FROM projects p
       WHERE owner_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [ownerId],
    );

    return result.rows;
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<Project | null> {
    const result = await query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM environments WHERE project_id = p.id) as environment_count,
        (SELECT COUNT(*) FROM feature_flags WHERE project_id = p.id) as flag_count
       FROM projects p
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    return result.rows[0] || null;
  }

  // Update project
  static async updateProject(
    id: string,
    name?: string,
    description?: string,
  ): Promise<Project | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.getProjectById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE projects 
       SET ${updates.join(", ")}
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values,
    );

    return result.rows[0] || null;
  }

  // Soft delete project
  static async deleteProject(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE projects 
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );

    return result.rows.length > 0;
  }

  // Check if user owns project
  static async isOwner(projectId: string, userId: string): Promise<boolean> {
    const result = await query(
      `SELECT id FROM projects 
       WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
      [projectId, userId],
    );

    return result.rows.length > 0;
  }
}
