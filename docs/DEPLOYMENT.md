# WORLD//26 Production Deployment Guide

## 1. Prerequisites

- **Node.js:** `>= 20.0.0` (LTS recommended)
- **pnpm:** `>= 9.0.0` (tested with v11.8.0)
- **Rust toolchain:** `>= 1.80.0` with `wasm32-unknown-unknown` target (for compiling `sim-core` and `sim-wasm`)

---

## 2. Standard Production Build

```bash
# 1. Install all dependencies
pnpm install

# 2. Run data and model validation suites
pnpm data:validate
pnpm model:validate

# 3. Execute all unit and system dynamics tests
pnpm test
cargo test --all

# 4. Build all packages and the Next.js production bundle
pnpm build
```

---

## 3. Hosting Options

### Option A: Vercel (Recommended for Next.js)
1. Link your repository in Vercel.
2. Build command: `pnpm build`
3. Output directory: default Next.js output.
4. Framework preset: **Next.js**.

### Option B: Docker Container
```dockerfile
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3000
CMD ["node", "./apps/web/node_modules/next/dist/bin/next", "start", "./apps/web"]
```

---

## 4. Environment Variables (Optional)

The application functions 100% locally out-of-the-box without any environment variables. The following variables may be configured to enable cloud persistence:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint for cloud persistence | *(empty, uses localStorage)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous API key | *(empty, uses localStorage)* |
| `NEXT_PUBLIC_APP_URL` | Base URL for shareable permalinks | `http://localhost:3000` |
