import { TanaClient } from "../src";

async function main() {
  // Initialize client
  const client = new TanaClient({
    apiKey:
      process.env.TANA_API_KEY || "ffk_dev_9e1387b0f8ab0f38cc89c2597f046e47",
    apiUrl: "http://localhost:3000",
    cacheEnabled: true,
    cacheTTL: 60000, // 60 seconds
  });

  const userId = "user_123";

  console.log("🚀 Tana SDK Example\n");

  // Example 1: Simple flag check
  console.log("1. Check if feature is enabled:");
  const isEnabled = await client.isEnabled("new_checkout", userId);
  console.log(`   new_checkout: ${isEnabled}\n`);

  // Example 2: Get full evaluation result
  console.log("2. Get evaluation details:");
  const result = await client.evaluate("dark_mode", userId);
  console.log("   ", JSON.stringify(result, null, 2), "\n");

  // Example 3: Batch evaluation
  console.log("3. Evaluate multiple flags:");
  const flags = await client.getAllFlags(userId, [
    "new_checkout",
    "dark_mode",
    "premium_features",
  ]);
  console.log("   ", JSON.stringify(flags, null, 2), "\n");

  // Example 4: Cached vs uncached
  console.log("4. Cache performance:");

  console.time("   First call (no cache)");
  await client.isEnabled("new_checkout", userId);
  console.timeEnd("   First call (no cache)");

  console.time("   Second call (cached)");
  await client.isEnabled("new_checkout", userId);
  console.timeEnd("   Second call (cached)");

  console.log("\n✅ Done!");
}

main().catch(console.error);
