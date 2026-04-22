# `03-next-dashboard` — Live DCA dashboard

A minimal Next.js 15 page that reads both StacksPort DCA vaults server-side via React Server Components. No API routes, no client-side wallet, no external state — one file of page logic.

## Run locally

```bash
cd examples/03-next-dashboard
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## What it demonstrates

- Calling `@stacksport/dca-sdk` from a **Server Component** (`src/app/page.tsx`) — keeps the SDK out of the client bundle
- `export const revalidate = 60` for ISR-style freshness without per-request Hiro calls
- Zero external UI deps — just plain CSS, ~70 lines

## Deploying

Works out of the box on Vercel:

```bash
npx vercel
```

No env vars needed — all reads go to Hiro's public API.
