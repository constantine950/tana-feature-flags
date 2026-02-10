import { query } from "../config/database";
import { User, UserResponse, RegisterRequest } from "../types";
import { hashPassword, comparePassword } from "../utils/password";

export class UserService {
  // Create new user
  static async createUser(data: RegisterRequest): Promise<User> {
    const { email, password, name } = data;

    // Check if user already exists
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, password_hash, name, created_at, updated_at, last_login_at`,
      [email.toLowerCase(), passwordHash, name || null],
    );

    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);

    return result.rows[0] || null;
  }

  // Verify user credentials
  static async verifyCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    return user;
  }

  // Update last login
  static async updateLastLogin(userId: string): Promise<void> {
    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      userId,
    ]);
  }

  // Convert User to UserResponse (remove password)
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    };
  }
}
