/**
 * TagInput: free text as tags. Enter or a comma adds; a pasted list is
 * split; Backspace removes the last; duplicates, validate and max refuse
 * with a reason and leave the text to fix; leaving the field adds what's
 * typed. With suggestions it's a combobox. Runs in Chromium with real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { TagInput, splitTags } from './TagInput'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const tags = () => [...document.querySelectorAll('.multi-select__tags .tag')].map(t => t.firstChild?.textContent)
const status = () => document.querySelector('[role="status"]')?.textContent
const described = (el: Element) =>
  (el.getAttribute('aria-describedby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')
const isEmail = (t: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? undefined : `“${t}” isn’t an email address.`)

describe('splitTags', () => {
  test('splits on commas, semicolons and new lines, and trims', () => {
    expect(splitTags(' a, b;c\n d ,, ')).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('TagInput', () => {
  test('a plain textbox without suggestions; says how to add; described by its tags', () => {
    const { getByRole } = render(<TagInput label="Keywords" defaultValue={['CSS']} hint="Up to five words." />)
    const box = getByRole('textbox', { name: 'Keywords' })
    expect(box.getAttribute('role')).toBeNull()
    expect(described(box)).toContain('1 tag: CSS.')
    expect(described(box)).toContain('Up to five words. Separate with commas or press Enter.')
  })

  test('Enter and comma add; each is announced', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<TagInput label="Keywords" onValueChange={onValueChange} />)
    const box = getByRole('textbox') as HTMLInputElement
    await userEvent.type(box, 'tokens,')
    expect(onValueChange).toHaveBeenLastCalledWith(['tokens'])
    expect(box.value).toBe('')
    await userEvent.type(box, ' motion {Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['tokens', 'motion'])
    expect(status()).toBe('motion added, 2 tags')
  })

  test('a pasted list is split; refused items stay in the field with the first reason', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<>
      <textarea aria-label="Source" defaultValue={'jo@example.es, ANA@example.com; nope\nfreja@example.dk'} />
      <TagInput label="Invite" validate={isEmail} defaultValue={['ana@example.com']} onValueChange={onValueChange} />
    </>)
    // Copy a list the way it comes out of a spreadsheet or an email, then paste it.
    const source = getByRole('textbox', { name: 'Source' }) as HTMLTextAreaElement
    source.focus()
    source.select()
    await userEvent.copy()
    const box = getByRole('textbox', { name: 'Invite' }) as HTMLInputElement
    box.focus()
    await userEvent.paste()
    expect(onValueChange).toHaveBeenLastCalledWith(['ana@example.com', 'jo@example.es', 'freja@example.dk'])
    expect(status()).toBe('2 tags added, 3 tags')
    expect(box.value).toBe('nope')
    expect(box.getAttribute('aria-invalid')).toBe('true')
    expect(described(box)).toContain('“ANA@example.com” is already added.')
  })

  test('a validate reason is shown and the text kept', async () => {
    const { getByRole } = render(<TagInput label="Invite" validate={isEmail} />)
    const box = getByRole('textbox') as HTMLInputElement
    await userEvent.type(box, 'mikkel@example{Enter}')
    expect(box.value).toBe('mikkel@example')
    expect(described(box)).toContain('“mikkel@example” isn’t an email address.')
    // Typing clears the error.
    await userEvent.type(box, '.dk')
    expect(box.getAttribute('aria-invalid')).toBeNull()
  })

  test('max is in the hint and enforced', async () => {
    const { getByRole } = render(<TagInput label="Keywords" max={2} defaultValue={['a', 'b']} />)
    const box = getByRole('textbox')
    expect(described(box)).toContain('Up to 2.')
    await userEvent.type(box, 'c{Enter}')
    expect(tags()).toEqual(['a', 'b'])
    expect(described(box)).toContain('You can add up to 2.')
  })

  test('Backspace in the empty field removes the last tag', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<TagInput label="Keywords" defaultValue={['a', 'b']} onValueChange={onValueChange} />)
    await userEvent.click(getByRole('textbox'))
    await userEvent.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['a'])
    expect(status()).toBe('b removed, 1 tag')
  })

  test('leaving the field adds what was typed', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<><TagInput label="Keywords" onValueChange={onValueChange} /><button>Next</button></>)
    await userEvent.type(getByRole('textbox'), 'pending')
    await userEvent.keyboard('{Tab}')
    expect(onValueChange).toHaveBeenLastCalledWith(['pending'])
  })

  test('a tag’s Remove button moves focus to the next tag', async () => {
    const { getByRole } = render(<TagInput label="Keywords" defaultValue={['a', 'b', 'c']} />)
    await userEvent.click(getByRole('button', { name: 'Remove b' }))
    expect(tags()).toEqual(['a', 'c'])
    await vi.waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'Remove c' })))
  })

  test('suggestions: a combobox that filters, skips added ones, and adds on Enter', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(
      <TagInput label="Topics" suggestions={['Design systems', 'Design tokens', 'Research']} defaultValue={['Design tokens']} onValueChange={onValueChange} />,
    )
    const box = getByRole('combobox', { name: 'Topics' })
    await userEvent.type(box, 'des')
    const options = [...document.querySelectorAll('[role="option"]')].map(o => o.textContent)
    expect(options).toEqual(['Design systems'])
    expect(status()).toBe('1 suggestion')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Design tokens', 'Design systems'])
  })

  test('submits every tag under the name', () => {
    const { container } = render(<form><TagInput label="Keywords" defaultValue={['a', 'b']} name="kw" /></form>)
    expect(new FormData(container.querySelector('form')!).getAll('kw')).toEqual(['a', 'b'])
  })
})
