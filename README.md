# trifid-buyersellerapp

Next.js and TypeScript. The buyer and seller surfaces for TriFid (and, later, the field associate
app — `QR-029` is still open on whether that belongs here).

Business rules, the data model, the API contract and every decision behind this code live in the
SSOT (`trifid-docs` / `trifid-ssot`), not here. **All business logic lives in `trifid-serverapp`**
(`TD-010`) — this repository never adds a Next.js API route for a business endpoint.

## Setup

```bash
npm install
copy .env.example .env
```

`trifid-serverapp` must be running (`npm run dev` there) before this app can sign anyone in.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). An unregistered mobile number lands on a
"registration coming soon" placeholder — full registration content is M3.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`.
- `npm run lint` / `npm run format` / `npm run format:check` — ESLint / Prettier.
- `npm run typecheck` (alias `type-check`).
- `npm test` — Vitest + React Testing Library.

## Layout

`src/app` one folder per route (`login`, `register`, `pending`, `buyer`, `seller`) — plain folder
routes rather than Next.js route groups, so the URL structure stays obvious to read · `src/lib` the
API client, the copied DTOs and error codes, the EN/हिंदी dictionary, the device fingerprint ·
`src/providers` `SessionProvider` (counterparty auth) and `LocaleProvider` · `src/components`
`Gate` (the `ST-10` pending/rejected screen logic) and the locale toggle.

**Known gap (`QR-035`):** the session brief's 150 KB gzipped first-load budget is not met — Next.js
16 / React 19's own shared runtime already gzips to roughly 166 KB before any page code. See
`QUESTION_REGISTER.md`.
