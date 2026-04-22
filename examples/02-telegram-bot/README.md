# `02-telegram-bot` — DCA Execution Announcer

A minimal Telegram bot that polls StacksPort DCA vaults and posts when new executions happen. Uses [`@stacksport/dca-sdk`](https://www.npmjs.com/package/@stacksport/dca-sdk) for vault reads and plain `fetch` for Telegram — no extra deps.

## Run locally

```bash
cd examples/02-telegram-bot
npm install
npm run build
```

### Dry-run (no tokens needed)

Polls mainnet twice and prints what it *would* send:

```bash
npm run dry-run
```

Useful for CI and for eyeballing the message shape.

### Live mode

```bash
export TELEGRAM_BOT_TOKEN="123456:ABC..."
export TELEGRAM_CHAT_ID="-100123456789"
export POLL_INTERVAL_SEC=120
npm start
```

The bot polls both `stx-to-sbtc` and `sbtc-to-usdcx` vaults. When `totalExecuted` increases between polls, it sends a Markdown-formatted message to the chat.

## Environment

| Var | Required | Default | Notes |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | live mode | — | Get from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID`   | live mode | — | Use [@userinfobot](https://t.me/userinfobot) |
| `POLL_INTERVAL_SEC`  | no        | `120` | Min 30 (Hiro rate limits) |
| `HIRO_API_URL`       | no        | `https://api.hiro.so` | |

## What it demonstrates

- `DCAVault.getStats()` as a polling source of truth
- Storing previous stats in memory to compute deltas
- Clean separation of `dry-run` and `run` modes — the same code paths execute in CI
- Zero-dep Telegram integration via `fetch`

~120 lines in `src/index.ts`.
