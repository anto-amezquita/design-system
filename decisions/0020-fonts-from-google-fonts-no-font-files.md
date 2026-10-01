# 0020 — Fonts load from Google Fonts; the package ships no font files

## Status

Accepted

## Context

The brands name web fonts in their tokens: `base` sets `font-family-mono` to JetBrains Mono (its text stacks are system fonts), and `portfolio` sets `font-family-base` and `font-family-heading` to Schibsted Grotesk. The package ships no font files and no `@font-face`, and nothing said how to load them. So every consumer worked it out alone. The portfolio uses `next/font/google` and maps its variables onto the tokens in its own `fonts.css`. `design-system-site` hand-wrote two Google Fonts `<link>` tags, one in its root layout and one in its portfolio preview frames, with the weights picked by hand.

The site's first build (its `specs/2026-09-30-first-build.md`) flagged this, and its Getting started page needs the answer as data, not prose, so it can't fall out of step with a release.

## Decision

**The package ships no font files.** It documents the Google Fonts link each brand needs, and generates it from the tokens.

`scripts/build-fonts.mjs` writes `tokens/fonts.json` on every `npm run tokens`, and it ships in the package. For each brand it lists the web fonts (from the `font-family-*` tokens, skipping system stacks), the tokens that name each one, the weights (every value the brand's font-weight tokens resolve to), one stylesheet `href` and the origins to preconnect to. `portfolio` gets Schibsted Grotesk *and* JetBrains Mono, because it's a skin on `base` and inherits base's mono token. `llms.txt`, `llms-full.txt` and the README carry the same links, or point at the file.

Both families are variable fonts on Google Fonts, so asking for five weights still downloads one file per family and subset (checked against the served CSS, 2026-10-01). Listing every weight the tokens use costs nothing and means no weight falls back to synthetic bold.

A web font that the generator doesn't know how to load fails the build. Adding a font to a brand means adding it to the generator's list, which is the moment to check Google Fonts actually serves it.

## Alternatives considered

- **Ship the font files with an `@font-face` stylesheet.** Rejected for now. The package ships source CSS that each consumer's bundler processes, and `url()` paths into `node_modules` resolve differently in Next.js, Vite and Storybook, so it would need testing in each. It would also put about 130 kB of woff2 in every install (the eight subset files Google serves for both families, measured 2026-10-01), including apps that already load the fonts their own way, as the portfolio does with `next/font`. Worth revisiting if a consumer can't use Google's CDN (see Negative), since the families and weights in `fonts.json` are exactly what self-hosting would need.
- **Recommend `next/font`.** Rejected as the documented path: it only works in Next.js, and this package has non-Next consumers. A Next.js consumer can still use it; `fonts.json` names the families and weights to pass.
- **Write the links in the README by hand.** Rejected: they'd drift the first time a weight token or a brand font changed, and the site couldn't read them.
- **Keep saying nothing.** Rejected: that's what produced two hand-written guesses in the site.

## Consequences

### Positive
- One place, generated, says what a brand needs. The site can build its Getting started page from `fonts.json`, and its hand-written links can go.
- A font change in the tokens changes the link in the same build.
- Nothing new in the install, and nothing changes for consumers that already load the fonts their own way.

### Negative
- Loading from `fonts.googleapis.com` sends each visitor's IP address to Google. A German court (LG München I, January 2022) found that a GDPR breach without consent. Consumers who need to avoid it have to self-host or use `next/font`, which downloads the files at build time. `fonts.json` gives them the inputs, not the files.
- `fonts.json` only knows Google Fonts. A brand with a font Google doesn't serve needs this decision revisited, which the generator's failing build forces.
- The weight list is per brand, not per family, so JetBrains Mono gets every weight the text roles use. Free for these two variable fonts; it would cost downloads for a static family.

## Related files

- `scripts/build-fonts.mjs`, `scripts/build-fonts.test.mjs`
- `tokens/fonts.json` (generated, shipped)
- `tokens/brands/base/light.json`, `tokens/brands/portfolio/tokens.json` — the font-family and font-weight tokens it reads
- `scripts/build-llms-txt.mjs` — the Fonts section in `llms.txt` and `llms-full.txt`
- `README.md` § Fonts
- [`specs/2026-10-01-docs-site-gaps.md`](../specs/2026-10-01-docs-site-gaps.md)
