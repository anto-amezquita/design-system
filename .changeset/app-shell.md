---
"@amezquita/design-system": minor
---

New `AppShell` pattern: the frame of an app's pages. It places a SkipLink, the `header` (usually TopNav), a `sidebar` (usually SideNav), `main`, an optional named `aside`, a `footer` and a `bottomNav` (usually MobileNav) in the right landmarks: one column below 1024px, side by side from 1024px. A sticky sidebar starts below a sticky header, and the page leaves room for a fixed bottom bar; both heights are measured, so they stay right when the bars wrap or hide. Adds the `app-shell-aside-width` component token.
