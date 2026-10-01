---
"@amezquita/design-system": minor
---

Five additions found while building the docs site, all non-breaking:

- **Both brands on one page.** New `styles/brands/portfolio-scoped.css` holds the portfolio overrides under `[data-brand="portfolio"]` instead of `:root`. Load `base-light.css` and `base-dark.css` as usual plus this file, put `data-brand="portfolio"` on a panel, and only that panel takes the portfolio brand. It follows the page's `data-mode`, or its own. Use it *instead of* `portfolio-light.css` and `portfolio-dark.css`, not alongside them. Those two files are unchanged, so nothing changes if you already use them.
- **Font links you can read from the package.** New `tokens/fonts.json` gives the Google Fonts stylesheet link each brand needs: JetBrains Mono for `base`, Schibsted Grotesk plus JetBrains Mono for `portfolio`, with the weights the tokens use. The package still ships no font files. `llms.txt` and the README have the same links. It's generated from the font tokens, so it changes when a font does.
- **Token descriptions.** Every semantic and component token has a one-line `$description`, and `tokens/token-reference.json` (and `tokens.json`) now carries it as `description` on each entry, `null` where there isn't one. Before, the field never reached the reference at all.
- **MCP tools in `llms.txt`.** `llms.txt` and `llms-full.txt` list the MCP server's tools, generated from the server itself, so the list matches what it serves.
- **Doc twins show base values.** The Tokens tables in `docs/components/*.md` now show the `base` theme's values. They showed the portfolio brand's, so Button's secondary colours read `#292524` instead of base's `#262626`.
