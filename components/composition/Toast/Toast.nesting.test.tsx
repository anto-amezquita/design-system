/**
 * Contract test: a Toast shown while a Dialog is open must still (1) not be
 * painted behind the Dialog's overlay, and (2) still get its message to
 * screen reader users.
 *
 * docs/backlog.md "Confirm: Toast/Tooltip don't have the Select-in-Dialog
 * z-index bug" originally asked whether Toast's close button stays
 * `getByRole`-reachable while a Dialog is open, the same way Select's
 * dropdown option had to stay clickable inside an open Dialog
 * (decisions/0007). It doesn't, but not for the z-index reason that bug
 * report worried about — investigated and confirmed:
 *
 * - A real pixel-coordinate click on `.toast__close` (bypassing role-based
 *   lookup, clicking the actual DOM node directly) lands immediately, no
 *   Playwright actionability timeout. Nothing is painted over the toast —
 *   `--z-toast` does its job, same as the backlog reasoned.
 * - What actually happens: Radix Dialog's focus trap calls the `aria-hidden`
 *   package's `hideOthers()` on mount, which marks *everything outside the
 *   modal* `aria-hidden` for the accessibility tree — not something specific
 *   to Toast, the same thing that happens to a nav bar button or any other
 *   control outside an open dialog. That's the standard WAI-ARIA modal
 *   pattern, confirmed against Radix's own maintainers discussing this exact
 *   case for Toast (https://github.com/radix-ui/primitives/issues/1171):
 *   "since toasts shouldn't require user response, accessing the viewport
 *   isn't essential." Radix's Toast already routes around it for the part
 *   that matters — `ToastAnnounce` (components/composition/Toast/Toast.tsx
 *   via @radix-ui/react-toast) portals a hidden `aria-live` region straight
 *   to `document.body`, outside the hidden subtree, so the toast's message
 *   still reaches screen readers even while its visual close button doesn't.
 *
 * So the right assertion isn't "the close button stays `getByRole`-reachable
 * while a modal has focus trap" (true of nothing outside any modal,
 * anywhere) — it's the two things actually guaranteed: the click still lands
 * pixel-for-pixel, and the message still gets announced.
 *
 * Runs in a real browser via `vitest/browser`'s `page` locator (real
 * Playwright actionability checks), not `@testing-library/user-event`, which
 * dispatches directly on the DOM node with no hit-testing and would pass
 * here regardless of whether Toast is actually painted on top.
 */

import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
// The `unit` Vitest project loads no brand CSS by default — without this,
// `z-index: var(--z-toast)` never resolves to a real number, so the pixel
// click below would prove nothing about the real bug either way.
import '../../../styles/brands/base-light.css'
import { Dialog } from '../Dialog'
import { ToastProvider, useToast } from './Toast'

function DialogWithToastTrigger() {
  const { toast } = useToast()
  return (
    <Dialog defaultOpen title="Rights profile">
      <button
        type="button"
        onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.' })}
      >
        Save
      </button>
    </Dialog>
  )
}

describe('Toast shown while a Dialog is open', () => {
  test("a real pixel click on the toast's close button still lands, not intercepted by the Dialog overlay", async () => {
    render(
      <ToastProvider>
        <DialogWithToastTrigger />
      </ToastProvider>,
    )

    await page.getByRole('button', { name: 'Save' }).click()

    // Deliberately not `getByRole` here: Radix Dialog's focus trap marks
    // everything outside the modal `aria-hidden`, which removes the toast
    // from the accessibility tree (see docblock) — expected, not the bug
    // under test. `elementLocator` on the real DOM node still exercises a
    // real Playwright actionability check (visible, stable, not obscured by
    // whatever's painted on top of it at that pixel) without going through
    // the now-hidden accessible role.
    const closeButton = document.querySelector<HTMLButtonElement>('.toast__close')
    expect(closeButton).not.toBeNull()
    await page.elementLocator(closeButton!).click()
  })

  test("the toast's message still reaches screen readers via its own aria-live announcer, independent of the Dialog's focus trap", async () => {
    render(
      <ToastProvider>
        <DialogWithToastTrigger />
      </ToastProvider>,
    )

    await page.getByRole('button', { name: 'Save' }).click()

    // Radix's own live-region announcer (@radix-ui/react-toast's
    // ToastAnnounce) is portalled straight to document.body, outside the
    // subtree the Dialog's hideOthers() call hides — that's what actually
    // gets the toast's content to a screen reader while a Dialog is open,
    // not the visual close button. `role="status"` on that node is real and
    // un-hidden, so it stays reachable via `getByRole`.
    await expect.element(page.getByRole('status')).toHaveTextContent('Saved')
  })
})
