/**
 * HoverCard: a preview on hover or keyboard focus. Opens after a delay,
 * stays while the pointer is over it, closes after a grace time; a touch
 * doesn't open it; Escape closes; Tab moves into it and on past it.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const card = () => document.querySelector('.hover-card')
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

function Example(props: Partial<React.ComponentProps<typeof HoverCard>>) {
  return (
    <p>
      <a href="#before">Before</a>{' '}
      <HoverCard openDelay={40} closeDelay={40} {...props}>
        <HoverCardTrigger><a href="#ana">@ana</a></HoverCardTrigger>
        <HoverCardContent aria-label="Ana Quispe">
          <a href="#profile">View profile</a> <button>Follow</button>
        </HoverCardContent>
      </HoverCard>{' '}
      <a href="#after">After</a>
    </p>
  )
}

describe('HoverCard', () => {
  test('the trigger keeps its own role and name', () => {
    const { getByRole } = render(<Example />)
    const link = getByRole('link', { name: '@ana' })
    expect(link.getAttribute('aria-haspopup')).toBeNull()
    expect(link.getAttribute('aria-expanded')).toBeNull()
  })

  test('hover opens after the delay; the card is hoverable; leaving closes after the grace time', async () => {
    const { getByRole } = render(<Example openDelay={400} />)
    await userEvent.hover(getByRole('link', { name: '@ana' }))
    expect(card()).toBeNull()
    await vi.waitFor(() => expect(card()).not.toBeNull())
    // Move into the card: it stays.
    await userEvent.hover(card()!)
    await wait(100)
    expect(card()).not.toBeNull()
    await userEvent.unhover(card()!)
    await vi.waitFor(() => expect(card()).toBeNull())
  })

  test('a touch does not open it', async () => {
    const { getByRole } = render(<Example />)
    const link = getByRole('link', { name: '@ana' })
    link.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }))
    await wait(100)
    expect(card()).toBeNull()
  })

  test('keyboard focus opens it; Escape closes it and keeps focus on the link', async () => {
    const { getByRole } = render(<Example />)
    await userEvent.tab()
    await userEvent.tab()
    const link = getByRole('link', { name: '@ana' })
    expect(document.activeElement).toBe(link)
    await vi.waitFor(() => expect(card()).not.toBeNull())
    expect(document.activeElement).toBe(link)
    await userEvent.keyboard('{Escape}')
    await vi.waitFor(() => expect(card()).toBeNull())
    expect(document.activeElement).toBe(link)
  })

  test('Tab moves into the card, then on to what follows the link; Shift+Tab goes back', async () => {
    const { getByRole } = render(<Example openDelay={0} />)
    await userEvent.tab()
    await userEvent.tab()
    await vi.waitFor(() => expect(card()).not.toBeNull())
    await userEvent.tab()
    expect(document.activeElement).toBe(getByRole('link', { name: 'View profile' }))
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(getByRole('link', { name: '@ana' }))
    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement).toBe(getByRole('button', { name: 'Follow' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(getByRole('link', { name: 'After' }))
    await vi.waitFor(() => expect(card()).toBeNull())
  })
})
