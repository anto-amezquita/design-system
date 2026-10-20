# 0026 — Chart series colours as semantic tokens; d3-scale and d3-shape for the maths

## Status

Accepted (2026-10-20)

## Context

Wave 5 of the coverage plan includes Chart: line (with an optional area) and bar, the first data visualisation in the system. Two things it needs weren't there.

**Series colours.** A chart with several series needs as many distinct colours, and the system had none to give. The semantic roles are one accent, four feedback colours and greys. Reusing them would mean a series coloured like an error, a chart that changes look when a brand's accent changes, and at most two or three distinct series.

**Scales and paths.** Turning values into positions (linear, time and band scales, "nice" axis ticks) and positions into a line or an area path (with gaps for missing values) is maths that's easy to get subtly wrong. [ADR 0002](./0002-reject-transitions-dev-library-adopt-audit-technique.md) asks that a dependency be weighed, not adopted for convenience.

I measured the options the same way as for Markdown (ADR 0025): a line and a bar chart with axes, bundled with esbuild, minified and gzipped, React external.

## Decision

**Six semantic tokens, `color-chart-1` to `color-chart-6`,** defined in base for light and dark, in a fixed order: blue, orange, teal, amber, magenta, green. Series 1 always takes colour 1; colours are never cycled, and a chart draws at most six series. A brand may override any of them like any other semantic token.

- They come from the dataviz skill's reference palette, checked with its validator (`validate_palette.js`), not by eye. Light mode needed deeper steps than the reference for orange, teal, amber, magenta and green to reach **3:1 on both surfaces** (WCAG 1.4.11: a line or bar is a graphic needed to read the chart). The dark steps are the reference's, unchanged.
- Validator results on the darkest light surface (portfolio's `#F4F0EB`) and the lightest dark ones: every check passes, worst adjacent colour-blind separation ΔE 9.0 light and 8.4 dark (target 8), worst adjacent normal-vision ΔE 16.8 and 19.3 (floor 15).
- `tokens/contrast-pairs.json` has a 3:1 pair for each colour on `color-surface-primary` and `color-surface-secondary`, so `npm run validate` checks all six in all ten brand and mode combinations, as it does every other pair.
- They're raw hex in `base/light.json` and `base/dark.json`, as base's dark feedback colours already are, rather than a new primitive family. Six primitives used by six semantic tokens and nothing else would be a rename layer.
- They're on the **mode axis** (`sd.config.mjs`), since each colour has a different step per mode: a lighter step on a dark surface is lighting, like the feedback colours.
- Colour is never the only cue. Each series also has its own line style (solid, dashed, dotted, …) and marker shape, a legend names them, the tooltip and speech say the series name, and the same data is one click away as a table.

**`d3-scale` 4.0.2 and `d3-shape` 3.2.0, pinned,** as runtime dependencies, for scales, ticks and line and area paths only. React draws every element; the components, semantics, keyboard model and tokens are this system's own.

## Alternatives considered

- **Recharts 3.10 (114 kB gz).** The quickest to ship. Rejected: most of the weight is its own state management (Redux Toolkit, Immer, react-redux), it takes colours as SVG attributes, which can't read CSS tokens, so every colour would need a CSS override, and it has no table view.
- **Chart.js 4.5 (58 kB).** Draws on a canvas, so nothing reaches a screen reader unless rebuilt alongside it, and colours are set in JavaScript, not CSS.
- **Observable Plot 0.6 (93 kB).** Excellent defaults, but it builds the SVG outside React and pulls in all of d3.
- **visx 4.0 (27 kB).** React-friendly axes and shapes. Rejected for now: the accessibility, keyboard and table would still be built here, and the extra 12 kB over d3 buys axes that take a few lines to draw.
- **Reuse existing roles for series.** No new tokens, but it repurposes status colours as series colours (which the dataviz method forbids: status colours are reserved) and gives too few distinct series.
- **A primitive family (`chart-*` in `global.json`) under the semantic tokens.** More layering for no reuse; see above.

## Consequences

### Positive

- Charts follow the brand and mode through tokens, with a palette checked for colour-blind separation and contrast rather than chosen by eye.
- `d3-scale` and `d3-shape` together are about 15 kB gzipped, and bring 8 small packages from the same project (d3-array, d3-color, d3-format, d3-interpolate, d3-path, d3-time, d3-time-format, internmap). They're only loaded by apps that import Chart.

### Negative

- Six more semantic tokens (151 in all), and a brand that wants its own chart palette has to validate it the same way; the contrast pairs enforce 3:1, not colour-blind separation.
- At most six series. More needs folding into "Other" or small multiples, which the component warns about but doesn't do.
- The amber step in light mode is a dark gold (`#A57300`), not a yellow: that's what 3:1 on a near-white surface costs.
- Bars in a grouped bar chart are told apart by colour and position, not texture. The legend, tooltip, speech and table carry the series names.

## Related files

- `components/patterns/Chart/` — the component and its tests (keyboard, speech, table, series encodings, contrast)
- `tokens/brands/base/light.json`, `tokens/brands/base/dark.json` — `color-chart-1` … `-6`
- `tokens/contrast-pairs.json` — the 3:1 pairs
- `sd.config.mjs` — `color-chart-` on the mode axis
- [`0002`](./0002-reject-transitions-dev-library-adopt-audit-technique.md), [`0025`](./0025-markdown-to-jsx-for-markdown.md) — how dependencies are weighed here
