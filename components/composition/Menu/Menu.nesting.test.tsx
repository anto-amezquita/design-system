/**
 * Contract test: a Menu opened inside an open Dialog is clickable — its panel
 * paints above the Dialog's overlay, and choosing an item actually runs it.
 *
 * Same shape as Select.nesting.test.tsx (decisions/0007): the Menu panel has
 * no z-index and relies on portal mount order, so this is the test that would
 * catch someone "fixing" a layering problem elsewhere with a z-index on Menu
 * or Dialog. `page` does real actionability checks (visible, not covered at
 * the click point); a synthetic event dispatched on the element couldn't
 * catch this class of bug.
 */

import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from 'vitest/browser'
// Real token values, so any z-index in play resolves to a real number —
// see Select.nesting.test.tsx for why the test is meaningless without them.
import '../../../styles/brands/base-light.css'
import { Button } from '../../primitives/Button'
import { Dialog } from '../Dialog'
import { Menu } from './Menu'

function DialogWithMenu() {
  const [last, setLast] = useState('none')
  return (
    <Dialog defaultOpen title="Track">
      <Menu
        trigger={<Button variant="secondary">Track actions</Button>}
        groups={[
          {
            items: [
              { id: 'rename', label: 'Rename', onSelect: () => setLast('rename') },
              { id: 'move', label: 'Move', onSelect: () => setLast('move') },
            ],
          },
          { items: [{ id: 'delete', label: 'Delete', variant: 'destructive', onSelect: () => setLast('delete') }] },
        ]}
      />
      <span data-testid="last">{last}</span>
    </Dialog>
  )
}

describe('Menu nested inside an open Dialog', () => {
  test('an item is actually clickable, not intercepted by the Dialog overlay', async () => {
    render(<DialogWithMenu />)

    await page.getByRole('button', { name: 'Track actions' }).click()
    await page.getByRole('menuitem', { name: 'Move' }).click()

    await expect.element(page.getByTestId('last')).toHaveTextContent('move')
    // Choosing an item closes the menu and leaves the Dialog open.
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument()
    await expect.element(page.getByRole('dialog', { name: 'Track' })).toBeVisible()
  })

  test('keyboard: Enter opens, arrows move, Escape closes and returns focus to the trigger', async () => {
    render(<DialogWithMenu />)
    const trigger = page.getByRole('button', { name: 'Track actions' })

    ;(trigger.element() as HTMLElement).focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    await expect.element(page.getByRole('menuitem', { name: 'Move' })).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument()
    await expect.element(trigger).toHaveFocus()
    // Escape closed only the Menu, not the Dialog around it.
    await expect.element(page.getByRole('dialog', { name: 'Track' })).toBeVisible()
  })

  test('groups with the same label (or none) render without duplicate-key warnings', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Menu
        defaultOpen
        trigger={<Button variant="secondary">Dup</Button>}
        groups={[
          { label: 'Same', items: [{ id: 'a', label: 'A' }] },
          { label: 'Same', items: [{ id: 'b', label: 'B' }] },
          { items: [{ id: 'c', label: 'C' }] },
        ]}
      />,
    )
    await expect.element(page.getByRole('menuitem', { name: 'B' })).toBeVisible()
    expect(error.mock.calls.some(call => String(call[0]).includes('same key'))).toBe(false)
    error.mockRestore()
  })
})
