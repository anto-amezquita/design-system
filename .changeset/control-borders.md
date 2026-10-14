---
"@amezquita/design-system": patch
---

Form controls get an edge you can see. Input, Textarea and Select draw their border with `color-border-strong` at rest (it was `color-border-default`, 1.21:1 against the surface in base light, 1.04:1 in demo-soft), and `color-text-secondary` on hover. `color-border-strong` moves a step darker in light mode (`neutral-400` to `neutral-500`, about 4.5:1), so checkboxes, radios and the off switch track pass too; dark mode is unchanged. demo-warm points it at its ink border. New `control-boundary` contrast pairs keep it at 3:1 on both surfaces in every brand and mode (WCAG 1.4.11).
