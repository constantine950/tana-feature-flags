import { HttpClient } from "./http";
import { CacheManager } from "./cache";
import {
  TanaClientOptions,
  EvaluationResult,
  BatchEvaluationResult,
} from "./types";

export class TanaClient {
  private http: HttpClient;
  private cache: CacheManager | null;

  constructor(options: TanaClientOptions) {
    if (!options.apiKey) {
      throw new Error("API key is required");
    }

    this.http = new HttpClient(options);

    // Initialize cache if enabled
    this.cache =
      options.cacheEnabled !== false
        ? new CacheManager(options.cacheTTL)
        : null;

    // Cleanup expired cache entries every 5 minutes
    if (this.cache) {
      setInterval(
        () => {
          this.cache?.cleanup();
        },
        5 * 60 * 1000,
      );
    }
  }

  /**
   * Check if a feature flag is enabled for a user
   */
  async isEnabled(flagKey: string, userId: string): Promise<boolean> {
    const result = await this.evaluate(flagKey, userId);
    return result.enabled;
  }

  /**
   * Evaluate a single feature flag
   */
  async evaluate(
    flagKey: string,
    userId: string,
    context?: Record<string, any>,
  ): Promise<EvaluationResult> {
    // Check cache first
    if (this.cache) {
      const cacheKey = this.getCacheKey(flagKey, userId);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Call API
    const result = await this.http.post<EvaluationResult>("/api/v1/evaluate", {
      flagKey,
      userId,
      context,
    });

    // Cache result
    if (this.cache) {
      const cacheKey = this.getCacheKey(flagKey, userId);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get all flags for a user (batch evaluation)
   */
  async getAllFlags(
    userId: string,
    flagKeys: string[],
    context?: Record<string, any>,
  ): Promise<Record<string, boolean>> {
    const result = await this.evaluateBatch(flagKeys, userId, context);

    // Convert to simple enabled/disabled map
    const flags: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(result.flags)) {
      flags[key] = value.enabled;
    }

    return flags;
  }

  /**
   * Batch evaluate multiple flags
   */
  async evaluateBatch(
    flagKeys: string[],
    userId: string,
    context?: Record<string, any>,
  ): Promise<BatchEvaluationResult> {
    // Check cache for all flags
    const cachedResults: Record<string, any> = {};
    const uncachedKeys: string[] = [];

    if (this.cache) {
      for (const key of flagKeys) {
        const cacheKey = this.getCacheKey(key, userId);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          cachedResults[key] = cached;
        } else {
          uncachedKeys.push(key);
        }
      }
    } else {
      uncachedKeys.push(...flagKeys);
    }

    // Fetch uncached flags
    let apiResults: Record<string, any> = {};
    if (uncachedKeys.length > 0) {
      const result = await this.http.post<BatchEvaluationResult>(
        "/api/v1/evaluate/batch",
        { flagKeys: uncachedKeys, userId, context },
      );

      apiResults = result.flags;

      // Cache new results
      if (this.cache) {
        for (const [key, value] of Object.entries(apiResults)) {
          const cacheKey = this.getCacheKey(key, userId);
          this.cache.set(cacheKey, value);
        }
      }
    }

    // Combine cached and fresh results
    return {
      userId,
      flags: { ...cachedResults, ...apiResults },
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Clear cache for specific flag
   */
  clearFlagCache(flagKey: string): void {
    if (!this.cache) return;

    // This is inefficient but simple
    // In production, you'd want a better cache key structure
    this.cache.clear();
  }

  private getCacheKey(flagKey: string, userId: string): string {
    return `${flagKey}:${userId}`;
  }
}
