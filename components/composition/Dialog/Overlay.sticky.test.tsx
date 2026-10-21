/**
 * Contract test: an overlay paints above a page's sticky layer. A sticky
 * site header or TopNav sets z-index --z-sticky (100), and overlays with
 * z-index:auto painted under it: the Drawer's top, its title and Close
 * button, sat behind the docs site's header, and the Dialog's overlay left
 * the header undimmed and clickable (found on design.amezquita.dk,
 * 2026-10-21). decisions/0027 gives every portalled layer one shared value,
 * --z-overlay; ties still resolve by mount order (Select.nesting.test.tsx,
 * Dialog.nesting.test.tsx, Menu.nesting.test.tsx).
 *
 * Real hit-testing through `vitest/browser`'s `page` locator, as the
 * nesting tests do: a click on a control under another layer fails
 * Playwright's actionability check instead of passing silently.
 */

import { afterEach, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { page } from 'vitest/browser'
import '../../../styles/brands/base-light.css'
import { Drawer } from '../Drawer'
import { Dialog } from './Dialog'

afterEach(() => {
  cleanup()
  document.querySelectorAll('body > header').forEach(h => h.remove())
})

/**
 * A full-width bar fixed to the top at the sticky layer, like a site
 * header. Put straight into <body>, as a real header sits, not in the test's
 * render container: a container that forms its own stacking context would
 * trap the header's z-index and hide the bug.
 */
function addStickyHeader() {
  const header = document.createElement('header')
  // pointer-events: auto because a modal sets pointer-events: none on <body>,
  // which the header would inherit: hit-testing (elementFromPoint, a real
  // click) would then pass through it and miss what's painted on top.
  header.setAttribute('style', 'position: fixed; inset-block-start: 0; inset-inline: 0; block-size: 160px; z-index: var(--z-sticky); background: white; pointer-events: auto')
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Header action'
  button.setAttribute('style', 'margin-inline-start: 40%; margin-block-start: 60px')
  header.append(button)
  document.body.prepend(header)
  return header
}

/** The element painted on top at the centre of an element. */
function topmostAt(el: Element) {
  const r = el.getBoundingClientRect()
  return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
}

describe('overlays paint above the page\'s sticky layer', () => {
  test('a Drawer\'s Close button under a sticky header is clickable', async () => {
    addStickyHeader()
    render(<Drawer defaultOpen title="Filters">Narrow the list.</Drawer>)
    await page.getByRole('button', { name: 'Close drawer' }).click({ timeout: 3000 })
    await expect.poll(() => document.querySelector('.drawer__content')).toBeNull()
  })

  test('a Dialog\'s overlay covers the sticky header', async () => {
    const header = addStickyHeader()
    render(<Dialog defaultOpen title="Rename project" trigger={<button type="button">Rename</button>}>Body</Dialog>)
    await expect.poll(() => document.querySelector('.dialog__overlay')).not.toBeNull()
    expect(topmostAt(header.querySelector('button')!)?.closest('.dialog__overlay')).not.toBeNull()
  })
})
