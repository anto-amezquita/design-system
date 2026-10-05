/**
 * The URLs the generated agent files point at, read from README.md so the
 * domain is written down once. Used by build-llms-txt.mjs, build-skill.mjs
 * and build-registry-manifests.mjs; before 1.3.0 each had its own copy.
 *
 *   - `siteUrl` — the docs site, from the README's "Live component docs" link.
 *     Everything agent-facing lives there: /r/, /tokens.json, /llms-full.txt,
 *     and the doc twins at /components/<slug>.md.
 *   - `portfolioUrl` — the portfolio, from the README's `[amezquita.dk](…)`
 *     link. Only for saying the portfolio runs on this system.
 *
 * Until 1.3.0 both pointed at the portfolio, which served the docs at
 * /design-system. It redirects those paths to the docs site since 2026-10-05
 * (specs/2026-10-05-theme-scope.md, item 1).
 */

import { readFileSync } from 'node:fs'

export function getSiteUrls(readme = readFileSync('README.md', 'utf8')) {
  const site = readme.match(/\[Live component docs.*?\]\((https?:\/\/[^)]+)\)/)
  if (!site) {
    throw new Error('Could not find the "Live component docs" link in README.md. The agent files take the docs site URL from it.')
  }
  const portfolio = readme.match(/\[amezquita\.dk\]\((https?:\/\/[^)]+)\)/)
  if (!portfolio) {
    throw new Error('Could not find the "[amezquita.dk](...)" link in README.md. llms.txt takes the portfolio URL from it.')
  }
  const siteUrl = site[1].replace(/\/$/, '')
  return { siteUrl, portfolioUrl: portfolio[1], twinUrl: slug => `${siteUrl}/components/${slug}.md` }
}
