/**
 * Contract test: Button must survive Radix `asChild` composition.
 *
 * Radix's Slot clones its child and injects the props that make a trigger a
 * trigger — `aria-haspopup`, `aria-expanded`, `aria-controls`, `data-state`.
 * Button destructures only its own declared props and never spreads the rest
 * onto the rendered element, so today those attributes are silently dropped:
 * the button renders, it opens the Dialog, and a screen reader user is never
 * told it is a disclosure control at all. Nothing throws, and the rendered
 * pixels are identical either way — which is exactly why Chromatic could
 * never have caught this.
 *
 * The plain-<button> case below is the control. It proves the gap is Button's
 * missing prop spread and not something about Radix or this test's setup: same
 * Dialog, same Trigger, same assertions, passing.
 *
 * Expected state when written: the plain-<button> test PASSES and the Button
 * test FAILS. See decisions/00XX (Button prop passthrough) — this file is the
 * red state that ADR was written against.
 */

import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import { Dialog } from '../../composition/Dialog'

function DialogWith({ trigger }: { trigger: React.ReactElement }) {
  return (
    <Dialog trigger={trigger} title="Confirm">
      Body content
    </Dialog>
  )
}

describe('Button inside Radix Dialog.Trigger (asChild)', () => {
  // Control: establishes what Radix injects, with a child that spreads freely.
  test('a plain <button> receives the trigger ARIA contract', () => {
    render(<DialogWith trigger={<button type="button">Open</button>} />)

    const trigger = screen.getByRole('button', { name: 'Open' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })

  // The real assertion. Fails until Button spreads unrecognised props.
  test('Button receives the trigger ARIA contract', () => {
    render(<DialogWith trigger={<Button>Open</Button>} />)

    const trigger = screen.getByRole('button', { name: 'Open' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })
})
