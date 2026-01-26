# Tana - Feature Flag Service

<div align="center">

![Tana Logo](https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=TANA)

**Production-grade feature flag service built in 30 days**

[Documentation](./docs) • [Backend](./backend) • [SDK](./sdk) • [Dashboard](./dashboard)

</div>

---

## 🎯 What is Tana?

Tana is a lightweight, production-ready feature flag service that enables development teams to:

- 🚀 **Deploy with confidence** - Release features that are "off" by default
- 🎛️ **Control releases** - Progressive rollouts from 5% to 100%
- 🎯 **Target users** - Enable features for specific users or segments
- ⚡ **React instantly** - Toggle features on/off without redeployment
- 🔒 **Stay secure** - Server-side evaluation keeps rules private

Built as a portfolio project to demonstrate production engineering skills.

---

## ✨ Features

### Core Capabilities
- ✅ **Multi-environment support** - Separate flags for dev, staging, production
- ✅ **Percentage rollouts** - Gradual release with deterministic bucketing
- ✅ **User targeting** - Whitelist/blacklist specific users
- ✅ **Fast evaluation** - Sub-50ms response time with Redis caching
- ✅ **Developer SDK** - Simple JavaScript/TypeScript integration
- ✅ **Admin dashboard** - Intuitive UI for managing flags
- ✅ **Multi-tenancy** - Project isolation for different applications
- ✅ **API authentication** - JWT for dashboard, API keys for SDK

### Technical Highlights
- **Server-side evaluation** for security and flexibility
- **Deterministic hashing** (MurmurHash3) for consistent rollouts
- **Redis caching** for performance at scale
- **PostgreSQL** for ACID compliance and data integrity
- **TypeScript** for type safety across the stack
- **React + Tailwind** for modern UI

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Client App     │
│  (Your Code)    │
└────────┬────────┘
         │ @tana/sdk
         ↓
┌─────────────────────────────┐
│   Tana API Server           │
├─────────────────────────────┤
│  • Evaluation API           │
│  • Management API           │
│  • Redis Cache Layer        │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────┐
│ Redis  │ │PostgreSQL│
└────────┘ └──────────┘

┌──────────────────┐
│ Admin Dashboard  │
│   (React SPA)    │
└──────────────────┘
```

**Flow:**
1. Client app initializes Tana SDK with API key
2. SDK fetches flag configurations from API
3. App checks flags: `tana.isEnabled('new-feature', userId)`
4. SDK evaluates locally with cached config (or calls API)
5. Admins manage flags via dashboard

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/tana-feature-flags.git
cd tana-feature-flags

# Install all dependencies
npm run install:all
```

### 2. Setup Database

```bash
# Create database
createdb tana_flags

# Run migrations
cd backend
npm run migrate
```

### 3. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Dashboard
cd dashboard
cp .env.example .env
```

### 4. Start Services

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Dashboard
cd dashboard
npm run dev

# Terminal 3 - Redis (if not running)
redis-server
```

### 5. Create Your First Flag

1. Open http://localhost:5173 (dashboard)
2. Register an account
3. Create a project
4. Create a flag
5. Get API key from settings

### 6. Use in Your App

```bash
npm install @tana/feature-flags-sdk
```

```javascript
import { TanaClient } from '@tana/feature-flags-sdk';

const tana = new TanaClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

await tana.initialize();

// Check feature flags
if (tana.isEnabled('new-checkout', userId)) {
  // Show new checkout flow
} else {
  // Show old checkout flow
}
```

---

## 📚 Documentation

- [Product Requirements](./docs/PRD.md)
- [Technical Decisions](./docs/TECHNICAL_DECISIONS.md)
- [User Personas](./docs/PERSONAS.md)
- [Feature List](./docs/FEATURES.md)
- [API Documentation](./docs/API.md) *(coming soon)*
- [SDK Documentation](./sdk/README.md) *(coming soon)*

---

## 🗂️ Project Structure

```
tana-feature-flags/
├── docs/                    # Documentation
│   ├── PRD.md
│   ├── TECHNICAL_DECISIONS.md
│   └── ...
├── backend/                 # Node.js + TypeScript API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Express middleware
│   └── migrations/         # Database migrations
├── sdk/                     # JavaScript SDK
│   ├── src/
│   └── examples/
├── dashboard/               # React admin UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
└── demo-app/               # Example integration
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# SDK tests
cd sdk
npm test

# E2E tests
npm run test:e2e
```

---

## 🚢 Deployment

### Docker

```bash
docker-compose up -d
```

### Manual Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions on deploying to:
- Heroku
- Render
- Railway
- AWS EC2
- DigitalOcean

---

## 🎯 Use Cases

### 1. Canary Release
```javascript
// Deploy new API version behind flag
if (tana.isEnabled('api-v2', userId)) {
  return apiV2.processPayment(data);
} else {
  return apiV1.processPayment(data);
}

// In dashboard: Set rollout to 5%, monitor metrics
// If stable: Increase to 25%, 50%, 100%
// If issues: Toggle off immediately
```

### 2. A/B Testing
```javascript
// Test two different UIs
const variant = tana.getVariant('checkout-redesign', userId);

if (variant === 'new') {
  return <NewCheckoutFlow />;
} else {
  return <OldCheckoutFlow />;
}
```

### 3. Emergency Kill Switch
```javascript
// Expensive feature that can be disabled under load
if (tana.isEnabled('ai-recommendations', userId)) {
  const recommendations = await ai.getRecommendations(userId);
  return recommendations;
}
// If system overloaded: Toggle off via dashboard (5 seconds)
```

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL (with pg)
- Redis (ioredis)
- JWT authentication
- bcrypt for password hashing

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

**SDK:**
- TypeScript
- Zero dependencies core
- Axios for HTTP

**Infrastructure:**
- Docker
- PostgreSQL 15
- Redis 7

---

## 📊 Performance

- **Evaluation latency:** <50ms p95
- **Cache hit rate:** >95%
- **API throughput:** 1000+ req/sec (single instance)
- **Database queries:** <10ms average

---

## 🔒 Security

- ✅ JWT tokens with expiry
- ✅ API keys hashed in database
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on public endpoints
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ Environment-based secrets

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Weeks 1-4)
- [x] Core flag evaluation
- [x] Admin dashboard
- [x] JavaScript SDK
- [x] Percentage rollouts
- [x] User targeting

### 🚧 Phase 2: Enhancement (Weeks 5-8)
- [ ] Audit logs
- [ ] Advanced targeting rules
- [ ] Flag dependencies
- [ ] Webhooks
- [ ] Analytics dashboard

### 📅 Phase 3: Scale (Weeks 9-12)
- [ ] Multiple SDKs (Python, Go)
- [ ] Real-time updates (WebSocket)
- [ ] Advanced analytics
- [ ] Team permissions
- [ ] Enterprise features

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

**Your Name**

- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourname)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Inspired by LaunchDarkly, Flagsmith, and Unleash
- Built as part of a 30-day portfolio project challenge
- Special thanks to the feature flag community

---

## 📖 Blog Posts

- [Building Tana: Day 1 - Product Thinking](https://yourblog.com/tana-day-1)
- [Implementing Deterministic Percentage Rollouts](https://yourblog.com/deterministic-rollouts)
- [Feature Flags: Server-Side vs Client-Side Evaluation](https://yourblog.com/flag-evaluation)

---

<div align="center">

**Built with ❤️ to demonstrate production engineering skills**

[⬆ Back to Top](#tana---feature-flag-service)

</div>
