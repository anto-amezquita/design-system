/**
 * portfolio-scoped.css must give a [data-brand="portfolio"] panel exactly what
 * portfolio-light.css + portfolio-dark.css give a whole page, for every token,
 * in every mode arrangement a page can put a panel in — while the rest of the
 * page stays base. Runs in Chromium so the real cascade decides, not a reading
 * of the selectors (decisions/0001, 2026-10-01 amendment).
 */

import { afterEach, describe, expect, it } from 'vitest'

import baseDark from '../styles/brands/base-dark.css?raw'
import baseLight from '../styles/brands/base-light.css?raw'
import portfolioDark from '../styles/brands/portfolio-dark.css?raw'
import portfolioLight from '../styles/brands/portfolio-light.css?raw'
import portfolioScoped from '../styles/brands/portfolio-scoped.css?raw'

type Mode = 'light' | 'dark'

// Every custom property any brand file declares. Taken from the CSS, not
// token-reference.json, which leaves out the dark-only tokens (checkbox-*,
// radio-*, textarea-*), the ones most likely to leak between modes.
const CSS_VARS = [
  ...new Set(
    [baseLight, baseDark, portfolioLight, portfolioDark].flatMap(css =>
      [...css.matchAll(/^\s+(--[\w-]+):/gm)].map(([, name]) => name),
    ),
  ),
]

function load(css: string[], mode: Mode, body: string) {
  document.head.querySelectorAll('style[data-brand-scope-test]').forEach(s => s.remove())
  const style = document.createElement('style')
  style.dataset.brandScopeTest = ''
  style.textContent = css.join('\n')
  document.head.append(style)
  document.documentElement.dataset.mode = mode
  document.body.innerHTML = body
}

function valuesOf(selector: string) {
  const el = document.querySelector(selector)
  if (!el) throw new Error(`No element matches ${selector}`)
  const style = getComputedStyle(el)
  return Object.fromEntries(CSS_VARS.map(v => [v, style.getPropertyValue(v).trim()]))
}

// What each mode looks like with the unscoped files: one brand, whole page.
function wholePage(css: string[], mode: Mode) {
  load(css, mode, '<div id="probe"></div>')
  return valuesOf('#probe')
}

const BASE = [baseLight, baseDark]
const expected = {
  base: { light: wholePage(BASE, 'light'), dark: wholePage(BASE, 'dark') },
  portfolio: {
    light: wholePage([...BASE, portfolioLight, portfolioDark], 'light'),
    dark: wholePage([...BASE, portfolioLight, portfolioDark], 'dark'),
  },
}

const opposite = (mode: Mode): Mode => (mode === 'light' ? 'dark' : 'light')

afterEach(() => {
  document.head.querySelectorAll('style[data-brand-scope-test]').forEach(s => s.remove())
  delete document.documentElement.dataset.mode
  document.body.innerHTML = ''
})

describe('portfolio-scoped.css', () => {
  for (const page of ['light', 'dark'] as const) {
    describe(`on a ${page} page`, () => {
      const scoped = () =>
        load(
          [...BASE, portfolioScoped],
          page,
          `<div id="base"></div>
           <div id="panel" data-brand="portfolio">
             <div id="nested" data-mode="${opposite(page)}">
               <div id="nested-back" data-mode="${page}"></div>
             </div>
           </div>
           <div id="panel-own-mode" data-brand="portfolio" data-mode="${opposite(page)}"></div>`,
        )

      it('leaves the page outside the panel on base', () => {
        scoped()
        expect(valuesOf('#base')).toEqual(expected.base[page])
      })

      it('gives a panel the page’s mode in portfolio', () => {
        scoped()
        expect(valuesOf('#panel')).toEqual(expected.portfolio[page])
      })

      it('lets a panel’s own data-mode win over the page’s', () => {
        scoped()
        expect(valuesOf('#panel-own-mode')).toEqual(expected.portfolio[opposite(page)])
      })

      it('follows a mode switch nested inside a panel, and back', () => {
        scoped()
        expect(valuesOf('#nested')).toEqual(expected.portfolio[opposite(page)])
        expect(valuesOf('#nested-back')).toEqual(expected.portfolio[page])
      })
    })
  }
})
