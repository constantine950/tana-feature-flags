# Tana Demo App - Vite

Live feature flag demo app.

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Update `.env` with your API key:**

```bash
VITE_TANA_API_KEY=ffk_dev_your_actual_key_here
```

3. **Make sure backend is running:**

```bash
cd ../backend
npm run dev
```

4. **Run demo app:**

```bash
npm run dev
```

Open http://localhost:5174

## How It Works

- Polls for flag updates every 5 seconds
- Dark mode toggles entire theme
- New checkout shows gradient buttons
- Premium badge appears when enabled
- Discount banner shows when enabled

## Testing

1. Go to dashboard (http://localhost:5173)
2. Toggle any flag on/off
3. Wait 5 seconds
4. Watch demo app update automatically! ✨

## Features

- 🌙 Dark Mode
- 🛒 New Checkout
- ⭐ Premium Badge
- 🎉 Discount Banner
