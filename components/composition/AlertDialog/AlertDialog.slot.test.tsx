/**
 * Contract test: AlertDialog.Cancel/Action must work correctly composed with
 * Button via asChild, now that Button.tsx forwards unrecognised props (see
 * ../Button/Button.slot.test.tsx and decisions/0006).
 *
 * This isn't a red/green test the way Button's was — Button was already
 * fixed before this file was written, so there's no defect here to catch
 * mid-fix. It exists because AlertDialog.stories.tsx previously carried a
 * comment instructing consumers to use a plain <button> instead of <Button>,
 * reasoning the design system's own Button "does not forward a ref." That
 * claim was inaccurate on its own terms (Button has always forwarded a real
 * ref via forwardRef + useImperativeHandle) and, after the asChild prop-
 * spreading fix, is stale in the way that mattered: nothing was actually
 * verifying the composition worked before this file existed. This is that
 * verification, not a demonstration of a fix.
 *
 * Two contracts checked, matching what the stories' own JSDoc claimed
 * mattered: Radix auto-focuses Cancel on open (needs a real DOM ref), and a
 * consumer's onClick on Action still fires (needs the composed handler to
 * reach the actual element).
 */

import { describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlertDialog } from './AlertDialog'
import { Button } from '../../primitives/Button'

function OpenAlertDialog({ onAction }: { onAction: () => void }) {
  return (
    <AlertDialog
      open
      onOpenChange={() => {}}
      title="Delete this item?"
      cancel={<Button variant="secondary">Cancel</Button>}
      action={<Button onClick={onAction}>Delete</Button>}
    />
  )
}

describe('AlertDialog.Cancel/Action composed with Button (asChild)', () => {
  test('Radix auto-focuses the Button rendered as Cancel', async () => {
    render(<OpenAlertDialog onAction={() => {}} />)

    const cancel = screen.getByRole('button', { name: 'Cancel' })
    // Radix's auto-focus runs after its own mount effects, not synchronously
    // with render — same reason Dialog's own focus-restore behavior needs a
    // wait in its tests.
    await waitFor(() => expect(cancel).toHaveFocus())
  })

  test("a consumer's onClick on the Button rendered as Action still fires", async () => {
    const onAction = vi.fn()
    render(<OpenAlertDialog onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onAction).toHaveBeenCalledOnce()
  })
})
