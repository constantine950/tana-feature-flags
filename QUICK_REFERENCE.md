# Tana Quick Reference

## 🚀 Quick Commands

### Setup
```bash
# Extract project
tar -xzf tana-feature-flags.tar.gz
cd tana-feature-flags

# Option 1: Docker (easiest)
docker-compose up -d
docker-compose exec backend npm run migrate

# Option 2: Manual
npm run install:all
createdb tana_flags
npm run migrate
npm run dev
```

### Daily Development
```bash
npm run dev              # Start both backend + dashboard
npm run dev:backend      # Backend only
npm run dev:dashboard    # Dashboard only
npm run migrate          # Run database migrations
npm test                 # Run all tests
npm run docker:up        # Start Docker services
```

## 📍 Important URLs

- Dashboard: http://localhost:5173
- API: http://localhost:3000
- API Health: http://localhost:3000/health
- Database: postgresql://localhost:5432/tana_flags
- Redis: redis://localhost:6379

## 🗂️ Key Files

```
docs/PRD.md                    - What you're building
docs/TECHNICAL_DECISIONS.md   - Why you made choices
docs/FEATURES.md               - Complete feature list
backend/.env.example           - Backend config template
backend/migrations/            - Database schema
GETTING_STARTED.md             - Detailed guide
SETUP.md                       - Installation help
```

## 🎯 30-Day Timeline

- **Week 1** (Days 1-7): Backend foundations
- **Week 2** (Days 8-14): Core flag logic
- **Week 3** (Days 15-21): Dashboard UI
- **Week 4** (Days 22-30): Testing & polish

## 🔑 Key Concepts

### Feature Flag
Runtime toggle to enable/disable code without deployment

### Percentage Rollout
Gradually release to 5% → 25% → 50% → 100% of users

### Deterministic Hashing
Same user always gets same result (MurmurHash3)

### Server-Side Evaluation
Rules evaluated on server (not exposed to client)

## 🏗️ Architecture

```
Client App → SDK → API → Redis Cache → PostgreSQL
                    ↑
              Dashboard UI
```

## 📦 Tech Stack

- **Backend:** Node.js, TypeScript, Express
- **Database:** PostgreSQL
- **Cache:** Redis
- **Frontend:** React, Tailwind CSS
- **SDK:** TypeScript

## 🐛 Quick Fixes

```bash
# Port in use
lsof -ti:3000 | xargs kill -9

# Database connection failed
pg_isready
psql tana_flags

# Redis connection failed
redis-cli ping

# Clear everything and restart
npm run clean
npm run install:all
```

## 📝 SDK Usage

```javascript
import { TanaClient } from '@tana/feature-flags-sdk';

const tana = new TanaClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

await tana.initialize();

if (tana.isEnabled('new_feature', userId)) {
  // New code
} else {
  // Old code
}
```

## 🎓 Interview Talking Points

**"Why server-side evaluation?"**
→ Security (rules private), flexibility (change logic), consistency

**"How does deterministic rollout work?"**
→ Hash(userId + flagKey) % 100 < percentage

**"Why Redis?"**
→ Distributed cache, sub-millisecond, built-in TTL

**"How would this scale?"**
→ Horizontal scaling (stateless API), Redis cluster, read replicas

## 🌟 Portfolio Highlights

- ✅ Production-ready architecture
- ✅ Documented technical decisions
- ✅ Multi-tenancy from day 1
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Clean, tested code

## 💡 Day 2 Preview

Tomorrow you'll create:
- System architecture diagram
- Complete API specification
- Component interaction flows
- Deployment architecture

## 📚 Must-Read Docs

1. `docs/PRD.md` - Product requirements
2. `GETTING_STARTED.md` - Setup guide
3. `docs/TECHNICAL_DECISIONS.md` - Architecture

---

**Save this card! You'll reference it constantly.** 📌
