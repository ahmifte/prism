# Prism

[![CI](https://github.com/hermedion/prism/actions/workflows/ci.yml/badge.svg)](https://github.com/hermedion/prism/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Know what an LLM call costs before you make it.**

Prism is Hermedion's open-source LLM cost engine. Point it at a prompt and it
tokenizes the input, prices it against a cross-provider model catalog, and
ranks every model by estimated cost — *before* a single token is sent. It is
the first building block of a gateway focused on the two things existing
routers treat as afterthoughts: **upfront price estimation** and
**observability**.

## Why

Routers like OpenRouter tell you what a request cost after the money is spent.
Prism inverts that:

- **Estimate first.** Per-model input/output cost for your exact prompt,
  cheapest first, with context-window fit checks.
- **Compare instantly.** One command shows the spread between the cheapest and
  priciest model for the same request — often 99%+.
- **Build on it.** The estimator is a typed, dependency-light library you can
  embed in CI budgets, request guards, or routing logic.

## Quickstart

```bash
pnpm install
pnpm build

# List the model catalog with pricing
node packages/cli/dist/index.js models

# Estimate a prompt across every model, cheapest first
node packages/cli/dist/index.js estimate "Summarize this contract" -o 800

# Restrict to specific models, emit JSON, or read from a file/stdin
node packages/cli/dist/index.js estimate -f prompt.txt -m openai/gpt-4o,anthropic/claude-sonnet-4 --json
```

Example output:

```text
MODEL                       IN TOK  OUT TOK  EST COST   VS PRICIEST
openai/gpt-4o-mini          16      800      $0.000482  -99.2%
deepseek/deepseek-chat      18      800      $0.000885  -98.5%
...
anthropic/claude-opus-4     19      800      $0.0603    —

Cheapest: openai/gpt-4o-mini at $0.000482
```

## Library usage

```ts
import { estimate, cheapest } from "@hermedion/prism-core";

const results = estimate({
  input: [{ role: "user", content: "Summarize this contract" }],
  expectedOutputTokens: 800,
});

const winner = cheapest({ input: "Summarize this contract" });
console.log(winner.model.id, winner.totalCostUsd);
```

## How estimation works

- OpenAI-family models are tokenized exactly with their published BPE
  encodings (`o200k_base` / `cl100k_base`).
- Providers without public JS tokenizers are counted with the closest encoding
  and corrected by a per-model factor, keeping estimates within a few percent.
- Chat inputs include per-message formatting overhead, matching how providers
  bill in practice.
- Pricing is a versioned snapshot (`PRICING_AS_OF`); verify against provider
  pricing pages before making billing decisions.

## Packages

| Package | Description |
| --- | --- |
| `@hermedion/prism-core` | Model catalog, tokenizer, and cost estimator |
| `@hermedion/prism-cli` | `prism` command-line interface |

## Roadmap

- Live pricing sync from provider pricing pages
- OpenAI-compatible routing proxy with cost-aware fallbacks
- Per-key spend analytics, traces, and latency dashboards
- Budget guards: reject or reroute requests that exceed a cost ceiling

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT © Hermedion
