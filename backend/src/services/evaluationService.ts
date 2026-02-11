import murmurhash from "murmurhash";
import { FlagRule } from "../types";

export class EvaluationService {
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
    // 1. Master switch - if not enabled, return false
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

    // 4. Percentage rollout (deterministic bucketing)
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

  // Get deterministic bucket (0-99) for user
  static getBucket(userId: string, flagKey: string): number {
    // Combine userId and flagKey for deterministic hashing
    const input = `${userId}:${flagKey}`;

    // Use MurmurHash3 for fast, deterministic hashing
    const hash = murmurhash.v3(input);

    // Map to 0-99 range
    return hash % 100;
  }
}
