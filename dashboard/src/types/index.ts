export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  environment_count?: string;
  flag_count?: string;
}

export interface Environment {
  id: string;
  project_id: string;
  name: string;
  key: string;
  created_at: string;
  updated_at: string;
  apiKey?: string;
}

export interface FeatureFlag {
  id: string;
  project_id: string;
  key: string;
  name: string;
  description: string | null;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface FlagWithRule extends FeatureFlag {
  rule?: FlagRule | null;
}
