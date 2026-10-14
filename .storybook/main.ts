import type { StorybookConfig } from '@storybook/react-vite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

// The stories' fonts, from tokens/fonts.json: the same Google Fonts links a
// consumer adds (ADR 0020), one per brand, so a story in any brand (the root
// is portfolio; ThemeScope stories can be any) renders its real typeface.
// Replaces preview-head.html, which loaded DM Sans, DM Serif Display, Inter
// and JetBrains Mono and never Schibsted Grotesk, so every story and
// Chromatic snapshot showed a fallback.
type BrandFonts = { href: string; preconnect: string[] }
const { brands } = JSON.parse(
  readFileSync(new URL('../tokens/fonts.json', import.meta.url), 'utf8'),
) as { brands: Record<string, BrandFonts> }

function fontLinks(): string {
  const origins = [...new Set(Object.values(brands).flatMap(b => b.preconnect))]
  const preconnect = origins.map(origin =>
    // Font files are CORS requests; the stylesheet origin isn't.
    `<link rel="preconnect" href="${origin}"${origin.includes('gstatic') ? ' crossorigin' : ''} />`,
  )
  const sheets = Object.entries(brands).map(
    ([brand, { href }]) => `<link rel="stylesheet" href="${href}" data-brand-fonts="${brand}" />`,
  )
  return [...preconnect, ...sheets].join('\n')
}

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest'
  ],
  framework: '@storybook/react-vite',
  previewHead: head => `${head}\n${fontLinks()}`,
  async viteFinal(config) {
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      // Mirrors the "@/*" -> "./*" mapping in tsconfig.json — Vite doesn't
      // read tsconfig paths on its own, so it needs to be told separately.
      '@': fileURLToPath(new URL('..', import.meta.url)),
    }
    return config
  },
}

export default config
