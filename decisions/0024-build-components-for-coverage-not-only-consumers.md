# 0024 — Build the coverage plan's components without waiting for a consumer

## Status

Accepted (decided 2026-10-08, recorded 2026-10-20)

## Context

Until October the rule for adding a component was the one in [`specs/component-roadmap-spec.md`](../specs/component-roadmap-spec.md): build it when a real, current consumer needs it, never speculatively. AlertDialog came in that way, and the roadmap kept everything else (Chart, Stepper, a status timeline) as candidates until a consumer showed up.

That rule kept the library small and honest, and it left it at 35 components. For the portfolio and FinFam that was enough. But the library is also how I show my work for UX/UI and frontend roles, and next to Material 3, shadcn/ui and Astryx, 35 reads as a starter kit. On 2026-10-08 I compared our set with those three ([`specs/component-coverage-research.md`](../specs/component-coverage-research.md)) and chose a plan to reach 97: five waves, credibility first, 62 named components. Most of them have no consumer today.

So the plan and the roadmap's rule disagreed, and for twelve days that was only visible to someone who read both files. This records which one wins, and where.

## Decision

**The 62 components named in the coverage plan get built without waiting for a consumer.** For those, the plan replaces the roadmap's consumer rule.

**In exchange, each one has to meet the plan's done bar before it counts:** every state, keyboard support, light and dark in all five brands with contrast passing, tokens, a doc twin, a story, a registry entry and Do / Don't guidance. A component that's only there to raise the count is the thing the consumer rule existed to prevent, so the bar is what replaces the consumer as the check.

**Anything not in the plan still follows the roadmap's rule.** A new idea goes on the roadmap as a candidate and waits for a consumer, as before. Adding a component to the plan is a change to this decision, not a way around it.

## Alternatives considered

- **Keep the consumer rule and build only what FinFam or the portfolio need.** The honest default, and the reason the library stayed lean. Rejected for now: it would keep the library at a size that undersells it for the roles I'm applying to, and the gaps it leaves (Date Picker, Combobox, Slider) are ones any reviewer who knows Material or shadcn notices.
- **Build them in a separate showcase package.** Keeps the main package to what consumers use. Rejected: two packages means two release flows, two sets of Chromatic snapshots and a second docs site, for components that follow the same token rules anyway. And a consumer that later needs Combobox should find it in the one package.
- **Drop the consumer rule altogether.** Simpler, but then nothing stops the count growing past what I can keep to the done bar. The plan has an end (97) and a list; an open rule doesn't.

## Consequences

### Positive

- The library covers what reviewers expect: every Tier 1 gap from the comparison is closed, and the first showcase pieces (Date Picker, Combobox, Command Palette) exist; the chat set follows in wave 5.
- Building in waves found real bugs in existing components (disabled states, Field wiring, a docs generator that dropped props) that a consumer-by-consumer pace would have found later, if at all.

### Negative

- More code to maintain: 80 components today, 97 at the end, most without a consumer to tell me when one breaks in real use. The tests, stories and axe checks are the substitute, and they're not the same thing.
- More surface for every token or brand change to reach, so those get slower to make safely.
- The roadmap and the plan both have to be read to know the rule for a given component. The roadmap now says so at the top and points here.

## Related files

- [`specs/component-coverage-research.md`](../specs/component-coverage-research.md) — the comparison, the build plan with its 62 components, the done bar, the schedule and progress
- [`specs/component-roadmap-spec.md`](../specs/component-roadmap-spec.md) — the consumer rule, which still holds outside the plan
- [`0022`](./0022-release-at-most-weekly.md) — why the waves ship in weekly releases rather than one per component
