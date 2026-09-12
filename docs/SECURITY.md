# WORLD//26 Security Architecture & Hardening

## 1. Zero-Trust Client Model

1. **No Code Execution (`eval` Ban):**  
   User scenarios, policy definitions, and parameter overrides are strictly parsed through strongly-typed Zod schemas (`packages/schemas`). No raw user strings are evaluated as code or expressions.
2. **Zero Secrets in Client Bundles:**  
   The application runs 100% client-first. No service-role keys, database passwords, or private environment variables are bundled into client assets.
3. **No Dynamic Runtime HTTP Dependencies:**  
   Simulation runs do not make external HTTP network calls. All models, historical series, and planetary boundaries are statically compiled and cryptographically verified at build time.

---

## 2. Cloud Persistence & Supabase Hardening (Optional)

When optional cloud persistence is configured, the database architecture enforces multi-tenant security:

### Row-Level Security (RLS) Policy Architecture
- **`profiles`:** Users may only read and modify their own profile record (`auth.uid() = user_id`).
- **`scenarios`:**
  - Private user scenarios: readable and writable only by workspace members (`workspace_id IN (SELECT user_workspaces)`).
  - Public shared simulations: accessed via immutable, unguessable cryptographic tokens (`share_token`).
- **Public Write Prohibition:** Public anonymous users cannot insert, update, or delete records in persistent collections.

---

## 3. Dependency & CI Security

- **Software Bill of Materials (SBOM):** Pinned dependencies via `pnpm-lock.yaml` and `Cargo.lock`.
- **CI Dependency Auditing:** GitHub Actions runs automated security scans on every pull request.
- **Content Security Policy (CSP):** Next.js headers restrict script execution to self, disabling `unsafe-eval` and unauthorized script domains.
