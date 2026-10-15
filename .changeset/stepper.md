---
"@amezquita/design-system": minor
---

New `Stepper` pattern: where someone is in a process with a fixed order. It's an ordered list where the current step has `aria-current="step"`, and each step's state is also given in hidden words ("Address (Completed)"), translatable through `statusLabels`. Finished steps can lead back, as buttons with `onStepClick` or links with `href`; upcoming steps never can. A step can be marked as needing attention. Horizontal or vertical; when narrow and horizontal, only the current label shows. Adds two component tokens, `stepper-indicator-size` and `stepper-connector-width`.
