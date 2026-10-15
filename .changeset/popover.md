---
"@amezquita/design-system": minor
---

New `Popover` (with `PopoverTrigger`, `PopoverContent`, `PopoverClose`, `PopoverAnchor`), built on `@radix-ui/react-popover` (new dependency, 1.1.23 to match the Radix packages already in use). A non-modal dialog named by its `title`, with optional close button and arrow; focus moves in and back, Escape and a click outside close it, and it follows a ThemeScope into its portal. Styled like Select's dropdown. It came forward from Wave 3 because DatePicker, DateRangePicker, TimePicker and Combobox need it. No new tokens.
