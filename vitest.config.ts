import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Chromium via Playwright, shared by both projects below. Browser mode is not
// optional here: several components touch real browser APIs at mount (Button's
// wipe animation reads window.matchMedia unguarded), so jsdom would throw
// before any assertion ran and report a red test for the wrong reason.
const browser = {
  enabled: true,
  headless: true,
  provider: playwright({}),
  instances: [{ browser: 'chromium' }],
} as const;

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: { ...browser },
        },
      },
      // Contract tests that aren't visual states. A story is a catalogue entry
      // a human or agent reads; a test like "Button survives Radix asChild"
      // documents a behavioural contract nobody would browse to. Keeping them
      // apart stops the Storybook corpus (and every Chromatic snapshot) from
      // growing an entry per assertion.
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'components/**/*.test.{ts,tsx}',
            'lib/**/*.test.{ts,tsx}',
            'hooks/**/*.test.{ts,tsx}',
          ],
          setupFiles: ['./vitest.setup.ts'],
          browser: { ...browser },
        },
      },
    ],
  },
});
