# 0013 — Simplify the type scale

## Status

Accepted

## Context

After `decisions/0012` and its 2026-09-17 caption amendment, the scale had 13 static font-size roles and 4 fluid ones. Laid out as one table, a few of them weren't earning their place:

- `font-size-micro` (10px) had no consumer in this repo. Its only user was the portfolio site, for a handful of tiny labels.
- `font-size-h6` (18px) had one consumer, `Heading level={6}`, and was the same size as `font-size-body`. EmptyState's compact title borrowed its line-height.
- `font-size-label` and `font-size-small` were both 14px. The only real difference between "label" and "small" text is the line-height: labels sit on one line (16px), small text wraps (20px).
- `font-size-lead` and `font-size-h4` were both 24px, both paired with a 32px line-height. Keeping them apart forced a compound override in `Dialog.css` (`.heading.dialog__title`) whose only job was to guard against the two tokens drifting apart, a risk `decisions/0011` lists as a negative consequence.
- `font-size-h2-fluid` (`clamp(1.375rem, 0.75rem + 2.5vw, 3rem)`, 22px → 48px) rendered smaller than `font-size-h3-fluid` (`clamp(1.5rem, 1rem + 2vw, 2.5rem)`, 24px → 40px) at every viewport width below 800px: H3's minimum was higher and its preferred value grew faster at narrow widths. So on phones an H3 looked bigger than the H2 above it.

## Decision

1. **Remove `micro`.** `font-size-micro`, `line-height-micro` and the `font-size.2xs` (10px) primitive are gone. 12px text uses `font-size-caption`/`line-height-caption`, the smallest size in the system.
2. **Remove `h6`.** `font-size-h6` and `line-height-h6` are gone, and `Heading`'s `level` prop is now `1`–`5`. `as="h6"` still renders a real `<h6>`, so the document outline isn't limited. EmptyState's compact title moves from 18px body size on H6's 24px line-height to `font-size-h5`/`line-height-h5` (20/24), 2px larger.
3. **Merge `label` into `small`.** `font-size-label` is gone; form-field labels (Input, Label, Select, Textarea) use `font-size-small`. `line-height-label` (16px) stays, because a one-line label and wrapping 14px text need different line boxes. `font-weight-label` and `letter-spacing-label` stay too: they're about weight and tracking, not size.
4. **Merge `lead` into `h4`.** `font-size-lead` and `line-height-lead` are gone. AlertDialog's `.dialog__title` uses `font-size-h4`/`line-height-h4`, so a title styled by the class alone and one composed through `Heading level={4}` now resolve to the same tokens, and the `.heading.dialog__title` override is deleted.
5. **Fix H2/H3 order on small screens.** `font-size-h2-fluid` becomes `clamp(1.625rem, 1rem + 2.5vw, 3rem)`, 26px → 48px. Its minimum, maximum and preferred value are each at least `h3-fluid`'s, so H2 ≥ H3 at every width; checked numerically from 200px to 2560px along with display ≥ H1 ≥ H2. On a phone the fluid tier now reads 32 / 28 / 26 / 24. Max/min ratio is 1.85×, inside `decisions/0008`'s 2.5× WCAG 1.4.4 bar, and the preferred value still mixes rem and vw.

Resulting static scale: h1 64/80, h2 48/60, h3 32/40, h4 24/32, h5 20/24, body 18/28, control 16/24, small 14/20 (labels 14/16), caption 12/16. Fluid: display, h1–h3.

## Alternatives considered

- **Point `font-size-label` back at 12px** for consumers using it for small labels. Rejected in `decisions/0012`'s amendment: it means form-field labels, which are 14px.
- **Keep `lead` and drop `h4`.** Rejected: `Heading` levels map to `h1`–`h5` tokens by name, and a gap at 4 would be harder to follow than a paragraph style using a heading-named size.
- **Merge `line-height-label` into `line-height-small` (20px) as well.** Rejected: every form field's label row would grow 4px for no reading benefit.
- **Fix H2/H3 by shrinking H3** (minimum 20px). Rejected: H3 would collide with H5 (20px) on phones, trading one hierarchy problem for another.
- **Merge `body` (18/28) and `control` (16/24).** Considered and rejected in the same session: unlike the merges above, the two differ in size and line-height and each has many consumers, so either all reading text shrinks or every control grows.

## Consequences

### Positive
- 9 static sizes instead of 13, with no two roles holding the same value for different names except where the line-height genuinely differs (`small`/`label`).
- `Dialog.css` loses a specificity workaround and the drift risk `decisions/0011` recorded.
- Heading order holds at every viewport width.

### Negative
- Breaking for consumers: seven semantic tokens and one primitive are removed, and `Heading level={6}` no longer type-checks. The changeset lists each replacement.
- Visible changes: EmptyState's compact title is 2px larger, and fluid H2 is up to 4px larger below roughly 1280px wide. Consumer text that used `micro` grows from 10px to 12px.
- `h3-fluid` and static `h4` are both 24px on phones. H3 still grows above that from 400px up, and on the smallest screens the two are separated by weight and context rather than size.

## Related files

- `tokens/brands/base/light.json`, `tokens/global.json` — removed roles, the `2xs` primitive, new `h2-fluid` value
- `components/primitives/Heading/Heading.tsx`, `Heading.css`, `Heading.stories.tsx` — `level` 1–5
- `components/composition/Dialog/Dialog.css`, `components/composition/BaseSheet/BaseSheet.tsx` — `lead` → `h4`, override removed
- `components/patterns/EmptyState/EmptyState.css` — compact title on H5
- `components/primitives/Input/Input.css`, `Label/Label.css`, `Select/Select.css`, `Textarea/Textarea.css` — `font-size-small`
- `decisions/0008-productive-expressive-typography-split.md` — fluid tier and the 2.5× bar
- `decisions/0012-baseline-grid-vertical-rhythm.md` — the per-size line-height roles this simplifies
