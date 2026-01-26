# Technical Decisions - Feature Flag Service

**Last Updated:** January 26, 2026

This document records major technical decisions, the alternatives considered, and the reasoning behind each choice.

---

## Decision 1: Server-Side vs Client-Side Evaluation

### Context
Feature flags can be evaluated either on the client (SDK) or server (API). This is a fundamental architectural decision.

### Options Considered

**Option A: Client-Side Evaluation**
- SDK fetches all flag configurations
- SDK evaluates rules locally (in user's app)
- No API call needed for each flag check

**Option B: Server-Side Evaluation**
- SDK sends (user ID, flag key) to API
- Server evaluates rules and returns boolean
- Requires API call for each evaluation

**Option C: Hybrid**
- Simple flags evaluated client-side
- Complex rules evaluated server-side

### Decision: **Server-Side Evaluation**

### Reasoning

**Security:**
- Flag rules remain server-side (not exposed to clients)
- Cannot inspect code to see percentage rollout thresholds
- User targeting rules are private

**Flexibility:**
- Can change evaluation logic without SDK updates
- Can add complex rules (database lookups, external API calls)
- Centralized rule engine

**Consistency:**
- Single source of truth for flag evaluation
- No client-side bugs affecting evaluation
- Easier to debug (all logs server-side)

**Analytics:**
- Server can log every flag evaluation
- Track usage patterns
- A/B test metrics

### Trade-offs

**Pros:**
- ✅ Better security
- ✅ More flexible
- ✅ Centralized logging
- ✅ Consistent evaluation

**Cons:**
- ❌ Network latency (30-50ms per check)
- ❌ Server load (must handle millions of requests)
- ❌ Requires API availability

**Mitigation Strategies:**
- Aggressive caching (Redis + SDK local cache)
- Batch evaluation (check multiple flags at once)
- Fallback values (SDK continues if API down)
- Keep evaluation logic fast (<10ms)

---

## Decision 2: Database Choice

### Context
Need to store projects, environments, flags, and rules with relationships.

### Options Considered

**Option A: PostgreSQL (Relational)**
- SQL database with ACID guarantees
- Strong consistency
- Excellent for structured data with relationships

**Option B: MongoDB (Document)**
- NoSQL document store
- Flexible schema
- Good for nested data structures

**Option C: SQLite (Embedded)**
- Lightweight, file-based
- No separate server
- Simple setup

### Decision: **PostgreSQL**

### Reasoning

**Data Structure:**
- Clear relationships (Project → Environment → Flag → Rules)
- Foreign key constraints ensure data integrity
- Complex queries with JOINs

**Consistency Requirements:**
- Flag updates must be consistent
- Cannot have partial updates (ACID)
- Need transactions for complex operations

**Industry Standard:**
- Most companies use Postgres or similar
- Portfolio benefit: shows SQL skills
- Mature ecosystem (ORMs, tools, hosting)

**Performance:**
- Excellent indexing for fast reads
- Good caching support
- Handles millions of rows easily

### Trade-offs

**Pros:**
- ✅ Strong consistency (ACID)
- ✅ Relational integrity
- ✅ Rich query capabilities
- ✅ Battle-tested at scale
- ✅ Great tooling

**Cons:**
- ❌ Schema migrations required
- ❌ Slightly more complex setup than SQLite
- ❌ Less flexible than NoSQL

**Why Not MongoDB:**
- Don't need flexible schema
- Relational data fits SQL better
- Transactions are crucial
- SQL is more common in industry

**Why Not SQLite:**
- Cannot scale beyond single server
- No connection pooling
- Not suitable for production multi-user systems

---

## Decision 3: Caching Strategy

### Context
Flag evaluation must be fast (<50ms). Need caching to avoid database hits.

### Options Considered

**Option A: In-Memory Cache (Node.js)**
- Store flags in application memory
- Fastest possible (no network)
- Simple implementation

**Option B: Redis (Distributed Cache)**
- Separate cache server
- Shared across multiple app instances
- Persistent if configured

**Option C: Database Query Cache**
- Rely on PostgreSQL's query cache
- No additional infrastructure

**Option D: No Caching**
- Query database every time
- Simplest implementation

### Decision: **Redis (Distributed Cache)**

### Reasoning

**Performance:**
- Sub-millisecond access (<1ms)
- Much faster than database (10-50ms)
- Can handle millions of requests

**Scalability:**
- Shared cache across multiple API servers
- Horizontal scaling (read replicas)
- Handles traffic spikes

**Features:**
- Built-in TTL (automatic expiration)
- Pub/sub for cache invalidation
- Atomic operations
- Data structures (hashes, sets)

**Industry Standard:**
- Redis is ubiquitous in production systems
- Portfolio benefit: shows distributed systems knowledge
- Well-supported in all languages

### Caching Design

**Cache Key Structure:**
```
flags:{projectId}:{environmentId}
```

**Cached Data:**
```json
{
  "new_checkout": {
    "enabled": true,
    "percentage": 50,
    "userWhitelist": ["user123", "user456"],
    "userBlacklist": []
  }
}
```

**TTL:** 60 seconds (balance freshness vs. performance)

**Invalidation Strategy:**
- Invalidate on flag create/update/delete
- Specific environment only (not all)
- Use Redis pub/sub for multi-server invalidation

### Trade-offs

**Pros:**
- ✅ Extremely fast
- ✅ Horizontally scalable
- ✅ Industry standard
- ✅ Rich features

**Cons:**
- ❌ Additional service to manage
- ❌ Network latency (but only 1-2ms)
- ❌ Complexity (invalidation logic)
- ❌ Possible cache staleness

**Mitigation:**
- TTL ensures cache eventually updates
- Manual invalidation for immediate updates
- Monitoring cache hit rate
- Fallback to database if Redis fails

**Why Not In-Memory:**
- Doesn't work with multiple servers
- Cache not shared
- Lost on server restart

**Why Not Database Cache:**
- Not fast enough for our needs
- Limited control over caching

---

## Decision 4: Authentication Method

### Context
Dashboard needs user authentication. Public API needs authentication. Different security requirements.

### Options Considered

**Option A: Session-Based (Cookies)**
- Server stores session
- Cookie sent with each request
- Traditional web auth

**Option B: JWT (JSON Web Tokens)**
- Stateless tokens
- No server-side session storage
- Token contains user info

**Option C: OAuth 2.0**
- Third-party auth (Google, GitHub)
- More complex but better UX

### Decision: **JWT for Dashboard + API Keys for SDK**

### Reasoning

**Dashboard (JWT):**
- Stateless (no session storage needed)
- Works well with React SPA
- Easy to implement
- Can include user info in token

**SDK (API Keys):**
- Different security model (machines, not humans)
- Long-lived (don't expire frequently)
- Project+environment scoped
- Can be rotated

### JWT Design

**Token Contents:**
```json
{
  "userId": "123",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Expiry:** 7 days (refresh mechanism if needed)

**Storage:** LocalStorage (client-side)

### API Key Design

**Format:** `ffk_prod_a1b2c3d4e5f6...` (prefix identifies type)

**Generation:** Cryptographically random (32 bytes)

**Storage:** Hashed in database (like passwords)

**Scope:** Project + Environment

### Trade-offs

**JWT Pros:**
- ✅ Stateless (scales easily)
- ✅ No server-side storage
- ✅ Works with SPA
- ✅ Easy to implement

**JWT Cons:**
- ❌ Cannot revoke (until expiry)
- ❌ Token size larger than session ID
- ❌ Stored client-side (XSS risk)

**API Key Pros:**
- ✅ Long-lived
- ✅ Can be rotated
- ✅ Scoped permissions
- ✅ Perfect for SDK auth

**API Key Cons:**
- ❌ If leaked, valid until rotated
- ❌ Must be stored securely

**Mitigation:**
- Short JWT expiry (7 days)
- HTTPS only (prevent interception)
- API key rotation mechanism
- Rate limiting on both

---

## Decision 5: Evaluation Algorithm (Percentage Rollout)

### Context
Need deterministic percentage rollout (same user always gets same result).

### Options Considered

**Option A: Random Number**
```javascript
Math.random() < (percentage / 100)
```
- Simple but not deterministic
- User gets different results each time

**Option B: MD5 Hash**
```javascript
hash = md5(userId)
bucket = parseInt(hash.substring(0, 8), 16) % 100
return bucket < percentage
```
- Deterministic
- Widely used

**Option C: MurmurHash3**
```javascript
hash = murmur3(userId + flagKey)
bucket = hash % 100
return bucket < percentage
```
- Faster than MD5
- Deterministic
- Flag-specific (different flags get different distributions)

### Decision: **MurmurHash3 with Flag Key**

### Reasoning

**Determinism:**
- Same user always gets same result for a flag
- Critical for consistent UX
- User doesn't flip between variants

**Performance:**
- MurmurHash3 is fast (~1-2μs)
- MD5 is slower (~10μs)
- Matters at millions of evaluations

**Distribution:**
- Good uniform distribution
- No bias toward certain buckets
- Proven in production systems (LaunchDarkly uses it)

**Flag-Specific:**
- Hash includes flag key: `hash(userId + flagKey)`
- Same user gets different buckets for different flags
- Prevents correlation (user in 50% of all flags)

### Implementation

```javascript
function evaluatePercentageRollout(
  userId: string,
  flagKey: string,
  percentage: number
): boolean {
  // Combine user ID and flag key
  const input = `${userId}:${flagKey}`;
  
  // Hash to get number
  const hash = murmur3(input);
  
  // Get bucket 0-99
  const bucket = hash % 100;
  
  // Check if in rollout
  return bucket < percentage;
}
```

### Example
```
userId: "user123"
flagKey: "new_checkout"
percentage: 25

hash("user123:new_checkout") = 3847592
bucket = 3847592 % 100 = 92
92 < 25? No → user NOT in rollout

Next request (same user, same flag):
bucket = 92 (deterministic)
Result: Consistent
```

### Trade-offs

**Pros:**
- ✅ Deterministic (same input = same output)
- ✅ Fast (1-2μs)
- ✅ Good distribution
- ✅ Flag-specific buckets
- ✅ Battle-tested

**Cons:**
- ❌ Needs external library (murmurhash-js)
- ❌ Slightly more complex than MD5

**Why Not Random:**
- User experience would be terrible
- Cannot do proper A/B testing
- Violates basic requirement

**Why Not MD5:**
- Slower (10x)
- Overkill (cryptographic hash not needed)
- MurmurHash is industry standard for this

---

## Decision 6: API Design (REST vs GraphQL)

### Context
Need APIs for dashboard and SDK. Must decide on API style.

### Options Considered

**Option A: REST**
- Traditional HTTP endpoints
- `/api/v1/projects`, `/api/v1/flags`, etc.
- Simple, well-understood

**Option B: GraphQL**
- Single endpoint
- Client specifies desired fields
- Reduces over-fetching

**Option C: gRPC**
- Binary protocol
- High performance
- Steeper learning curve

### Decision: **REST**

### Reasoning

**Simplicity:**
- Easier to implement
- Easier to test (curl, Postman)
- Well-understood by everyone

**Tooling:**
- Great debugging tools
- Standard HTTP status codes
- Works with all clients

**Requirements:**
- Don't need GraphQL's flexibility
- API surface is relatively simple
- CRUD operations fit REST well

**Portfolio:**
- REST is more common in interviews
- Shows fundamental HTTP knowledge
- GraphQL can be added later

### API Structure

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login

GET    /api/v1/projects
POST   /api/v1/projects
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id

GET    /api/v1/projects/:id/environments
POST   /api/v1/projects/:id/environments

GET    /api/v1/projects/:projectId/environments/:envId/flags
POST   /api/v1/projects/:projectId/environments/:envId/flags
PUT    /api/v1/flags/:id
DELETE /api/v1/flags/:id

POST   /api/v1/evaluate (public API for SDK)
```

### Trade-offs

**Pros:**
- ✅ Simple to implement
- ✅ Easy to document
- ✅ Standard patterns
- ✅ Great tooling

**Cons:**
- ❌ Possible over-fetching
- ❌ Multiple requests for related data
- ❌ Versioning needed

**Why Not GraphQL:**
- Adds complexity
- Not needed for this use case
- Harder to cache
- Can add later if needed

---

## Decision 7: SDK Architecture

### Context
SDK will be used by client applications. Must decide on update strategy.

### Options Considered

**Option A: Polling (SDK fetches periodically)**
- SDK fetches flags every 30-60 seconds
- Simple to implement
- Some delay in updates

**Option B: WebSocket (Real-time)**
- Server pushes updates to SDK
- Instant updates
- More complex

**Option C: Server-Sent Events (SSE)**
- Server pushes updates
- Simpler than WebSocket
- HTTP-based

**Option D: Fetch Once (No updates)**
- SDK fetches flags once at startup
- No updates until restart
- Simplest

### Decision: **Polling (with manual refresh)**

### Reasoning

**Simplicity:**
- Easy to implement
- No persistent connections
- Works everywhere (no firewall issues)

**Good Enough:**
- 60-second delay acceptable for most use cases
- Emergency changes via manual refresh
- Or restart application

**Reliability:**
- No connection management
- No reconnection logic
- Fewer failure modes

**Phase 1 Focus:**
- Get MVP working first
- Can add WebSocket later if needed

### Implementation

```typescript
class FeatureFlagClient {
  private flags: Map<string, FlagConfig>;
  private intervalId?: NodeJS.Timer;
  
  async initialize() {
    await this.fetchFlags();
    this.startPolling();
  }
  
  private startPolling() {
    this.intervalId = setInterval(
      () => this.fetchFlags(),
      60000 // 60 seconds
    );
  }
  
  async refresh() {
    // Manual refresh for emergencies
    await this.fetchFlags();
  }
}
```

### Trade-offs

**Pros:**
- ✅ Simple implementation
- ✅ Reliable
- ✅ No connection management
- ✅ Works everywhere

**Cons:**
- ❌ Up to 60s delay in updates
- ❌ Unnecessary API calls if no changes
- ❌ Not real-time

**Mitigation:**
- Manual `refresh()` method for emergencies
- Dashboard can show "may take up to 60s to propagate"
- Can add WebSocket in Phase 2

---

## Future Considerations

### Not Decided Yet (Will revisit)

1. **Monitoring & Observability**
   - What metrics to track?
   - Which monitoring tool? (Prometheus, Datadog)
   - How to alert on issues?

2. **Testing Strategy**
   - Unit tests vs. integration tests?
   - Which testing framework? (Jest, Vitest)
   - E2E testing approach?

3. **Deployment**
   - Where to deploy? (Heroku, Render, AWS)
   - How to handle migrations?
   - Blue-green deployment?

4. **Audit Logging**
   - What to log?
   - How long to retain logs?
   - How to query logs?

These will be decided as we get to the relevant weeks.

---

## Summary of Decisions

| Decision | Choice | Key Reason |
|----------|--------|------------|
| Evaluation Location | Server-Side | Security + Flexibility |
| Database | PostgreSQL | ACID + Relationships |
| Caching | Redis | Distributed + Fast |
| Auth (Dashboard) | JWT | Stateless + SPA-friendly |
| Auth (SDK) | API Keys | Long-lived + Scoped |
| Rollout Algorithm | MurmurHash3 | Fast + Deterministic |
| API Style | REST | Simple + Standard |
| SDK Updates | Polling | Simple + Reliable |

---

## Lessons for Decision-Making

1. **Start simple:** Can always add complexity later
2. **Consider trade-offs:** No perfect solution
3. **Think production:** Not just "works on my machine"
4. **Use industry standards:** Proven solutions over custom
5. **Document reasoning:** Future you will thank you

---

**This document will evolve as the project progresses and new decisions are needed.**
