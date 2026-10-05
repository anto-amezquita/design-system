/**
 * ThemeScope: overlays opened inside it take its brand and mode, although
 * they portal to the end of <body> (decisions/0021,
 * specs/2026-10-05-theme-scope.md item 3). Runs in Chromium with the real
 * brand CSS, so the cascade decides, as in lib/brand-scope.test.ts.
 *
 * Each overlay's portalled content is compared with a probe styled by the
 * same CSS: a `<div data-brand="portfolio" data-mode="dark">` for the scoped
 * case, a bare `<div>` on the light page for base light. Found by
 * design-system-site, whose Themes page opened a Menu in its portfolio panel
 * and got a base-styled popover.
 */

import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { page, userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolioScoped from '../../../styles/brands/portfolio-scoped.css?raw'
import { Button } from '../../primitives/Button'
import { Select } from '../../primitives/Select'
import { AlertDialog } from '../AlertDialog'
import { Dialog } from '../Dialog'
import { Drawer } from '../Drawer'
import { Menu } from '../Menu'
import { Tooltip, TooltipProvider } from '../Tooltip'
import { ThemeScope } from './ThemeScope'

const VARS = ['--color-accent-default', '--color-surface-primary', '--color-text-primary', '--font-family-base']

function tokens(el: Element) {
  const style = getComputedStyle(el)
  return Object.fromEntries(VARS.map(v => [v, style.getPropertyValue(v).trim()]))
}

/** Tokens a probe element gets from the loaded CSS, with these attributes. */
function probe(attributes: Record<string, string>) {
  const el = document.createElement('div')
  Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v))
  document.body.append(el)
  const values = tokens(el)
  el.remove()
  return values
}

async function find(selector: string) {
  await expect.poll(() => document.querySelector(selector)).not.toBeNull()
  return document.querySelector(selector)!
}

let style: HTMLStyleElement
beforeEach(() => {
  style = document.createElement('style')
  style.textContent = [baseLight, baseDark, portfolioScoped].join('\n')
  document.head.append(style)
  delete document.documentElement.dataset.mode // a light page
})
afterEach(() => {
  cleanup()
  style.remove()
})

const menu = <Menu open trigger={<Button>More</Button>} groups={[{ items: [{ id: 'a', label: 'Archive', onSelect: () => {} }] }]} />

describe('overlays opened inside <ThemeScope brand="portfolio" mode="dark"> on a light page', () => {
  const scoped = () => probe({ 'data-brand': 'portfolio', 'data-mode': 'dark' })

  test('Menu', async () => {
    render(<ThemeScope brand="portfolio" mode="dark">{menu}</ThemeScope>)
    expect(tokens(await find('.menu'))).toEqual(scoped())
  })

  test('Select', async () => {
    render(
      <ThemeScope brand="portfolio" mode="dark">
        <Select aria-label="Theme" groups={[{ options: [{ value: 'base', label: 'Base' }] }]} />
      </ThemeScope>,
    )
    await userEvent.click(page.getByRole('combobox', { name: 'Theme' }))
    expect(tokens(await find('.select__content'))).toEqual(scoped())
  })

  test('Tooltip', async () => {
    render(
      <TooltipProvider>
        <ThemeScope brand="portfolio" mode="dark">
          <Tooltip open content="Saved">
            <Button>Save</Button>
          </Tooltip>
        </ThemeScope>
      </TooltipProvider>,
    )
    expect(tokens(await find('.tooltip'))).toEqual(scoped())
  })

  test('AlertDialog, overlay and content', async () => {
    render(
      <ThemeScope brand="portfolio" mode="dark">
        <AlertDialog open onOpenChange={() => {}} title="Delete?" cancel={<Button>Cancel</Button>} action={<Button>Delete</Button>} />
      </ThemeScope>,
    )
    expect(tokens(await find('[role="alertdialog"]'))).toEqual(scoped())
    expect(tokens(await find('.dialog__overlay'))).toEqual(scoped())
  })

  test('Dialog', async () => {
    render(
      <ThemeScope brand="portfolio" mode="dark">
        <Dialog defaultOpen title="Track">Body</Dialog>
      </ThemeScope>,
    )
    expect(tokens(await find('[role="dialog"]'))).toEqual(scoped())
  })

  test('Drawer', async () => {
    render(
      <ThemeScope brand="portfolio" mode="dark">
        <Drawer defaultOpen title="Filters">Body</Drawer>
      </ThemeScope>,
    )
    expect(tokens(await find('[role="dialog"]'))).toEqual(scoped())
  })
})

describe('scoping rules', () => {
  test('outside any scope, an overlay stays on the page’s brand and mode', async () => {
    render(menu)
    const content = await find('.menu')
    expect(content.hasAttribute('data-brand')).toBe(false)
    expect(content.hasAttribute('data-mode')).toBe(false)
    expect(tokens(content)).toEqual(probe({}))
  })

  test('a mode-only scope gives base in that mode', async () => {
    render(<ThemeScope mode="dark">{menu}</ThemeScope>)
    expect(tokens(await find('.menu'))).toEqual(probe({ 'data-mode': 'dark' }))
  })

  test('a nested scope takes what it doesn’t set from the outer one', async () => {
    render(
      <ThemeScope brand="portfolio">
        <ThemeScope mode="dark">{menu}</ThemeScope>
      </ThemeScope>,
    )
    const content = await find('.menu')
    expect(content.getAttribute('data-brand')).toBe('portfolio')
    expect(content.getAttribute('data-mode')).toBe('dark')
    expect(tokens(content)).toEqual(probe({ 'data-brand': 'portfolio', 'data-mode': 'dark' }))
  })

  test('the scope itself carries only what it sets, and passes native attributes through', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ThemeScope ref={ref} mode="dark" className="panel" id="p">Hi</ThemeScope>)
    expect(ref.current?.dataset.mode).toBe('dark')
    expect(ref.current?.hasAttribute('data-brand')).toBe(false)
    expect(ref.current?.className).toBe('panel')
    expect(ref.current?.id).toBe('p')
  })
})
