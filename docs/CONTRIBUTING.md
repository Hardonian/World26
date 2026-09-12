# Contributing to WORLD//26

Thank you for your interest in contributing to **WORLD//26: An Open Planetary Systems Simulator**!

## 1. Scientific & Ethical Guidelines

1. **No Scientific Theatre:** Every new parameter or equation must include documented provenance, confidence bounds, and units. Never fabricate precision or inject ungrounded scalar multipliers.
2. **Clean-Room License Compliance:** Code must be implemented cleanly from published scientific papers and mathematical equations. Copying GPL, AGPL, or non-commercially restricted source code directly into this Apache-2.0 repository is strictly prohibited. See `docs/THIRD_PARTY.md` and `docs/LICENSE-REVIEW.md`.
3. **Mandatory Disclaimers:** Maintain the project's intellectual independence disclaimer:
   > *"Independent research and scenario-exploration software. Not affiliated with or endorsed by the Club of Rome or the original World3/Earth4All authors."*

---

## 2. Local Development Workflow

```bash
# Clone the repository
git clone https://github.com/Hardonian/World26.git
cd World26

# Install dependencies
pnpm install

# Start development dev server
pnpm dev

# Run all test suites
pnpm test
cargo test --all

# Run code formatters and linters
pnpm lint
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
```

---

## 3. Pull Request Checklist

Before submitting a pull request, verify:
- [ ] `cargo test --all` passes with 0 failures.
- [ ] `cargo clippy --all-targets --all-features -- -D warnings` produces 0 warnings.
- [ ] `pnpm test` passes all TypeScript test suites.
- [ ] `pnpm data:validate` and `pnpm model:validate` pass.
- [ ] `pnpm build` compiles successfully.
- [ ] Any added datasets include provenance records adhering to `ParameterProvenanceSchema`.
