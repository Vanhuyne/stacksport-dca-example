# stacksport-dca-example

Worked examples for [`@stacksport/dca-sdk`](https://www.npmjs.com/package/@stacksport/dca-sdk) — the TypeScript SDK for [StacksPort](https://github.com/hms1499) DCA vaults on the Stacks blockchain.

[![CI](https://github.com/Vanhuyne/stacksport-dca-example/actions/workflows/ci.yml/badge.svg)](https://github.com/Vanhuyne/stacksport-dca-example/actions/workflows/ci.yml)
[![Examples](https://github.com/Vanhuyne/stacksport-dca-example/actions/workflows/examples-matrix.yml/badge.svg)](https://github.com/Vanhuyne/stacksport-dca-example/actions/workflows/examples-matrix.yml)
[![Integration](https://github.com/Vanhuyne/stacksport-dca-example/actions/workflows/integration.yml/badge.svg)](https://github.com/Vanhuyne/stacksport-dca-example/actions/workflows/integration.yml)
[![npm](https://img.shields.io/npm/v/@stacksport/dca-sdk.svg)](https://www.npmjs.com/package/@stacksport/dca-sdk)

## What is this?

A small repo showing, by working code, how to:

- Read DCA vault stats, user plans, and execution windows
- Format STX / sBTC amounts and block intervals
- Build tooling on top of the SDK without touching a wallet

Every example here runs read-only against Stacks mainnet via Hiro's public API.

## Try it in 60 seconds

```bash
git clone https://github.com/Vanhuyne/stacksport-dca-example
cd stacksport-dca-example/examples/01-cli
npm install
npm run build
node dist/index.js stats
```

Output:

```
Vault: stx-to-sbtc
  Total plans:    <n>
  Total executed: <n>
  Total volume:   <n> STX
```

## Examples

| # | Name | What it shows |
|---|---|---|
| [01-cli](examples/01-cli) | CLI inspector | `DCAVault.getStats / getPlan / getUserPlans / canExecute` |

More on the way: a Telegram bot that announces every DCA swap, and a minimal Next.js dashboard.

## Run the smoke tests

```bash
npm install
npm test
```

The smoke test verifies the SDK's exported surface and that its `Intervals` constants match the deployed contract.

## Run integration tests (hits mainnet)

```bash
npm run test:integration
```

These read live state from Stacks mainnet — no wallet, no signing.

## Related

- SDK source: https://github.com/hms1499/stacksport-dca-sdk
- Main app: https://github.com/hms1499 (StacksPort)

## License

MIT © Vanhuyne
