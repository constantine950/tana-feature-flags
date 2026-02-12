# @tana/feature-flags

JavaScript/TypeScript SDK for Tana Feature Flags

## Installation

```bash
npm install @tana/feature-flags
```

## Quick Start

```typescript
import { TanaClient } from "@tana/feature-flags";

const client = new TanaClient({
  apiKey: "ffk_prod_your_api_key_here",
});

// Check if feature is enabled
const enabled = await client.isEnabled("new_checkout", "user_123");

if (enabled) {
  // Show new checkout flow
} else {
  // Show old checkout flow
}
```

## Features

- ✅ Simple API
- ✅ TypeScript support
- ✅ Automatic caching
- ✅ Batch evaluation
- ✅ Retry logic
- ✅ Zero dependencies (except axios)

## API Reference

### Constructor

```typescript
new TanaClient(options: TanaClientOptions)
```

**Options:**

| Option         | Type    | Default                 | Description                     |
| -------------- | ------- | ----------------------- | ------------------------------- |
| `apiKey`       | string  | **required**            | Your API key (from environment) |
| `apiUrl`       | string  | `http://localhost:3000` | API endpoint URL                |
| `cacheEnabled` | boolean | `true`                  | Enable client-side caching      |
| `cacheTTL`     | number  | `60000`                 | Cache TTL in milliseconds       |
| `timeout`      | number  | `5000`                  | Request timeout in milliseconds |
| `retries`      | number  | `2`                     | Number of retries on failure    |

### Methods

#### `isEnabled(flagKey: string, userId: string): Promise<boolean>`

Check if a flag is enabled for a user.

```typescript
const enabled = await client.isEnabled("new_feature", "user_123");
```

#### `evaluate(flagKey: string, userId: string, context?): Promise<EvaluationResult>`

Get full evaluation result with metadata.

```typescript
const result = await client.evaluate("new_feature", "user_123");
console.log(result);
// {
//   enabled: true,
//   flagKey: 'new_feature',
//   reason: 'percentage_rollout',
//   metadata: { percentage: 50, bucket: 23 }
// }
```

#### `getAllFlags(userId: string, flagKeys: string[], context?): Promise<Record<string, boolean>>`

Evaluate multiple flags at once.

```typescript
const flags = await client.getAllFlags("user_123", [
  "new_checkout",
  "dark_mode",
  "premium_features",
]);

console.log(flags);
// {
//   new_checkout: true,
//   dark_mode: false,
//   premium_features: true
// }
```

#### `evaluateBatch(flagKeys: string[], userId: string, context?): Promise<BatchEvaluationResult>`

Get detailed results for multiple flags.

```typescript
const result = await client.evaluateBatch(
  ["feature_a", "feature_b"],
  "user_123",
);
```

#### `clearCache(): void`

Clear all cached values.

```typescript
client.clearCache();
```

## Examples

### Basic Usage

```typescript
import { TanaClient } from "@tana/feature-flags";

const client = new TanaClient({
  apiKey: process.env.TANA_API_KEY,
});

// Simple check
if (await client.isEnabled("new_ui", userId)) {
  renderNewUI();
}
```

### With Context

```typescript
const result = await client.evaluate("premium_feature", userId, {
  plan: "pro",
  country: "US",
});
```

### Batch Loading

```typescript
// Load all flags on app init
const flags = await client.getAllFlags(userId, [
  "dark_mode",
  "new_dashboard",
  "beta_features",
]);

// Use throughout app
if (flags.dark_mode) enableDarkMode();
if (flags.new_dashboard) showNewDashboard();
```

### React Hook

```typescript
import { useState, useEffect } from 'react';
import { client } from './tana';

function useFeatureFlag(flagKey: string, userId: string) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.isEnabled(flagKey, userId)
      .then(setEnabled)
      .finally(() => setLoading(false));
  }, [flagKey, userId]);

  return { enabled, loading };
}

// Usage
function MyComponent() {
  const { enabled, loading } = useFeatureFlag('new_feature', user.id);

  if (loading) return <Spinner />;

  return enabled ? <NewFeature /> : <OldFeature />;
}
```

### Express Middleware

```typescript
import { TanaClient } from "@tana/feature-flags";

const client = new TanaClient({
  apiKey: process.env.TANA_API_KEY,
});

app.use(async (req, res, next) => {
  if (req.user) {
    req.flags = await client.getAllFlags(req.user.id, [
      "api_v2",
      "rate_limiting",
      "new_features",
    ]);
  }
  next();
});

app.get("/data", async (req, res) => {
  if (req.flags.api_v2) {
    return res.json(newDataFormat);
  }
  return res.json(oldDataFormat);
});
```

## Error Handling

```typescript
try {
  const enabled = await client.isEnabled("feature", userId);
} catch (error) {
  console.error("Flag evaluation failed:", error);
  // Use default value
  const enabled = false;
}
```

## Performance

With caching enabled (default):

- First call: ~50-100ms (API request)
- Subsequent calls: <1ms (cache hit)
- Cache TTL: 60 seconds (configurable)

Batch evaluation is more efficient:

```typescript
// ❌ Bad: 3 API calls
const a = await client.isEnabled("feat_a", userId);
const b = await client.isEnabled("feat_b", userId);
const c = await client.isEnabled("feat_c", userId);

// ✅ Good: 1 API call
const flags = await client.getAllFlags(userId, ["feat_a", "feat_b", "feat_c"]);
```

## TypeScript

Full TypeScript support included:

```typescript
import { TanaClient, EvaluationResult } from "@tana/feature-flags";

const client = new TanaClient({ apiKey: "key" });

const result: EvaluationResult = await client.evaluate("flag", "user");
```

## License

MIT
