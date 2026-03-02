# Tana Feature Flags

**Production-grade feature flag service built with Node.js, React, and PostgreSQL**

Control feature releases, progressive rollouts, and user targeting without redeployment.

---

## Features

- 🎯 **Progressive Rollouts** - 0% to 100% with deterministic bucketing
- 👥 **User Targeting** - Whitelist/blacklist specific users
- 🌍 **Multi-Environment** - Separate flags for dev/staging/prod
- ⚡ **Fast** - <50ms evaluation with Redis caching
- 🔒 **Secure** - Server-side evaluation, API key authentication
- 📊 **Analytics** - Track evaluations and changes

---

## Quick Start

### 1. Setup

```bash
# Clone and install
git clone https://github.com/constantine950/tana-feature-flags.git
cd tana-feature-flags

# Start with Docker
docker-compose up -d

# Run migrations
cd backend && npm run migrate
```

### 2. Dashboard

Open http://localhost:5173

- Register an account
- Create a project
- Create an environment
- Get your API key

### 3. Use in Your App

```bash
npm install @tana/feature-flags-sdk
```

```javascript
import { TanaClient } from "@tana/feature-flags-sdk";

const client = new TanaClient({
  apiKey: "your_api_key",
});

if (await client.isEnabled("new-feature", userId)) {
  // Show new feature
}
```

---

## Architecture

```
Client App → SDK → API Server → PostgreSQL
                ↓
              Redis Cache
```

- **Backend:** Node.js + TypeScript + Express
- **Database:** PostgreSQL + Redis
- **Frontend:** React + Tailwind CSS
- **SDK:** TypeScript with zero dependencies

---

## Use Cases

**Canary Releases:** Roll out to 5%, monitor, increase gradually  
**Kill Switch:** Disable expensive features under load  
**A/B Testing:** Show different variants to different users  
**Beta Features:** Enable for specific users only

---

## Project Structure

```
├── backend/          # Node.js API
├── dashboard/        # React admin UI
├── sdk/             # JavaScript SDK
├── demo-app/        # Example integration
```

---

## Tech Stack

**Backend:** Node.js • TypeScript • Express • PostgreSQL • Redis  
**Frontend:** React • Vite • Tailwind CSS  
**DevOps:** Docker • Docker Compose

---

## Performance

- Evaluation: <50ms p95
- Cache hit rate: >95%
- Throughput: 1000+ req/sec

---

## License

MIT License - See [LICENSE](LICENSE) file
