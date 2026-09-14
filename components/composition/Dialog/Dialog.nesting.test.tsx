/**
 * Contract test: an AlertDialog opened while a Drawer is already open must
 * be clickable — its own content must paint above the Drawer's, not behind
 * it, regardless of which opened first.
 *
 * Found by code review on the PR that fixed the same bug for Select inside
 * Dialog (decisions/0007): before that fix, .dialog__content and
 * .drawer__content were both explicitly z-index:400 — a tie, correctly
 * resolved by DOM/mount order. That PR dropped Dialog's z-index to auto but
 * initially left Drawer's untouched, so Drawer always outranked Dialog/
 * AlertDialog afterward, regardless of order — the exact bug class the PR
 * set out to fix, reintroduced for a different pair. Both now leave z-index
 * unset (see Dialog.css/Drawer.css).
 *
 * The Drawer is opened first and the AlertDialog only afterward, via a real
 * click — not both mounted in one initial render. Mounting both in the same
 * commit trips a separate, real Radix/aria-hidden bookkeeping edge case
 * (two modal roots hiding-others in the same effect flush can end up
 * marking each other's container aria-hidden, including the topmost one's
 * own) that isn't the bug under test and doesn't reflect how this actually
 * happens in a real app: a Drawer opens, sits there, and *then* something
 * inside it (e.g. a delete button) opens a confirmation later.
 *
 * Runs in a real browser via `vitest/browser`'s `page` locator API (real
 * Playwright actionability checks), not `@testing-library/user-event` —
 * confirmed elsewhere in this PR (Select.nesting.test.tsx) that user-event's
 * .click() doesn't do real hit-testing and would pass regardless of the bug.
 */

import { useState } from 'react'
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import '../../../styles/brands/base-light.css'
import { Drawer } from '../Drawer'
import { AlertDialog } from '../AlertDialog'

function DrawerWithDeleteConfirm() {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Drawer defaultOpen title="Settings">
        <button type="button" onClick={() => setConfirmOpen(true)}>
          Delete
        </button>
      </Drawer>
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Discard changes?"
        cancel={<button type="button">Cancel</button>}
        action={<button type="button">Discard</button>}
      />
    </>
  )
}

describe('AlertDialog opened from inside an already-open Drawer', () => {
  test('the AlertDialog action button is actually clickable, not painted behind the Drawer', async () => {
    render(<DrawerWithDeleteConfirm />)

    await page.getByRole('button', { name: 'Delete' }).click()

    // The real assertion: this click must land on the AlertDialog's own
    // button, not be swallowed by the Drawer's content/overlay sitting on
    // top of it.
    await page.getByRole('button', { name: 'Discard' }).click()
  })
})
