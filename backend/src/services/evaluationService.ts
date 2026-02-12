import murmurhash from "murmurhash";
import { FlagRule } from "../types";
import { FlagService } from "./flagService";
import { RuleService } from "./ruleService";
import redis from "../config/redis";

export class EvaluationService {
  // Cache TTL (60 seconds)
  private static CACHE_TTL = 60;

  // Evaluate flag for user
  static evaluate(
    rule: FlagRule,
    userId: string,
    flagKey: string,
  ): {
    enabled: boolean;
    reason: string;
    metadata?: any;
  } {
    // 1. Master switch
    if (!rule.enabled) {
      return {
        enabled: false,
        reason: "flag_disabled",
      };
    }

    // 2. Check blacklist
    if (rule.user_blacklist && rule.user_blacklist.includes(userId)) {
      return {
        enabled: false,
        reason: "user_blacklist",
      };
    }

    // 3. Check whitelist
    if (rule.user_whitelist && rule.user_whitelist.includes(userId)) {
      return {
        enabled: true,
        reason: "user_whitelist",
      };
    }

    // 4. Percentage rollout
    const bucket = this.getBucket(userId, flagKey);
    const enabled = bucket < rule.percentage;

    return {
      enabled,
      reason: "percentage_rollout",
      metadata: {
        percentage: rule.percentage,
        bucket,
      },
    };
  }

  // Get deterministic bucket (0-99)
  static getBucket(userId: string, flagKey: string): number {
    const input = `${userId}:${flagKey}`;
    const hash = murmurhash.v3(input);
    return hash % 100;
  }

  // Evaluate with caching
  static async evaluateWithCache(
    projectId: string,
    environmentId: string,
    flagKey: string,
    userId: string,
  ): Promise<{
    enabled: boolean;
    reason: string;
    metadata?: any;
  }> {
    // Try cache first
    const cacheKey = `eval:${projectId}:${environmentId}:${flagKey}:${userId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Cache read error:", error);
    }

    // Get flag
    const flag = await FlagService.getFlagByKey(projectId, flagKey);

    if (!flag) {
      return {
        enabled: false,
        reason: "flag_not_found",
      };
    }

    // Check if flag is active
    if (flag.status !== "active") {
      return {
        enabled: false,
        reason: "flag_inactive",
      };
    }

    // Get rule
    const rule = await RuleService.getRule(flag.id, environmentId);

    if (!rule) {
      return {
        enabled: false,
        reason: "rule_not_found",
      };
    }

    // Evaluate
    const result = this.evaluate(rule, userId, flagKey);

    // Cache result
    try {
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      console.error("Cache write error:", error);
    }

    return result;
  }

  // Batch evaluation with caching
  static async evaluateBatch(
    projectId: string,
    environmentId: string,
    flagKeys: string[],
    userId: string,
  ): Promise<
    Record<
      string,
      {
        enabled: boolean;
        reason: string;
        metadata?: any;
      }
    >
  > {
    const results: Record<string, any> = {};

    // Evaluate each flag
    await Promise.all(
      flagKeys.map(async (flagKey) => {
        results[flagKey] = await this.evaluateWithCache(
          projectId,
          environmentId,
          flagKey,
          userId,
        );
      }),
    );

    return results;
  }

  // Invalidate cache for flag
  static async invalidateCache(
    projectId: string,
    environmentId: string,
    flagKey: string,
  ): Promise<void> {
    try {
      const pattern = `eval:${projectId}:${environmentId}:${flagKey}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }
}
