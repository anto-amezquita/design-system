---
"@amezquita/design-system": minor
---

New `FormLayout` pattern with `FormSection`, `FormRow`, `FormActions` and `FormErrorSummary`. Sections are regions named by their headings; rows sit side by side when the container has room (container queries) and stack when it doesn't; actions end-aligned, stacking full-width with the main action on top in a narrow form. `FormErrorSummary` follows the GOV.UK pattern: it takes focus after a failed submit, is named by its count, and each link moves focus to its field. No new tokens.
