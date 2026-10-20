---
"@amezquita/design-system": minor
---

New `DescriptionList` primitive: labelled values in a `dl`, from an `items` array of `{ term, description }` (several values per term become several `dd`s). `layout="inline"` puts term and value side by side once the list is 30rem wide and stacks them below that, by container query; `stacked` always stacks; `divided` draws lines between pairs.
