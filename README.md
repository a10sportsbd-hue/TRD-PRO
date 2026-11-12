# TRD Pro

**Trade Smarter. Analyze Deeper.**

TRD Pro is a market-analysis and decision-support application. The current implementation includes a responsive React + TypeScript dashboard, verified Binance Spot market data, technical indicators, a gated research engine, and a manual risk calculator.

## Current implementation

- Binance Spot public REST klines and WebSocket updates for BTC, ETH, SOL, BNB and XRP.
- Candlestick chart with selectable intervals.
- EMA 20/50, RSI 14, MACD, Bollinger Bands and ATR.
- Validated market-structure observations and a deterministic confluence research evaluator.
- Manual position sizing, risk budget, target-R, fee and slippage calculator.
- Automated unit tests and TypeScript/Vite build in GitHub Actions.
- Capacitor Android wrapper configuration and automated Android Debug APK workflow.

## Build locally

Requirements: Node.js 20+, npm, and Java 17 + Android SDK for Android packaging.

```bash
npm install
npm test
npm run build
```

## Build Android APK

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

Every push to `main` runs the web tests/build and the Android Debug APK workflow. Download the generated `TRD-Pro-Android-debug` artifact from the successful GitHub Actions run. The artifact is a debug build, not a Play Store release-signed APK.

## Data integrity

- Never fabricate, interpolate, or relabel sample data as live market data.
- If a verified feed is unavailable, show NO DATA / NO SIGNAL.
- OTC is unsupported until an authorized, verifiable provider is integrated. No official Quotex API/feed is claimed.
- Strategy confluence is a rule count, not win probability or a profitability claim.
- Risk calculations are estimates and do not place orders.

## Security and limitations

No exchange account API keys are required for public Binance Spot market data. Do not commit secrets. The app is analysis-only and does not execute broker orders. The risk calculator requires user-entered hypothetical account and trade values; it does not connect to a wallet or brokerage account.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

## Disclaimer

TRD Pro is analytical software, not financial advice. Trading involves substantial risk, including loss of capital. Users must independently verify all information and decisions.
