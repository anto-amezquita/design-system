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
//
// Each project needs its own `instances[].name` — a known Vitest/addon-vitest
// issue (storybookjs/storybook#30363, #32427): two projects both defaulting to
// an unnamed `{ browser: 'chromium' }` instance collide on Vitest's internally
// derived project name once both run together (fine in isolation, e.g.
// `--project unit` alone, which is why this didn't surface until `npm run
// validate` ran the full `vitest run` for the first time). Takes the project
// name as a parameter specifically so the two calls below can't accidentally
// share one and reintroduce the collision.
function browserFor(instanceName: string) {
  return {
    enabled: true,
    headless: true,
    provider: playwright({}),
    instances: [{ browser: 'chromium', name: instanceName }],
  } as const;
}

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
          browser: browserFor('storybook-chromium'),
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
          browser: browserFor('unit-chromium'),
        },
      },
    ],
  },
});
