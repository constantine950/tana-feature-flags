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
  project_id: string;
  key: string;
  name: string;
  description: string | null;
  status: "active" | "inactive" | "archived";
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
}

export interface FlagRule {
  id: string;
  flag_id: string;
  environment_id: string;
  enabled: boolean;
  percentage: number;
  user_whitelist: string[];
  user_blacklist: string[];
  created_at: Date;
  updated_at: Date;
}

export interface FlagWithRule extends FeatureFlag {
  rule?: FlagRule;
}

export interface EvaluationRequest {
  flagKey: string;
  userId: string;
  context?: Record<string, any>;
}

export interface EvaluationResult {
  enabled: boolean;
  flagKey: string;
  reason:
    | "flag_disabled"
    | "user_blacklist"
    | "user_whitelist"
    | "percentage_rollout"
    | "flag_not_found";
  metadata?: {
    percentage?: number;
    bucket?: number;
  };
}
