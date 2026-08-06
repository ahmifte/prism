# Contributing to Prism

Thanks for your interest in improving Prism!

## Getting started

```bash
pnpm install
pnpm build
pnpm test
```

Node 20+ and pnpm 9 are required (the repo pins `packageManager` so Corepack
picks the right version automatically).

## Making changes

- Keep the core estimator (`packages/core`) dependency-light and fully typed.
- Add or update tests in `packages/core/test` for any behavior change —
  `pnpm test` must pass.
- Pricing updates: edit `packages/core/src/catalog.ts`, bump `PRICING_AS_OF`,
  and link the provider pricing page in your PR description.

## Adding a model

1. Add a `ModelInfo` entry to `catalog.ts` with pricing in USD per 1M tokens.
2. Pick the closest `encoding` and a `tokenFactor` (see existing entries for
   how non-OpenAI tokenizers are approximated).
3. Add a test if the model introduces new behavior (e.g. unusual context or
   output limits).

## Reporting issues

Open a GitHub issue with a minimal reproduction. For wrong price estimates,
include the prompt, the model id, and the provider-reported cost.
