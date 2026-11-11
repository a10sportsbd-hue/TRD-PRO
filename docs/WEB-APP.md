# Web App Development

## Requirements
- Node.js 20+
- npm 10+

## Run locally
```bash
npm install
npm run dev
```

Vite prints the local development URL (normally http://localhost:5173).

## Validate
```bash
npm run typecheck
npm run build
npm run preview
```

## Current implementation status
- React + TypeScript + Vite scaffold: committed
- Responsive trading dashboard shell: committed
- Verified live market adapters: not implemented
- Candlestick rendering from real feed: not implemented
- Strategy/signal engine: not implemented
- OTC provider: not selected or verified

The dashboard deliberately contains no fabricated price series, candles, performance figures, or actionable signals. Keep that behavior until a provider adapter passes source, timestamp, freshness, schema, and instrument validation.
