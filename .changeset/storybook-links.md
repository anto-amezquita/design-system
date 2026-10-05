---
"@amezquita/design-system": patch
---

Storybook links that open the right story. The registry's Storybook paths (`storybookPath`, `storybookTitleId` in `tokens/component-registry.json`, and the "Storybook:" line in each doc twin and in `llms-full.txt`) were wrong for 8 components: Accordion, Breadcrumb, DataTable, EmptyState, Pagination, Table and Tabs are filed under `Patterns/` in Storybook, not `Components/`, and Radio's stories are `Components/RadioGroup`. They now come from each story file's own `title`. A new registry field, `defaultStoryId`, is the id Storybook gives a component's first story (Heading's `H1` is `components-heading--h-1`), so a link to `?path=/story/<defaultStoryId>` opens it. Storybook for `main` is published at https://anto-amezquita.github.io/design-system/. No component, token or CSS changes.
