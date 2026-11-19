---
'@amezquita/design-system': minor
---

`lib/color-mode` sets `<html data-mode>` from the visitor's pick, or from the system setting until they pick, before first paint, so a dark page never flashes light. `colorModeScript()` returns the inline script for `<head>`; it keeps following the system setting while the visitor hasn't picked. `useColorMode()` (`hooks/useColorMode`) gives `preference` (`light`, `dark` or `system`), `mode` and `setPreference` for a switch, and stays in step with other tabs. The pick is remembered in `localStorage` under `amezquita-color-mode`, or a `storageKey` of your own. The script module isn't a client module, so a Next.js root layout can import it. README, "Light and dark mode", shows Next.js and Vite.
