# 0016 — A functional Button by default, the portfolio's expression opt-in

## Status

Accepted

## Context

[0001](./0001-white-label-base-portfolio-brand-split.md) split the tokens into a brand-agnostic `base` and a thin `portfolio` skin, so new consumers get a neutral default instead of inheriting portfolio's choices. That split covered tokens only. Button's behaviour was never split, and the portfolio's personality still ships to every consumer.

This matters now because the system is meant to power all my projects: Ajar, FinFam, the video reels project, the portfolio, and a planned songwriting site. It also blocks [0015](./0015-navigation-components-core-set.md), since Button will likely be used as a trigger inside `Menu` and `NavigationMenu`.

What `components/primitives/Button` does today, for every consumer:

- **A hover wipe and glow drawn with GSAP** in `Button.tsx`: an SVG path animated on `mouseenter`/`mouseleave`, plus a radial glow following the cursor. Tokens (`--button-wipe-duration-*`) only control its timing, so no brand can turn it off. Every consumer ships GSAP.
- **A trailing arrow by default** (`noArrow = false`), nudged on hover. A Cancel or Save button in Ajar gets an arrow unless someone remembers to opt out.
- **A hardcoded glow colour**, `--button-glow-color: rgba(255, 255, 255, 0.45)`, defined in `Button.css` rather than in the token layer.

The plain version already exists. The `prefers-reduced-motion` block in `Button.css` turns off the wipe and changes the background colour on hover instead. That is the functional default this decision wants; today only reduced-motion users get it.

## Decision

**The default Button is functional.** Hover changes the background colour with a short CSS transition, using the rules currently in the reduced-motion block, promoted to the base styles. No JavaScript animation and no GSAP for consumers who don't ask for it.

**The expressive hover is opt-in** through a literal-union prop, in line with the constrained props elsewhere in the system:

```ts
motion?: 'functional' | 'expressive' // default 'functional'
```

With `'expressive'`, Button renders the wipe and glow and loads GSAP with a dynamic `import()`, so it only lands in bundles that use it. The existing guards stay: no wipe under `prefers-reduced-motion: reduce` or `hover: none`.

**The arrow is opt-in.** `noArrow` becomes `arrow?: boolean`, default `false`.

**The glow colour moves into the token layer**, so the lint rules see it like every other colour.

**The portfolio keeps its look** through a thin wrapper in the portfolio repo that sets `motion="expressive"` and `arrow` where it wants them. The wrapper lives there, not here.

**Out of scope:** `onNavigate` and `curtainColor`. They are portfolio-flavoured too, but optional and inert when unused. They can be revisited separately.

This is a visible change to every existing Button, so it ships as a **major** version.

## Alternatives considered

- **Switch the expression off through brand tokens only.** Rejected: the wipe is JavaScript. CSS can't stop GSAP from loading or the listeners from attaching, and reading a token from `getComputedStyle` as an on/off flag would be hidden behaviour an agent or a new consumer couldn't see in the props.
- **Keep expressive as the default, with an opt-out prop.** Rejected: the default is exactly what is wrong. Every new project would inherit the portfolio's look and have to remember to turn it off.
- **Move the whole wipe into the portfolio repo.** Rejected for now: the wipe draws inside Button's own element (the SVG and glow sit under the label), so moving it out means exposing internal slots or duplicating the component. An opt-in prop keeps one Button with one API.
- **Let motion follow the brand automatically**, expressive under `portfolio`, functional under `base`. Rejected: behaviour would depend on which CSS file is loaded, and the same code would act differently across apps with nothing in the component to show why.

## Consequences

### Positive
- New consumers get a clear, accessible Button with no animation dependency.
- The portfolio's expression is explicit in its own code, where it belongs.
- GSAP leaves the bundles of every consumer that doesn't use the expressive mode.
- 0015's navigation components can use Button as a trigger without inheriting the portfolio's look.

### Negative
- Breaking change: every consumer's buttons change on upgrade, and code using `noArrow` needs updating.
- Chromatic will flag every Button story. These diffs are intended and need reviewing and accepting as a batch, against a committed build.
- GSAP's place in `package.json` needs a decision at build time: a dynamic import still needs the package resolvable where the expressive mode is used. Likely an optional peer dependency, to verify against a real consumer build.
- The portfolio needs its wrapper in place before it upgrades, or its buttons go plain.

## Related files

- `components/primitives/Button/Button.tsx` — GSAP wipe, glow, `noArrow`
- `components/primitives/Button/Button.css` — the reduced-motion block that becomes the default, `--button-glow-color`
- `components/primitives/Button/Button.stories.tsx` — stories for both motion modes
- `decisions/0001-white-label-base-portfolio-brand-split.md` — the token split this extends to behaviour
- `decisions/0015-navigation-components-core-set.md` — blocked on this
- `docs/components.md`, `AGENTS.md` — to update with the new props
