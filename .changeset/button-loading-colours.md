---
"@amezquita/design-system": patch
---

Button: `loading` keeps the variant's colours at full strength. It used to pick up the disabled opacity (a loading `<button>` is natively disabled), so a loading primary Button looked almost disabled and its spinner was hard to see.
