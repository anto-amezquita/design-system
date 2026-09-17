---
"@amezquita/design-system": minor
---

Simplified the type scale (`decisions/0013`): 9 static sizes instead of 13, and H2 no longer renders smaller than H3 on small screens.

**Removed, with replacements:**

- `--font-size-micro`, `--line-height-micro` → `--font-size-caption`, `--line-height-caption` (10px text becomes 12px)
- `--font-size-h6`, `--line-height-h6` → `--font-size-h5`, `--line-height-h5`, or `--font-size-body` if you need 18px
- `--font-size-label` → `--font-size-small` (same 14px; keep `--line-height-label` for one-line labels)
- `--font-size-lead`, `--line-height-lead` → `--font-size-h4`, `--line-height-h4` (same 24/32)

**`Heading`:** `level` is now `1`–`5`. `level={6}` no longer type-checks; use `level={5}`, adding `as="h6"` if you need a real `<h6>`.

**Visible changes:** `--font-size-h2-fluid` is now `clamp(1.625rem, 1rem + 2.5vw, 3rem)` (26px → 48px, was 22px → 48px), so fluid H2 is up to 4px larger below about 1280px wide and always at least as large as H3. EmptyState's compact title moves from 18/24 to 20/24.
