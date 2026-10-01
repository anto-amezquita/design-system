---
"@amezquita/design-system": patch
---

`Link`, `SkipLink` and `Tag` now start with `'use client'`. They use client-only React (Radix `Slot` in Link, click handlers in SkipLink and a removable Tag) without saying so, so a Next.js App Router consumer couldn't render them from a Server Component: the build failed with `createContext is not a function` or "Event handlers cannot be passed to Client Component props". The docs site hit it first and worked around it with a client re-export, which it can now delete. Nothing changes in the browser or for consumers outside the App Router.

`npm run validate` gains `check-client-directives.mjs`, which fails any component that uses state or effect hooks, context, Radix or an inline event handler without the directive. The tests and Storybook render in a browser, where the directive does nothing, which is how these three shipped without it.
