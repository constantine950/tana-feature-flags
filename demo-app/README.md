# Tana Feature Flags - Demo App

Live demo showing feature flags in action!

## Features

- 🌙 **Dark Mode** - Toggle entire theme
- 🛒 **New Checkout** - A/B test checkout button styles
- ⭐ **Premium Badge** - Show/hide premium status
- 🎉 **Discount Banner** - Toggle promotional banner

## Setup

```bash
# Install dependencies
npm install

# Add your API key
cp .env.example .env
# Edit .env with your API key

# Run
npm run dev
```

## How It Works

1. App loads flags on mount using SDK
2. Polls for updates every 10 seconds
3. UI automatically updates when flags change
4. Each user gets deterministic bucket assignment

## Testing

1. Run this app
2. Open Tana dashboard
3. Toggle flags on/off
4. Watch this app update automatically!

## User ID

Each session gets a random user ID like `demo_user_abc123`.

Refresh to get a new user (different rollout bucket).
