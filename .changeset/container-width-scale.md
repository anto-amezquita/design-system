---
"@amezquita/design-system": minor
---

Added a container width scale (`decisions/0014`): `--size-container-text` (45rem), `--size-container-media` (60rem), `--size-container-wide` (80rem), `--size-container-page` (90rem) and `--size-container-site` (90vw, for 1024px and up). Use each as `min(var(--size-container-*), 100%)` so it fills narrow screens.

`--space-layout-max-width` is deprecated in favour of this scale. It keeps its 1200px value in this release.
