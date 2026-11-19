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

import { createRef } from 'react'
import { describe, expect, test, vi } from 'vitest'
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

  test('role is rejected at compile time, not silently overridden at runtime', () => {
    // Code review (2026-09-14): widening to HTMLAttributes<HTMLSpanElement>
    // admitted `role` too, but Badge always computes its own role (line
    // 47/53) after spreading ...rest, so a passed role was silently
    // discarded. This @ts-expect-error line is the actual assertion — if
    // `role` stops erroring (someone widens the Omit list back), typecheck
    // fails here.
    // @ts-expect-error - Badge computes its own role, doesn't accept one
    const element = <Badge aria-label="3 unread" role="status">3</Badge>
    void element
  })
})

// G2 (Ajar's DoorBadge): the span above opens on click, but a keyboard can't
// reach it. as="button" is the trigger a keyboard can use.
describe('Badge as="button" inside Radix Dialog.Trigger (asChild)', () => {
  const door = (
    <Dialog trigger={<Badge as="button" variant="warning">Ajar</Badge>} title="Door">
      <p>content</p>
    </Dialog>
  )

  test('renders a real button that takes the trigger contract', () => {
    render(door)
    const trigger = screen.getByRole('button', { name: 'Ajar' })
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('data-state', 'closed')
    expect(trigger).not.toHaveAttribute('role')
    expect(trigger).not.toHaveAttribute('as')
  })

  test('the keyboard opens the dialog, and Escape gives focus back to the badge', async () => {
    const user = userEvent.setup()
    render(door)
    await user.tab()
    const trigger = screen.getByRole('button', { name: 'Ajar' })
    expect(trigger).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(screen.queryByText('content')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  test('forwards its ref as the button, and Dialog\'s triggerRef gets it too', () => {
    const ref = createRef<HTMLElement>()
    const triggerRef = createRef<HTMLButtonElement>()
    render(
      <>
        <Badge as="button" ref={ref}>Open</Badge>
        <Dialog trigger={<Badge as="button">Door</Badge>} triggerRef={triggerRef} title="Door"><p>x</p></Dialog>
      </>,
    )
    expect(ref.current?.tagName).toBe('BUTTON')
    expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Door' }))
  })

  test('never submits the form it sits in', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(<form onSubmit={onSubmit}><Badge as="button" onClick={() => {}}>Ajar</Badge></form>)
    await user.click(screen.getByRole('button', { name: 'Ajar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('a count can be a button; a dot can\'t, at compile time', () => {
    render(<Badge as="button" shape="count" aria-label="3 unread messages">3</Badge>)
    expect(screen.getByRole('button', { name: '3 unread messages' })).toHaveClass('badge--count', 'badge--button')
    // @ts-expect-error - a dot's 8px target is too small to be a button
    const dot = <Badge as="button" shape="dot" aria-label="Online" />
    void dot
  })
})
