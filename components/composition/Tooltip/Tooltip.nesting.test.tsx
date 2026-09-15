/**
 * Contract test: a Tooltip triggered from an element inside an open Dialog
 * must paint above the Dialog, not behind it.
 *
 * docs/backlog.md "Confirm: Toast/Tooltip don't have the Select-in-Dialog
 * z-index bug": Tooltip keeps an explicit z-index (--z-tooltip, 600 in
 * tokens/brands/base/light.json) — the highest value in the whole scale —
 * while Dialog's overlay/content are `auto` post-decisions/0007, so Tooltip
 * should always outrank Dialog regardless of mount/trigger order. This test
 * exists to confirm that reasoning against real Radix/browser behavior
 * instead of trusting the numbers alone.
 *
 * The trigger lives inside the Dialog's own content (the realistic shape —
 * e.g. a truncated label with a tooltip, inside a dialog), and the Tooltip
 * is opened via a real hover, not `open`/`defaultOpen`, so the test exercises
 * the actual pointer-driven path.
 *
 * The tooltip content below contains a real interactive element and the test
 * clicks it — not just an `toBeVisible()` check. `toBeVisible()` only checks
 * bounding box / CSS visibility, not occlusion, so it would pass even if the
 * tooltip were painted behind the Dialog's overlay. Only a real click, with
 * Playwright's actionability check (element must actually receive the
 * pointer event, not be obscured by whatever's on top of it at that point),
 * proves nothing is painted over the tooltip — the same reasoning
 * Select.nesting.test.tsx documents for the original Select-in-Dialog bug.
 * A plain text tooltip is the normal usage (see Tooltip.stories.tsx); the
 * interactive content here is a test-only device to make the click
 * meaningful, not a usage recommendation.
 *
 * Runs in a real browser via `vitest/browser`'s `page` locator, not
 * `@testing-library/user-event`, which dispatches directly on the DOM node
 * with no hit-testing.
 */

import { useState } from 'react'
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
// The `unit` Vitest project loads no brand CSS by default — without this,
// `z-index: var(--z-tooltip)` never resolves to a real number, so the test
// would pass regardless of whether Tooltip actually outranks Dialog.
import '../../../styles/brands/base-light.css'
import { Dialog } from '../Dialog'
import { Tooltip, TooltipProvider } from './Tooltip'

function DialogWithTooltip() {
  const [clicked, setClicked] = useState(false)
  return (
    <TooltipProvider>
      <Dialog defaultOpen title="Rights profile">
        <Tooltip
          content={
            <button type="button" onClick={() => setClicked(true)}>
              {clicked ? 'clicked' : 'tooltip action'}
            </button>
          }
        >
          <button type="button">Copy</button>
        </Tooltip>
      </Dialog>
    </TooltipProvider>
  )
}

describe('Tooltip triggered from inside an open Dialog', () => {
  test('the tooltip content is visible and actually clickable, not painted behind the Dialog', async () => {
    render(<DialogWithTooltip />)

    await page.getByRole('button', { name: 'Copy' }).hover()

    const tooltipAction = page.getByRole('button', { name: 'tooltip action' })
    await expect.element(tooltipAction).toBeVisible()

    // The real assertion: this click must land on the tooltip's own button,
    // not be swallowed by the Dialog's overlay/content sitting on top of it.
    await tooltipAction.click()

    await expect.element(page.getByRole('button', { name: 'clicked' })).toBeVisible()
  })
})
