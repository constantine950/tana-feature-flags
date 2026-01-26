# 🚀 Tana Feature Flags - Getting Started

Welcome to Tana! This guide will get you up and running in 10 minutes.

## 📦 What's Included

This package contains:
- Complete project structure
- All configuration files
- Day 1 documentation
- Database schema
- Docker setup
- Example code

## ⚡ Quick Start (Choose One)

### Option A: Docker (Easiest - 2 minutes)

```bash
# 1. Start everything
docker-compose up -d

# 2. Wait 30 seconds for services to start

# 3. Run migrations
docker-compose exec backend npm run migrate

# 4. Open your browser
# Dashboard: http://localhost:5173
# API: http://localhost:3000
```

### Option B: Manual (Full Control - 10 minutes)

```bash
# 1. Install dependencies
npm run install:all

# 2. Start PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
createdb tana_flags

# 3. Start Redis
# Mac: brew services start redis
# Linux: sudo systemctl start redis

# 4. Configure environment
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env
# Edit backend/.env with your database credentials

# 5. Run migrations
npm run migrate

# 6. Start services (opens 2 terminals)
npm run dev
```

## 📁 Project Structure

```
tana-feature-flags/
├── 📄 README.md              ← Start here
├── 📄 SETUP.md               ← Detailed setup guide
├── 📄 DAY1_COMPLETE.md       ← What you've accomplished
│
├── 📁 docs/                   ← Day 1 deliverables
│   ├── PRD.md                ← Product requirements
│   ├── FEATURES.md           ← Complete feature list
│   ├── PERSONAS.md           ← User personas
│   └── TECHNICAL_DECISIONS.md ← Architecture choices
│
├── 📁 backend/                ← Node.js API
│   ├── src/                  ← Source code (to be built)
│   ├── migrations/           ← Database schema
│   ├── package.json          ← Dependencies
│   └── .env.example          ← Config template
│
├── 📁 sdk/                    ← JavaScript SDK
│   ├── src/                  ← SDK source (to be built)
│   └── package.json
│
├── 📁 dashboard/              ← React admin UI
│   ├── src/                  ← UI source (to be built)
│   └── package.json
│
└── 📁 docker/                 ← Docker configs
    └── docker-compose.yml    ← One-command setup
```

## ✅ First Steps

### 1. Read the Documentation (15 minutes)

**Must Read:**
- [ ] `README.md` - Project overview
- [ ] `docs/PRD.md` - What you're building
- [ ] `docs/TECHNICAL_DECISIONS.md` - Why key choices were made

**Good to Read:**
- [ ] `docs/PERSONAS.md` - Who will use this
- [ ] `docs/FEATURES.md` - Complete feature list
- [ ] `SETUP.md` - Detailed setup instructions

### 2. Verify Setup (5 minutes)

```bash
# Check API health
curl http://localhost:3000/health

# Should return:
# {"status":"ok","database":"connected","redis":"connected"}

# Open dashboard
# Navigate to: http://localhost:5173
```

### 3. Create Your First Flag (5 minutes)

1. **Register Account**
   - Open http://localhost:5173
   - Click "Register"
   - Create account

2. **Create Project**
   - Click "New Project"
   - Name: "My App"
   - Description: "My first project"

3. **Add Environment**
   - Select project
   - Click "Add Environment"
   - Name: "production"
   - Copy API key (save it!)

4. **Create Flag**
   - Click "New Flag"
   - Key: `new_feature`
   - Name: "New Feature"
   - Enable toggle

5. **Test Flag**
   - Use SDK (see below)

## 🔧 Using the SDK

### Install

```bash
npm install @tana/feature-flags-sdk
```

### Basic Example

```javascript
import { TanaClient } from '@tana/feature-flags-sdk';

// Initialize
const tana = new TanaClient({
  apiKey: 'your_api_key_from_dashboard',
  environment: 'production'
});

await tana.initialize();

// Check flag
const userId = 'user_123';
if (tana.isEnabled('new_feature', userId)) {
  console.log('New feature enabled!');
} else {
  console.log('Old feature');
}
```

### React Example

```jsx
import { TanaClient } from '@tana/feature-flags-sdk';
import { useState, useEffect } from 'react';

function App() {
  const [showNewUI, setShowNewUI] = useState(false);

  useEffect(() => {
    const tana = new TanaClient({
      apiKey: 'your_api_key',
      environment: 'production'
    });

    tana.initialize().then(() => {
      const enabled = tana.isEnabled('new_ui', userId);
      setShowNewUI(enabled);
    });
  }, []);

  return showNewUI ? <NewUI /> : <OldUI />;
}
```

## 🎯 Your 30-Day Plan

### Week 1: Backend (Days 1-7)
- ✅ Day 1: Product thinking (DONE!)
- [ ] Day 2: Architecture design
- [ ] Day 3: Database schema
- [ ] Day 4: Backend setup
- [ ] Day 5: Auth system
- [ ] Day 6: Project/Environment APIs
- [ ] Day 7: Review & refactor

### Week 2: Core Features (Days 8-14)
- [ ] Day 8-10: Flag evaluation engine
- [ ] Day 11-12: Caching with Redis
- [ ] Day 13-14: SDK implementation

### Week 3: Dashboard (Days 15-21)
- [ ] Day 15-18: React UI components
- [ ] Day 19-20: UX polish
- [ ] Day 21: End-to-end testing

### Week 4: Polish (Days 22-30)
- [ ] Day 22-24: Performance & security
- [ ] Day 25-27: Documentation & demo
- [ ] Day 28-30: Video demo & portfolio

## 📚 Learning Resources

### Essential Reading
- [Feature Toggles by Martin Fowler](https://martinfowler.com/articles/feature-toggles.html)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)

### Reference Documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)

### Similar Projects (Study These)
- LaunchDarkly (commercial)
- Flagsmith (open source)
- Unleash (open source)

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9
# Or change port in backend/.env
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection
psql tana_flags
```

### "Redis connection failed"
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### "Module not found" errors
```bash
# Reinstall dependencies
npm run clean
npm run install:all
```

## 🎓 Pro Tips

### Daily Workflow
```bash
# Start of day
git pull
npm run dev

# During development
# Code in your editor
# Test in browser/Postman

# End of day
git add .
git commit -m "Day X: What you did"
git tag day-X
```

### Testing as You Build
```bash
# API testing
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Or use Postman/Insomnia
```

### Debugging
```bash
# Enable debug logs
LOG_LEVEL=debug npm run dev:backend

# Check database
psql tana_flags
SELECT * FROM users;

# Check Redis cache
redis-cli
KEYS *
```

## 🌟 What Makes This Special

This isn't just a tutorial project. It demonstrates:

✅ **Production Thinking**
- Server-side evaluation for security
- Deterministic hashing for consistency
- Redis caching for performance
- Multi-tenancy from day 1

✅ **Clean Architecture**
- Documented technical decisions
- Trade-offs clearly explained
- Scalability considered

✅ **Portfolio Quality**
- Professional README
- Comprehensive documentation
- Working demo
- Deployment ready

## 🎯 Success Criteria

By the end of 30 days, you'll have:

- [ ] Working feature flag service
- [ ] Admin dashboard (React)
- [ ] JavaScript SDK
- [ ] Complete documentation
- [ ] Demo video
- [ ] Portfolio-ready project

**And you'll be able to explain:**
- Why server-side evaluation?
- How does deterministic hashing work?
- Why Redis over in-memory cache?
- How would this scale to 1M users?
- What would you build next?

## 💪 You've Got This!

You're starting with:
- ✅ Clear requirements
- ✅ Defined architecture
- ✅ Complete setup
- ✅ Solid foundation

Most developers skip the planning. You didn't.

**This is why you'll succeed.** 🚀

## 🆘 Need Help?

- 📖 Check `/docs` for detailed guides
- 🐛 Review troubleshooting in `SETUP.md`
- 💬 Create issues on GitHub
- 🤔 Review technical decisions again

## 📝 Next Step

**Right now:** Read `docs/PRD.md` to understand what you're building

**Tomorrow (Day 2):** Architecture design - draw the system!

---

<div align="center">

**Built with 💙 to showcase engineering excellence**

[⬆ Back to Top](#-tana-feature-flags---getting-started)

</div>
