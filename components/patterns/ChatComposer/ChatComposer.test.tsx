/**
 * ChatComposer: Enter sends and clears, Shift + Enter adds a line, an input
 * method's Enter never sends, an empty message can't be sent, Stop replaces
 * Send while a reply streams, the field grows up to maxRows and then
 * scrolls, and the text, hint and edge are readable in every brand.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { useState } from 'react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { ChatComposer } from './ChatComposer'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const setup = (props: Partial<React.ComponentProps<typeof ChatComposer>> = {}) => {
  const onSubmit = vi.fn()
  const utils = render(<ChatComposer onSubmit={onSubmit} {...props} />)
  const field = utils.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement
  return { ...utils, onSubmit, field }
}

describe('ChatComposer', () => {
  test('a form and a text field named "Message", described by the keyboard hint', () => {
    const { getByRole, field } = setup()
    expect(getByRole('form', { name: 'Message' })).toBeTruthy()
    const hint = document.getElementById(field.getAttribute('aria-describedby')!)!
    expect(hint.textContent).toBe('Enter to send, Shift + Enter for a new line')
  })

  test('Enter sends the trimmed text, clears the field and keeps focus there', async () => {
    const { field, onSubmit } = setup()
    await userEvent.type(field, '  Why tokens?  {Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Why tokens?')
    expect(field.value).toBe('')
    expect(document.activeElement).toBe(field)
  })

  test('Shift + Enter adds a line instead of sending', async () => {
    const { field, onSubmit } = setup()
    await userEvent.type(field, 'One{Shift>}{Enter}{/Shift}Two')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(field.value).toBe('One\nTwo')
  })

  test("an input method's Enter (composing) doesn't send", () => {
    const { field, onSubmit } = setup({ defaultValue: 'にほん' })
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('にほん')
  })

  test('an empty or blank message: Send is disabled and Enter does nothing', async () => {
    const { field, onSubmit, getByRole } = setup()
    expect(getByRole('button', { name: 'Send' })).toBeDisabled()
    await userEvent.type(field, '   {Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  test('the Send button sends and puts focus back in the field', async () => {
    const { field, onSubmit, getByRole } = setup()
    await userEvent.type(field, 'Hello')
    await userEvent.click(getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledWith('Hello')
    expect(document.activeElement).toBe(field)
  })

  test('while streaming, Stop replaces Send and Enter keeps the draft', async () => {
    const onStop = vi.fn()
    const { field, onSubmit, getByRole, queryByRole } = setup({ status: 'streaming', onStop })
    expect(queryByRole('button', { name: 'Send' })).toBeNull()
    await userEvent.type(field, 'Next question{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(field.value).toBe('Next question')
    await userEvent.click(getByRole('button', { name: 'Stop the reply' }))
    expect(onStop).toHaveBeenCalled()
  })

  test('controlled: the parent owns the text and clears it', async () => {
    const sent: string[] = []
    function Host() {
      const [text, setText] = useState('')
      return <ChatComposer value={text} onValueChange={setText} onSubmit={m => { sent.push(m); setText('') }} />
    }
    const { getByRole } = render(<Host />)
    const field = getByRole('textbox') as HTMLTextAreaElement
    await userEvent.type(field, 'Hi{Enter}')
    expect(sent).toEqual(['Hi'])
    expect(field.value).toBe('')
  })

  test('the field grows with the text up to maxRows, then scrolls', async () => {
    const { field } = setup({ maxRows: 3 })
    const one = field.getBoundingClientRect().height
    await userEvent.type(field, 'a{Shift>}{Enter}{/Shift}b')
    const two = field.getBoundingClientRect().height
    expect(two).toBeGreaterThan(one)
    await userEvent.type(field, '{Shift>}{Enter}{/Shift}c{Shift>}{Enter}{/Shift}d{Shift>}{Enter}{/Shift}e')
    const capped = field.getBoundingClientRect().height
    const line = parseFloat(getComputedStyle(field).lineHeight)
    expect(capped - one).toBeCloseTo(line * 2, 0)
    expect(getComputedStyle(field).overflowY).toBe('auto')
  })

  test('disabled: the field and Send are disabled', () => {
    const { field, getByRole } = setup({ disabled: true, defaultValue: 'Hi' })
    expect(field).toBeDisabled()
    expect(getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  test('hint={null} hides the hint and its description', () => {
    const { field, container } = setup({ hint: null })
    expect(field.hasAttribute('aria-describedby')).toBe(false)
    expect(container.querySelector('.chat-composer__hint')).toBeNull()
  })

  test('passes className, data attributes and ref to the form', () => {
    let node: HTMLFormElement | null = null
    const { getByRole } = render(<ChatComposer onSubmit={() => {}} className="extra" data-x="1" ref={n => { node = n }} />)
    const form = getByRole('form')
    expect(form.className).toContain('extra')
    expect(form.dataset.x).toBe('1')
    expect(node).toBe(form)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

/** Contrast of an element's border colour against what's behind it, measured as text of that colour. */
function edgeContrast(el: HTMLElement) {
  const probe = document.createElement('span')
  probe.textContent = 'x'
  probe.style.color = getComputedStyle(el).borderTopColor
  el.parentElement!.append(probe)
  const ratio = contrastOf(probe)
  probe.remove()
  return ratio
}

describe('ChatComposer follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: text, placeholder, hint readable; edge visible`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <ChatComposer onSubmit={() => {}} defaultValue="Text" />
          </div>,
        )
        const field = container.querySelector('textarea')!
        expect(contrastOf(field)).toBeGreaterThanOrEqual(4.5)
        const placeholder = document.createElement('span')
        placeholder.textContent = 'x'
        placeholder.style.color = getComputedStyle(field, '::placeholder').color
        field.parentElement!.append(placeholder)
        expect(contrastOf(placeholder)).toBeGreaterThanOrEqual(4.5)
        placeholder.remove()
        expect(contrastOf(container.querySelector('.chat-composer__hint')!)).toBeGreaterThanOrEqual(4.5)
        expect(edgeContrast(container.querySelector('.chat-composer__box')!)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
