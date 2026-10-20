/**
 * Popover: a named, non-modal dialog. The trigger says it's expanded and
 * what it controls; focus moves in on open and back on close; Escape and a
 * click outside close it; it follows a dark ThemeScope into its portal.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './Popover'
import { Button } from '../../primitives/Button'
import { ThemeScope } from '../ThemeScope'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark
  document.head.append(style)
})

afterEach(cleanup)

const example = (extra: React.ReactNode = null) => (
  <>
    <p>Page text</p>
    <Popover>
      <PopoverTrigger asChild><Button variant="secondary">Filters</Button></PopoverTrigger>
      <PopoverContent title="Filters" showClose>
        <input aria-label="Owner" />
        <PopoverClose asChild><Button>Apply</Button></PopoverClose>
      </PopoverContent>
    </Popover>
    {extra}
  </>
)

const dialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null

describe('Popover', () => {
  test('the trigger opens a named dialog and says so', async () => {
    const { getByRole } = render(example())
    const trigger = getByRole('button', { name: 'Filters' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(trigger)
    await expect.poll(dialog).not.toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(dialog()!.id)
    const name = document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent
    expect(name).toBe('Filters')
  })

  test('focus moves in on open and back to the trigger on Escape', async () => {
    const { getByRole } = render(example())
    const trigger = getByRole('button', { name: 'Filters' })
    await userEvent.click(trigger)
    await expect.poll(() => dialog()?.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(dialog).toBeNull()
    // Radix returns focus just after the content unmounts, so wait for it:
    // under a full test run's load the synchronous check lost that race.
    await expect.poll(() => document.activeElement).toBe(trigger)
  })

  test('a click outside closes it', async () => {
    const { getByRole, getByText } = render(example())
    await userEvent.click(getByRole('button', { name: 'Filters' }))
    await expect.poll(dialog).not.toBeNull()
    await userEvent.click(getByText('Page text'))
    await expect.poll(dialog).toBeNull()
  })

  test('PopoverClose and the close button close it', async () => {
    const { getByRole } = render(example())
    const inDialog = (name: string) =>
      Array.from(dialog()?.querySelectorAll('button') ?? []).find(b => (b.getAttribute('aria-label') ?? b.textContent) === name)!
    await userEvent.click(getByRole('button', { name: 'Filters' }))
    await expect.poll(dialog).not.toBeNull()
    await userEvent.click(inDialog('Close'))
    await expect.poll(dialog).toBeNull()
    await userEvent.click(getByRole('button', { name: 'Filters' }))
    await expect.poll(dialog).not.toBeNull()
    await userEvent.click(inDialog('Apply'))
    await expect.poll(dialog).toBeNull()
  })

  test('follows a dark ThemeScope into the portal', async () => {
    const { getByRole } = render(
      <ThemeScope mode="dark">
        <Popover defaultOpen>
          <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
          <PopoverContent aria-label="Panel">Inside</PopoverContent>
        </Popover>
      </ThemeScope>,
    )
    await expect.poll(dialog).not.toBeNull()
    expect(dialog()!.getAttribute('data-mode')).toBe('dark')
    expect(getByRole('button', { name: 'Open' })).toBeTruthy()
  })
})
