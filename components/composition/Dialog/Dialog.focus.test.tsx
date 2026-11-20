/**
 * Where focus goes when a Dialog or Drawer closes (hooks/useSheetFocusRestore).
 *
 * With a trigger, back to the trigger, as Radix does. With no trigger — a
 * controlled sheet opened from an Item row, a menu item, a shortcut — Radix
 * focuses the trigger it doesn't have and focus fell to <body>. Found while
 * building Item's onClick (G3, Ajar's rows that open a Dialog): focus now goes
 * back to whatever had it when the sheet opened, modal or not.
 */

import { useState } from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import { Dialog } from './Dialog'
import { Drawer } from '../Drawer'

afterEach(cleanup)

const sheets = { Dialog, Drawer } as const

describe.each(Object.keys(sheets) as (keyof typeof sheets)[])('%s focus on close', name => {
  const Sheet = sheets[name]

  function Controlled({ modal, removeOpener = false }: { modal?: boolean; removeOpener?: boolean }) {
    const [open, setOpen] = useState(false)
    return (
      <>
        {!(removeOpener && open) && <button type="button" onClick={() => setOpen(true)}>Open</button>}
        <Sheet open={open} onOpenChange={setOpen} title="Sheet" modal={modal}><p>content</p></Sheet>
      </>
    )
  }

  async function openAndClose(getByRole: (role: string, o: { name: string }) => HTMLElement, queryByText: (t: string) => HTMLElement | null) {
    getByRole('button', { name: 'Open' }).focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => queryByText('content')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => queryByText('content')).toBeNull()
  }

  test.each([true, false])('no trigger, modal=%s: back to what opened it', async modal => {
    const { getByRole, queryByText } = render(<Controlled modal={modal} />)
    const opener = getByRole('button', { name: 'Open' })
    await openAndClose(getByRole, queryByText)
    await expect.poll(() => document.activeElement).toBe(opener)
  })

  test('with a trigger: back to the trigger, as before', async () => {
    const { getByRole, queryByText } = render(
      <Sheet trigger={<button type="button">Trigger</button>} title="Sheet"><p>content</p></Sheet>,
    )
    const trigger = getByRole('button', { name: 'Trigger' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => queryByText('content')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => queryByText('content')).toBeNull()
    await expect.poll(() => document.activeElement).toBe(trigger)
  })

  test('an opener that is gone by then is left alone', async () => {
    const { getByRole, queryByText } = render(<Controlled removeOpener />)
    await openAndClose(getByRole, queryByText)
    expect(document.activeElement).not.toBeNull()
  })
})
