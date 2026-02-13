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
}
