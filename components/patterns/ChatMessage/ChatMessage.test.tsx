/**
 * ChatMessage: each message is an article named by its sender and time;
 * a continued message keeps that name for screen readers; a streaming one is
 * busy and says so; a failed one is described by its error; and the text,
 * the bubble and the typing dots are readable in every brand and mode.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Avatar } from '../../primitives/Avatar'
import { ChatMessage } from './ChatMessage'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const at = new Date(2026, 9, 20, 14, 2)
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(at)

describe('ChatMessage semantics', () => {
  test('an article named by the sender and the time', () => {
    const { getByRole } = render(<ChatMessage role="assistant" author="Assistant" timestamp={at}>Hello</ChatMessage>)
    const article = getByRole('article')
    expect(article.textContent).toContain('Hello')
    const name = document.getElementById(article.getAttribute('aria-labelledby')!)!.textContent!
    expect(name).toContain('Assistant')
    expect(name).toContain(time)
    expect(article.querySelector('time')!.getAttribute('datetime')).toBe(at.toISOString())
  })

  test('a continued message hides name, time and avatar from sight but keeps the name', () => {
    const { getByRole, container } = render(
      <ChatMessage role="user" author="Antonio" timestamp={at} avatar={<Avatar alt="Antonio" />} continued>Again</ChatMessage>,
    )
    const label = document.getElementById(getByRole('article').getAttribute('aria-labelledby')!)!
    expect(label.className).toContain('visually-hidden')
    expect(label.textContent).toContain('Antonio')
    expect(getComputedStyle(container.querySelector('.chat-message__avatar')!).visibility).toBe('hidden')
  })

  test('the avatar is hidden from screen readers: the name already says who', () => {
    const { container } = render(<ChatMessage role="user" author="Antonio" avatar={<Avatar alt="Antonio" />}>Hi</ChatMessage>)
    expect(container.querySelector('.chat-message__avatar')!.getAttribute('aria-hidden')).toBe('true')
  })

  test('a system message reads its name but shows only the note, and never an avatar', () => {
    const { getByRole, container } = render(
      <ChatMessage role="system" author="Conversation" avatar={<Avatar alt="x" />}>Antonio joined</ChatMessage>,
    )
    const label = document.getElementById(getByRole('article').getAttribute('aria-labelledby')!)!
    expect(label.className).toContain('visually-hidden')
    expect(container.querySelector('.chat-message__avatar')).toBeNull()
  })

  test('streaming with no content: busy, with a typing indicator that names itself', () => {
    const { getByRole, container } = render(<ChatMessage role="assistant" author="Assistant" status="streaming" />)
    expect(getByRole('article').getAttribute('aria-busy')).toBe('true')
    expect(container.querySelectorAll('.chat-message__dot')).toHaveLength(3)
    expect(container.querySelector('.chat-message__typing')!.textContent).toBe('Writing a reply')
  })

  test('streaming with text: busy, text shown, no indicator; complete is not busy', () => {
    const { getByRole, container, rerender } = render(<ChatMessage role="assistant" author="A" status="streaming">Tokens</ChatMessage>)
    expect(getByRole('article').getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('.chat-message__typing')).toBeNull()
    rerender(<ChatMessage role="assistant" author="A">Tokens</ChatMessage>)
    expect(getByRole('article').hasAttribute('aria-busy')).toBe(false)
  })

  test('a failed message is described by its error', () => {
    const { getByRole } = render(<ChatMessage role="user" author="Antonio" error="Not sent.">Hi</ChatMessage>)
    const article = getByRole('article')
    expect(document.getElementById(article.getAttribute('aria-describedby')!)!.textContent).toBe('Not sent.')
  })

  test('passes className, data attributes and ref to the article', () => {
    let node: HTMLElement | null = null
    const { getByRole } = render(<ChatMessage role="user" author="A" className="extra" data-x="1" ref={n => { node = n }}>Hi</ChatMessage>)
    const el = getByRole('article')
    expect(el.className).toContain('extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

describe('ChatMessage layout', () => {
  test("the user's message sits on the end side, its avatar after it, in a bubble", () => {
    const { container } = render(
      <div style={{ inlineSize: '600px' }}>
        <ChatMessage role="user" author="Antonio" avatar={<Avatar alt="Antonio" />}>Short</ChatMessage>
      </div>,
    )
    const article = container.querySelector('article')!.getBoundingClientRect()
    const avatar = container.querySelector('.chat-message__avatar')!.getBoundingClientRect()
    const bubble = container.querySelector('.chat-message__content')!
    expect(avatar.right).toBeCloseTo(article.right, 0)
    expect(bubble.getBoundingClientRect().right).toBeLessThan(avatar.left)
    expect(bubble.getBoundingClientRect().width).toBeLessThan(article.width * 0.8)
    expect(getComputedStyle(bubble).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test("the assistant's message starts on the start side after its avatar, with no bubble", () => {
    const { container } = render(
      <div style={{ inlineSize: '600px' }}>
        <ChatMessage role="assistant" author="A" avatar={<Avatar alt="A" />}>Reply</ChatMessage>
      </div>,
    )
    const article = container.querySelector('article')!.getBoundingClientRect()
    const avatar = container.querySelector('.chat-message__avatar')!.getBoundingClientRect()
    const content = container.querySelector('.chat-message__content')!
    expect(avatar.left).toBeCloseTo(article.left, 0)
    expect(content.getBoundingClientRect().left).toBeGreaterThan(avatar.right)
    expect(getComputedStyle(content).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  test('a continued message keeps the same column as the one before it', () => {
    const { container } = render(
      <div style={{ inlineSize: '600px' }}>
        <ChatMessage role="assistant" author="A" avatar={<Avatar alt="A" />}>First</ChatMessage>
        <ChatMessage role="assistant" author="A" avatar={<Avatar alt="A" />} continued>Second</ChatMessage>
      </div>,
    )
    const [a, b] = Array.from(container.querySelectorAll('.chat-message__content')).map(c => c.getBoundingClientRect().left)
    expect(b).toBeCloseTo(a, 0)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

/** Contrast of a dot's fill against what's behind it, measured as text of that colour. */
function dotContrast(dot: Element) {
  const probe = document.createElement('span')
  probe.textContent = 'x'
  probe.style.color = getComputedStyle(dot).backgroundColor
  dot.parentElement!.append(probe)
  const ratio = contrastOf(probe)
  probe.remove()
  return ratio
}

describe('ChatMessage follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: names, times, bubble text, notes, errors and dots readable`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <ChatMessage role="user" author="Antonio" timestamp={at} error="Not sent.">Bubble text</ChatMessage>
            <ChatMessage role="system" author="Conversation">Antonio joined</ChatMessage>
            <ChatMessage role="assistant" author="Assistant" status="streaming" />
          </div>,
        )
        const [user, system] = container.querySelectorAll('article')
        expect(contrastOf(user.querySelector('.chat-message__author')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(user.querySelector('.chat-message__time')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(user.querySelector('.chat-message__content')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(user.querySelector('.chat-message__error')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(system.querySelector('.chat-message__content')!)).toBeGreaterThanOrEqual(4.5)
        expect(dotContrast(container.querySelector('.chat-message__dot')!)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
