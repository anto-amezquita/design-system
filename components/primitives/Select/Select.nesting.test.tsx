/**
 * Contract test: a Select opened while nested inside an open Dialog must be
 * clickable — its dropdown must paint above the Dialog's own overlay, not
 * behind it.
 *
 * decisions/0007: --z-dropdown (200) ranked below --z-overlay/--z-modal
 * (300/400) in base-light.css/base-dark.css, so Select's dropdown painted
 * behind its own containing Dialog's overlay, which intercepted every
 * option click. Confirmed against a real external consumer (Ajar,
 * decisions/0030) — 6 of 6 rights-release-check.spec.ts e2e tests failed on
 * exactly this. Runs in a real browser (this project's Vitest config, not
 * jsdom) specifically so pointer-event interception is real, not simulated —
 * a DOM-structure assertion alone wouldn't have caught the original bug
 * either, since the elements are all genuinely present and "visible" by
 * bounding-box; only an actual click proves nothing is painted on top of
 * the option.
 */

import { useState } from 'react'
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
// The `unit` Vitest project (unlike Storybook's preview.tsx) loads no brand
// CSS by default — without it, `z-index: var(--z-dropdown)` never resolves
// to a real number at all (an unresolved custom property drops the whole
// declaration), so this test would pass regardless of whether the fix is
// present. Confirmed the hard way: real token values, matching what an
// actual consumer app has loaded, are what make the assertion meaningful.
import '../../../styles/brands/base-light.css'
import { Dialog } from '../../composition/Dialog'
import { Select } from './Select'

function DialogWithSelect() {
  const [value, setValue] = useState('unreleased')
  return (
    <Dialog defaultOpen title="Rights profile">
      <Select
        aria-label="Release state"
        value={value}
        onValueChange={setValue}
        groups={[
          {
            options: [
              { value: 'unreleased', label: 'unreleased' },
              { value: 'scheduled', label: 'scheduled' },
              { value: 'released', label: 'released' },
            ],
          },
        ]}
      />
      <span data-testid="current-value">{value}</span>
    </Dialog>
  )
}

describe('Select nested inside an open Dialog', () => {
  test('an option is actually clickable, not intercepted by the Dialog overlay', async () => {
    render(<DialogWithSelect />)

    // `page` (Vitest's browser-mode locator API, backed by this project's
    // real Playwright provider) does real actionability checks — visible,
    // stable, and not obscured by another element at its click point —
    // the same way Playwright's own `page.click()` does in Ajar's actual
    // e2e suite. Plain `@testing-library/user-event` dispatches directly on
    // the target's DOM reference with no hit-testing, so it can't catch
    // this class of bug at all — confirmed empirically: it passed here even
    // against the unfixed CSS.
    await page.getByRole('combobox', { name: 'Release state' }).click()
    await page.getByRole('option', { name: 'scheduled', exact: true }).click()

    await expect.element(page.getByTestId('current-value')).toHaveTextContent('scheduled')
  })
})
