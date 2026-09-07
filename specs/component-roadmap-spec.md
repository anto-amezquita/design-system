# Component roadmap — candidates, not commitments

Collects component ideas surfaced from outside sources (competitor audits, pattern libraries, feature requests from a consuming project) before any of them get built. This file exists so a good idea doesn't either get lost or get built on the strength of "seemed useful" alone.

**Governing rule, same one `decisions/0026`'s AlertDialog addition already followed:** a component gets built when a real, current consumer needs it — not speculatively, no matter how well-reasoned the source pattern is. An entry moves from this file into an actual build only once that trigger exists. Until then it just sits here as a candidate.

---

## Candidates

| Candidate | Source | Real consumer? | Notes |
|---|---|---|---|
| **Chart (line/area)** | Fintech pattern audit, "Interactive Financial Charting" — 2026-09-03 | **Yes — FinFam** | `components/charts/` in FinFam is stubbed (net worth trend, compound interest — both line/area shapes) waiting on exactly this. No chart tokens exist anywhere in this repo yet (`tokens/components/` has no `chart.json`) — this is a from-scratch addition: a categorical/qualitative color palette for series (nothing like it exists today, only semantic feedback colors) plus the component itself. Closest candidate to an actual trigger; deferred for now by explicit choice (2026-09-03), not because it isn't justified — pick this up when ready to scope line-vs-bar-vs-both.
| **Chart (bar)** | Same audit — "Data-Dense Financial Balance & Trend Cards" / budget breakdown pattern | **Yes — FinFam** | Covers FinFam's third stubbed chart (budget breakdown). Same from-scratch token gap as above. Natural second phase after line/area, or built together if scoping both at once later.
| Stepper (generic, not KYC-specific) | Same audit — "Progressive KYC & Onboarding Stepper" | No | The audit's version is a KYC-specific flow; if ever built, it should generalize to a plain multi-step Stepper primitive, not a KYC-named component — this repo has no onboarding/identity-verification consumer. No trigger yet.
| Timeline / status tracker | Same audit — "Real-Time Payment Status & Timeline Component" | No | Generic "N-stage progress tracker" (Initiated → Clearing → Settled) is a reasonable primitive shape, but no current consumer needs a multi-stage status tracker. No trigger yet.
| Itemized confirmation content pattern | Same audit — "Proof-First Action & Confirmation Modal" | No | Already covered structurally — `Dialog`/`AlertDialog` exist; an itemized-cost list is page-level content composition inside an existing modal, not a new component. Not a real gap.
| AI action/suggestion card | Same audit — "Human-in-the-Loop Agentic AI Preview Cards" | No | Speculative — no consumer currently surfaces AI-suggested actions needing an Approve/Undo card shape. No trigger yet.
| Consent/permissions manager | Same audit — "Open Finance & Consent Management Dashboard" | No | Domain-specific to Open Banking/third-party data-sharing flows this repo has no consumer for. No trigger yet.
| Biometric re-auth trigger | Same audit — "Biometric & Security Re-Authentication Triggers" | No | Not really a component in this repo's sense (primitive/composition/pattern) — a security flow, not a visual element. Unlikely to ever belong here as-is.
| Quick-action pill bar | Same audit — "Instant Action Quick-Pill Bar" | No | Likely already expressible via existing `Tag`/`Badge` plus a flex row — not obviously a new component even if a consumer showed up. Revisit only if a real use case exposes a gap `Tag`/`Badge` can't cover.
| Calm-state error/recovery module | Same audit — "Calm-State Error & Fail-Safe Recovery Modules" | No | Already covered — `Alert` exists for exactly this. Not a real gap.

---

## Adding to this list

New candidate → append a row: source, whether a real consumer exists today, and why (or why not) it's a genuine gap versus already covered by an existing component. Don't skip the "real consumer?" column — an entry with "No" stays a candidate indefinitely, not a queue position.

## Removing from this list

A candidate leaves this file one of two ways: it gets built (becomes a real component, tracked from there via the normal component/decisions process, same as AlertDialog), or it's judged permanently out of scope and struck with a one-line reason rather than silently deleted — so the "already considered and rejected" reasoning isn't lost if the same idea resurfaces later.
