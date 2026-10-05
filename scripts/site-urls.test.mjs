/**
 * Tests for scripts/site-urls.mjs: which README link each URL comes from,
 * where doc twins live on the docs site, and the fail-loud path.
 */

import { describe, expect, it } from 'vitest'

import { getSiteUrls } from './site-urls.mjs'

const README = [
  'Extracted from and still powering [amezquita.dk](https://amezquita.dk), and built to be shared.',
  '',
  '[Live component docs →](https://design.amezquita.dk/)',
].join('\n')

describe('getSiteUrls', () => {
  it('takes the docs site from the "Live component docs" link, without a trailing slash', () => {
    expect(getSiteUrls(README).siteUrl).toBe('https://design.amezquita.dk')
  })

  it('keeps the portfolio link separate', () => {
    expect(getSiteUrls(README).portfolioUrl).toBe('https://amezquita.dk')
  })

  it('puts doc twins under /components, where the docs site serves them', () => {
    expect(getSiteUrls(README).twinUrl('button')).toBe('https://design.amezquita.dk/components/button.md')
  })

  it('fails naming the link when the README loses it', () => {
    expect(() => getSiteUrls('[amezquita.dk](https://amezquita.dk)')).toThrow(/Live component docs/)
  })

  it('reads the real README', () => {
    const { siteUrl, portfolioUrl } = getSiteUrls()
    expect(siteUrl).toBe('https://design.amezquita.dk')
    expect(portfolioUrl).toBe('https://amezquita.dk')
  })
})
