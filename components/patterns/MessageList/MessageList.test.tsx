/**
 * MessageList: a named feed whose articles know their position and share
 * one tab stop; Page Up / Page Down move between them; it follows the
 * newest message unless you've scrolled up, then counts what's waiting;
 * your own message always brings you back; and each finished reply (not
 * history, not your own, not while streaming) is read aloud once.
 */

import { afterEach, describe, expect, test } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { useState } from 'react'

import '../../../styles/brands/base-light.css'
import { ChatMessage } from '../ChatMessage'
import { MessageList } from './MessageList'

afterEach(cleanup)

type Msg = { id: number; role: 'user' | 'assistant'; text: string; streaming?: boolean }

const history: Msg[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  role: i % 2 ? 'assistant' : 'user',
  text: `Message ${i + 1}, long enough to take a line or two in a narrow list.`,
}))

let api: { add: (m: Msg) => void; update: (id: number, patch: Partial<Msg>) => void }

function Host({ announce }: { announce?: boolean }) {
  const [messages, setMessages] = useState(history)
  api = {
    add: m => setMessages(list => [...list, m]),
    update: (id, patch) => setMessages(list => list.map(m => (m.id === id ? { ...m, ...patch } : m))),
  }
  return (
    <div style={{ blockSize: '300px', inlineSize: '400px', display: 'grid' }}>
      <MessageList label="Conversation" announce={announce}>
        {messages.map(m => (
          <ChatMessage key={m.id} role={m.role} author={m.role === 'user' ? 'Antonio' : 'Assistant'} status={m.streaming ? 'streaming' : 'complete'}>
            {m.text}
          </ChatMessage>
        ))}
      </MessageList>
    </div>
  )
}

const setup = (announce?: boolean) => {
  const utils = render(<Host announce={announce} />)
  const feed = utils.getByRole('feed', { name: 'Conversation' })
  const scroller = feed.parentElement as HTMLElement
  const status = utils.container.querySelector('[role="status"]')!
  const articles = () => Array.from(feed.querySelectorAll('article'))
  const atBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= 24
  const scrollUp = () => {
    scroller.scrollTop = 0
    fireEvent.scroll(scroller)
  }
  return { ...utils, feed, scroller, status, articles, atBottom, scrollUp }
}

describe('MessageList feed', () => {
  test('a named feed; articles know their position and the newest is the one tab stop', () => {
    const { articles } = setup()
    const list = articles()
    expect(list[0].getAttribute('aria-posinset')).toBe('1')
    expect(list[0].getAttribute('aria-setsize')).toBe('12')
    expect(list.map(a => a.tabIndex)).toEqual([...Array(11).fill(-1), 0])
  })

  test('Page Up / Page Down move between messages; Home and End go to the ends', async () => {
    const { articles } = setup()
    const list = articles()
    list[11].focus()
    await userEvent.keyboard('{PageUp}')
    expect(document.activeElement).toBe(list[10])
    expect(list[10].tabIndex).toBe(0)
    expect(list[11].tabIndex).toBe(-1)
    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(list[0])
    await userEvent.keyboard('{PageDown}')
    expect(document.activeElement).toBe(list[1])
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(list[11])
  })

  test('starts at the newest message', () => {
    const { atBottom } = setup()
    expect(atBottom()).toBe(true)
  })
})

describe('MessageList follows the conversation', () => {
  test('at the bottom, a new reply keeps the view at the bottom; history is never read aloud', async () => {
    const { atBottom, status } = setup()
    expect(status.textContent).toBe('')
    act(() => api.add({ id: 100, role: 'assistant', text: 'A new reply.' }))
    await expect.poll(atBottom).toBe(true)
    await expect.poll(() => status.textContent).toBe('Assistant: A new reply.')
  })

  test('a streaming reply is busy and read aloud only once complete', async () => {
    const { feed, status } = setup()
    act(() => api.add({ id: 100, role: 'assistant', text: 'Partial', streaming: true }))
    await expect.poll(() => feed.getAttribute('aria-busy')).toBe('true')
    act(() => api.update(100, { text: 'Partial, then the rest.' }))
    expect(status.textContent).toBe('')
    act(() => api.update(100, { streaming: false }))
    await expect.poll(() => status.textContent).toBe('Assistant: Partial, then the rest.')
    expect(feed.hasAttribute('aria-busy')).toBe(false)
  })

  test('scrolled up: new replies wait behind a count; the button brings you back and focuses the newest', async () => {
    const { scrollUp, getByRole, atBottom, articles, scroller } = setup()
    scrollUp()
    await expect.poll(() => getByRole('button', { name: 'Jump to latest' })).toBeTruthy()
    act(() => api.add({ id: 100, role: 'assistant', text: 'One.' }))
    act(() => api.add({ id: 101, role: 'assistant', text: 'Two.' }))
    await expect.poll(() => getByRole('button', { name: '2 new messages' })).toBeTruthy()
    expect(scroller.scrollTop).toBe(0)
    await userEvent.click(getByRole('button', { name: '2 new messages' }))
    await expect.poll(atBottom).toBe(true)
    expect(document.activeElement).toBe(articles()[articles().length - 1])
  })

  test('scrolled up: your own message brings you back down and isn\'t read back', async () => {
    const { scrollUp, atBottom, status } = setup()
    scrollUp()
    act(() => api.add({ id: 100, role: 'user', text: 'Mine.' }))
    await expect.poll(atBottom).toBe(true)
    expect(status.textContent).toBe('')
  })

  test('announce={false} reads nothing aloud', async () => {
    const { status, atBottom } = setup(false)
    act(() => api.add({ id: 100, role: 'assistant', text: 'Quiet.' }))
    await expect.poll(atBottom).toBe(true)
    expect(status.textContent).toBe('')
  })

  test('passes className, data attributes and ref to the wrapper', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(
      <MessageList label="C" className="extra" data-x="1" ref={n => { node = n }}><article>Hi</article></MessageList>,
    )
    const el = container.firstElementChild as HTMLDivElement
    expect(el.className).toBe('message-list extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})
