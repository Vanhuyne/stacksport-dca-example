# `01-cli` — StacksPort DCA CLI

Minimal read-only CLI that uses [`@stacksport/dca-sdk`](https://www.npmjs.com/package/@stacksport/dca-sdk) to inspect DCA vaults on Stacks mainnet. No wallet needed — everything goes through Hiro's public API.

## Install

```bash
cd examples/01-cli
npm install
npm run build
```

## Commands

```bash
# Global stats for a vault
node dist/index.js stats
node dist/index.js stats sbtc-to-usdcx

# Check if a plan is due
node dist/index.js can-execute 42

# Inspect a single plan
node dist/index.js plan 42

# List all plans for a user
node dist/index.js user SP2CMK69QNY60HBG8BJ4X5TD7XX2ZT4XB62V13SV
```

## What it demonstrates

- Creating a `DCAVault` instance for each preset
- Reading global stats, individual plans, and user plan lists
- Formatting amounts with `microToSTX` / `satsToBTC`
- Converting interval blocks to labels with `blocksToLabel`

See `src/index.ts` for the full source — ~120 lines, no magic.
