export interface TanaClientOptions {
  apiKey: string;
  apiUrl?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number; // milliseconds
  timeout?: number; // milliseconds
  retries?: number;
}

export interface EvaluationResult {
  enabled: boolean;
  flagKey: string;
  reason: string;
  metadata?: {
    percentage?: number;
    bucket?: number;
  };
}

export interface BatchEvaluationResult {
  userId: string;
  flags: Record<
    string,
    {
      enabled: boolean;
      reason: string;
      metadata?: any;
    }
  >;
}

export interface CacheEntry {
  value: any;
  expiresAt: number;
}
