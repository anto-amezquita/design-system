---
"@amezquita/design-system": minor
---

Added a `caption` role for 12px text: `--font-size-caption` (12px) and `--line-height-caption` (16px), amending `decisions/0012`. Tooltip, Input and Textarea hints, Table header/foot/caption text, Badge and Tag now use it.

Visible change: Tooltip, form hints and Table header/foot/caption text move from a 20px to a 16px line-height (the 12/16 caption pairing), so those boxes get 4px shorter per line. Badge and Tag render the same.

**Removed:** six component tokens that only pointed at 12px, now covered by `--font-size-caption`: `--tooltip-font-size`, `--input-hint-size`, `--textarea-hint-size`, `--table-header-font-size`, `--badge-font-size`, `--tag-font-size`. If your own CSS references one, use `--font-size-caption` instead.
