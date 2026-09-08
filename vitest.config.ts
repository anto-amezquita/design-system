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

// Every dependency real component trees pull in, pre-bundled up front rather
// than discovered mid-run — secondary to the cacheDir fix below, but still
// worth keeping: it shrinks how much any one project's optimizer has left to
// discover on a cold run.
const optimizeDeps = {
  include: [
    'react/jsx-dev-runtime',
    '@testing-library/react',
    '@testing-library/user-event',
    '@radix-ui/react-accordion',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-dialog',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-select',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast',
    '@radix-ui/react-tooltip',
    'gsap',
    '@phosphor-icons/react',
  ],
};

// Each Vitest project below spins its own independent Vite dev server, and
// by default both would write their dependency pre-bundle to the same shared
// node_modules/.vite — on a cold cache (exactly what CI always starts from),
// that's two processes writing to the same files at once. The actual
// symptom this produced wasn't "unknown dependency" (optimizeDeps.include
// above doesn't fix it) but a corrupted read of a file mid-write: "Failed to
// import ... setup-file-with-project-annotations.js: SyntaxError: missing )
// after argument list", cascading into ~20 unrelated story files and a real
// "Invalid hook call" in an unrelated test, both artifacts of the race, not
// real bugs. Giving each project its own cacheDir removes the shared
// resource entirely, rather than trying to out-race it.
const STORYBOOK_CACHE_DIR = path.join(dirname, 'node_modules/.vite/storybook');
const UNIT_CACHE_DIR = path.join(dirname, 'node_modules/.vite/unit');

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  optimizeDeps,
  test: {
    projects: [
      {
        extends: true,
        cacheDir: STORYBOOK_CACHE_DIR,
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
        cacheDir: UNIT_CACHE_DIR,
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
