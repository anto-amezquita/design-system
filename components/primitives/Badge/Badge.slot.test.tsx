/**
 * Contract test: Badge must survive Radix `asChild` composition, the same
 * contract decisions/0006 established for Button and decisions/0007 extends
 * to every primitive.
 *
 * A real external consumer (Ajar, decisions/0030 in that repo) used Badge as
 * a Dialog's `trigger` — a styled status pill that doubles as the disclosure
 * control. Badge had no ref and no prop spread, so `Dialog.Trigger asChild`'s
 * cloned `onClick` and ref never reached the rendered `<span>`: the dialog
 * never opened. Confirmed via a render spike before this fix (Ajar's
 * decisions/0030, "third exception"); this test is that spike, kept.
 */

import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from './Badge'
import { Dialog } from '../../composition/Dialog'

describe('Badge inside Radix Dialog.Trigger (asChild)', () => {
  test('clicking a Badge trigger opens the dialog', async () => {
    const user = userEvent.setup()
    render(
      <Dialog trigger={<Badge aria-label="Ajar: Ajar">Ajar</Badge>} title="Door">
        <p>content</p>
      </Dialog>,
    )

    await user.click(screen.getByText('Ajar'))
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  test('Badge receives the trigger ARIA contract', () => {
    render(
      <Dialog trigger={<Badge aria-label="Ajar: Ajar">Ajar</Badge>} title="Door">
        <p>content</p>
      </Dialog>,
    )

    const trigger = screen.getByText('Ajar')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })
})
