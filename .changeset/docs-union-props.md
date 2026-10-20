---
"@amezquita/design-system": patch
---

Component docs: props typed as "one or the other" now list correctly. StatusDot's page was missing `label`, and Badge and Dialog showed `never` in their prop types (`boolean | never`); the generator now splits a union of object types into its parts, splits one-line objects at `;`, and drops `never` while keeping the prop optional.
