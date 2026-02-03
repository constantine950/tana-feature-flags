// backend/src/types/index.ts
export interface User {
  id: string;
  email: string;
  name?: string;
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
