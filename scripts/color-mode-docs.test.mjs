/**
 * The documented way to load colorModeScript() (lib/color-mode, G7).
 *
 * In the Next.js App Router, next/script's beforeInteractive doesn't run an
 * inline script while the page parses: it queues it for Next's runtime, which
 * runs after first paint, so a dark page flashes light first. The portfolio
 * measured this and uses a plain <script> in <head> (its theme-flash ADR).
 * This repo has no Next.js app to test that in, so this pins the recipe the
 * README and the module's own docs give instead.
 */

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const sources = {
  'README.md': readFileSync('README.md', 'utf8'),
  'lib/color-mode.ts': readFileSync('lib/color-mode.ts', 'utf8'),
}

describe('colorModeScript() recipe', () => {
  for (const [file, text] of Object.entries(sources)) {
    it(`${file} loads it with a plain inline <script>, not next/script`, () => {
      expect(text).not.toMatch(/<Script\b/)
      expect(text).not.toMatch(/from 'next\/script'/)
      expect(text).toMatch(/<script dangerouslySetInnerHTML=\{\{ __html: colorModeScript\(\) \}\} \/>/)
    })
  }
})
