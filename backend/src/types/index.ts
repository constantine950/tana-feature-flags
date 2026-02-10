export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  expiresIn: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  key: string;
}

export interface FeatureFlag {
  id: string;
  projectId: string;
  key: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "archived";
}

export interface FlagRule {
  id: string;
  flagId: string;
  environmentId: string;
  enabled: boolean;
  percentage: number;
  userWhitelist: string[];
  userBlacklist: string[];
}
