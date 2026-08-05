import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'url'

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
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
