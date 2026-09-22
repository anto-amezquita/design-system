---
"@amezquita/design-system": major
---

Button is functional by default, and the expressive hover is opt-in (`decisions/0016`). Every Button changes on upgrade.

**Hover:** a plain background change over a short CSS transition — the rules that previously only reached people with `prefers-reduced-motion: reduce`. The GSAP wipe and cursor-following glow are now behind `motion="expressive"`.

**The arrow is opt-in.** `noArrow` is gone; use `arrow`:

- `<Button noArrow>` → `<Button>`
- `<Button>` (was getting an arrow) → `<Button arrow>`

**To keep the previous look**, set both: `<Button motion="expressive" arrow>`. A wrapper in your own app is the tidier place for that than repeating it at every call site.

**GSAP** now loads through a dynamic `import()` on the expressive path, so it never executes in an app that doesn't use it. It remains a regular dependency rather than an optional peer — this package ships raw source with no build step, so the import has to stay resolvable.

**Tokens:** `--button-glow-color` is now a real component token instead of a hardcoded value in `Button.css`, so a brand can override it.

Unchanged: `motion="expressive"` still does nothing under `prefers-reduced-motion: reduce` or on a device without hover, where it falls back to the functional hover.

**Removed: `hooks/useButtonWipe.ts`.** Nothing in this package used it. It imported GSAP statically, so importing it pulled GSAP into your bundle whatever Button's `motion` prop said, and its default fill pointed at `--button-primary-background-hover`, a token removed in an earlier release. If you imported it directly, copy it into your own app; the expressive wipe on Button itself is unaffected.
