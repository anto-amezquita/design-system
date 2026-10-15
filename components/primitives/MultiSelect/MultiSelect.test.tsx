/**
 * MultiSelect: a combobox over a multi-selectable listbox. The list stays
 * open while picking; Enter or a click toggles; chosen items are Tags with
 * Remove buttons; Backspace in the empty field removes the last; `max`
 * makes the rest unavailable. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { MultiSelect } from './MultiSelect'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const langs = ['Danish', 'English', 'Spanish', 'Swedish', 'German']
const activeOption = (box: Element) => {
  const id = box.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent : null
}
const options = () => [...document.querySelectorAll('[role="option"]')].map(o => o.textContent)
const status = () => document.querySelector('[role="status"]')?.textContent
const tags = () => [...document.querySelectorAll('.multi-select__tags .tag')].map(t => t.firstChild?.textContent)
const described = (el: Element) =>
  (el.getAttribute('aria-describedby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')

describe('MultiSelect', () => {
  test('a combobox over a multi-selectable listbox; the field is described by what is chosen', async () => {
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} defaultValue={['Spanish', 'Danish']} hint="Pick all you speak." />)
    const box = getByRole('combobox', { name: 'Languages' })
    expect(described(box)).toContain('2 chosen: Spanish, Danish.')
    expect(described(box)).toContain('Pick all you speak.')
    await userEvent.click(box)
    expect(getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true')
    expect(document.querySelectorAll('[aria-selected="true"]')).toHaveLength(2)
  })

  test('Enter toggles and the list stays open; each change is announced', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} onValueChange={onValueChange} />)
    const box = getByRole('combobox')
    await userEvent.click(box)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['English'])
    expect(box.getAttribute('aria-expanded')).toBe('true')
    expect(status()).toBe('English added, 1 chosen')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['English', 'Spanish'])
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['English'])
    expect(status()).toBe('Spanish removed, 1 chosen')
    expect(document.activeElement).toBe(box)
  })

  test('picking from a search clears it and keeps the place in the full list', async () => {
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} />)
    const box = getByRole('combobox') as HTMLInputElement
    await userEvent.type(box, 'sw')
    expect(options()).toEqual(['Swedish'])
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(box.value).toBe('')
    expect(options()).toHaveLength(langs.length)
    expect(activeOption(box)).toBe('Swedish')
    expect(tags()).toEqual(['Swedish'])
  })

  test('Backspace in the empty field removes the last chosen item', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} defaultValue={['Danish', 'German']} onValueChange={onValueChange} />)
    await userEvent.click(getByRole('combobox'))
    await userEvent.keyboard('{Escape}{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Danish'])
    expect(status()).toBe('German removed, 1 chosen')
  })

  test('a tag’s Remove button removes it and moves focus to the next tag', async () => {
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} defaultValue={['Danish', 'English', 'German']} />)
    await userEvent.click(getByRole('button', { name: 'Remove English' }))
    expect(tags()).toEqual(['Danish', 'German'])
    await vi.waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'Remove German' })))
  })

  test('Remove all clears and returns to the field', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} defaultValue={['Danish', 'English']} onValueChange={onValueChange} />)
    await userEvent.click(getByRole('button', { name: 'Remove all' }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(document.activeElement).toBe(getByRole('combobox'))
    expect(document.querySelector('.multi-select__tags')).toBeNull()
  })

  test('max: the hint says so, and other options become unavailable', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<MultiSelect label="Languages" options={langs} max={2} defaultValue={['Danish', 'English']} onValueChange={onValueChange} />)
    const box = getByRole('combobox')
    expect(described(box)).toContain('You can choose up to 2.')
    await userEvent.click(box)
    const spanish = [...document.querySelectorAll('[role="option"]')].find(o => o.textContent === 'Spanish') as HTMLElement
    expect(spanish.getAttribute('aria-disabled')).toBe('true')
    spanish.click()
    expect(onValueChange).not.toHaveBeenCalled()
    // A chosen one can still be removed.
    const danish = [...document.querySelectorAll('[role="option"]')].find(o => o.textContent === 'Danish') as HTMLElement
    danish.click()
    expect(onValueChange).toHaveBeenLastCalledWith(['English'])
  })

  test('submits every value under the name', () => {
    const { container } = render(<form><MultiSelect label="Languages" options={langs} defaultValue={['Danish', 'Spanish']} name="lang" /></form>)
    expect(new FormData(container.querySelector('form')!).getAll('lang')).toEqual(['Danish', 'Spanish'])
  })

  test('disabled: tags show without Remove buttons', () => {
    const { queryByRole } = render(<MultiSelect label="Languages" options={langs} defaultValue={['Danish', 'Spanish']} disabled />)
    expect(queryByRole('button', { name: /Remove/ })).toBeNull()
    expect(tags()).toEqual(['Danish', 'Spanish'])
  })
})
