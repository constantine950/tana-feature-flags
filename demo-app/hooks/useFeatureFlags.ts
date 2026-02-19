"use client";

import { useState, useEffect } from "react";
import { flagsClient, FLAGS } from "../lib/flags";

export function useFeatureFlags(userId: string) {
  const [flags, setFlags] = useState<Record<string, boolean>>({
    [FLAGS.DARK_MODE]: false,
    [FLAGS.NEW_CHECKOUT]: false,
    [FLAGS.PREMIUM_BADGE]: false,
    [FLAGS.DISCOUNT_BANNER]: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const result = await flagsClient.getAllFlags(
          userId,
          Object.values(FLAGS),
        );
        setFlags(result);
      } catch (error) {
        console.error("Failed to load flags:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
    const interval = setInterval(loadFlags, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return { flags, loading };
}
