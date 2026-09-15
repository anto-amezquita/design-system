/**
 * Contract test: Dialog/Drawer's title still wires up correctly to Radix's
 * aria-labelledby after the Heading migration (docs/backlog.md,
 * 2026-09-15) — BaseSheet.tsx now renders `<RadixDialog.Title asChild>`
 * around `<Heading level={4} as="h2">` instead of letting RadixDialog.Title
 * render its own element directly.
 *
 * This is exactly the risk shape decisions/0006 was written for: Radix's
 * `asChild`/`Slot` composition only works if the composed child actually
 * forwards the injected `id` (and ref) through to a real DOM node — Button
 * silently dropped injected props before that fix, and nothing caught it
 * until a real consumer hit it. Heading is `forwardRef` and spreads
 * `...rest` (confirmed by reading the source), so this should already
 * work — this test exists so a future narrowing of Heading's prop types
 * (the same shape of change 0006 made to Button/Badge/Checkbox/Textarea)
 * can't silently break the dialog's accessible name without a red test.
 */

import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dialog } from '../Dialog'
import { Drawer } from '../Drawer'

describe('Dialog/Drawer title composed via Heading (asChild)', () => {
  test('Dialog content aria-labelledby resolves to the real title element', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Confirm action">
        <p>Body</p>
      </Dialog>
    )

    const content = screen.getByRole('dialog')
    const title = screen.getByRole('heading', { name: 'Confirm action' })

    expect(title.tagName).toBe('H2')
    expect(title).toHaveClass('heading', 'heading--h4', 'dialog__title')
    expect(content).toHaveAttribute('aria-labelledby', title.id)
    expect(title.id).toBeTruthy()
  })

  test('Drawer content aria-labelledby resolves to the real title element', () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Settings">
        <p>Body</p>
      </Drawer>
    )

    const content = screen.getByRole('dialog')
    const title = screen.getByRole('heading', { name: 'Settings' })

    expect(title.tagName).toBe('H2')
    expect(title).toHaveClass('heading', 'heading--h4', 'drawer__title')
    expect(content).toHaveAttribute('aria-labelledby', title.id)
    expect(title.id).toBeTruthy()
  })
})
