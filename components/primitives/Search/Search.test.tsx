/**
 * Search: a named search landmark around a named searchbox; Enter
 * searches; Escape clears, then leaves; the shortcut jumps to it unless
 * someone is typing elsewhere; loading marks it busy. Runs in Chromium.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Search } from './Search'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

describe('Search', () => {
  test('a search landmark and a searchbox, both named', () => {
    const { getByRole } = render(<Search label="Search docs" />)
    expect(getByRole('search', { name: 'Search docs' })).toBeTruthy()
    expect(getByRole('searchbox', { name: 'Search docs' })).toBeTruthy()
  })

  test('Enter runs the search with the query; the page does not reload', async () => {
    const onSearch = vi.fn()
    const { getByRole } = render(<Search onSearch={onSearch} />)
    await userEvent.type(getByRole('searchbox'), 'card{Enter}')
    expect(onSearch).toHaveBeenCalledWith('card')
  })

  test('the Search button submits too', async () => {
    const onSearch = vi.fn()
    const { getByRole } = render(<Search onSearch={onSearch} showSubmit defaultValue="field" />)
    await userEvent.click(getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith('field')
  })

  test('Escape clears, and a second Escape leaves the field', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Search onValueChange={onValueChange} />)
    const box = getByRole('searchbox') as HTMLInputElement
    await userEvent.type(box, 'kbd')
    await userEvent.keyboard('{Escape}')
    expect(box.value).toBe('')
    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(document.activeElement).toBe(box)
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).not.toBe(box)
  })

  test('the shortcut focuses it, but not while typing in another field', async () => {
    const { getByRole } = render(
      <>
        <input aria-label="Other" />
        <Search shortcut="/" />
      </>,
    )
    const box = getByRole('searchbox')
    expect(box.getAttribute('aria-keyshortcuts')).toBe('/')
    const other = getByRole('textbox', { name: 'Other' }) as HTMLInputElement
    other.focus()
    await userEvent.keyboard('/')
    expect(document.activeElement).toBe(other)
    expect(other.value).toBe('/')
    other.blur()
    await userEvent.keyboard('/')
    expect(document.activeElement).toBe(box)
    expect((box as HTMLInputElement).value).toBe('')
  })

  test('the shortcut hint shows only while empty and unfocused', async () => {
    const { getByRole, container } = render(<Search shortcut="/" />)
    expect(container.querySelector('.kbd')).not.toBeNull()
    getByRole('searchbox').focus()
    await expect.poll(() => container.querySelector('.kbd')).toBeNull()
  })

  test('loading: busy, with a spinner in place of the hint', () => {
    const { getByRole, container } = render(<Search shortcut="/" loading />)
    expect(getByRole('searchbox').getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('.kbd')).toBeNull()
    expect(container.querySelector('.spinner')).not.toBeNull()
  })

  test('the clear button empties it', async () => {
    const { getByRole } = render(<Search defaultValue="card" />)
    await userEvent.click(getByRole('button', { name: 'Clear input' }))
    expect((getByRole('searchbox') as HTMLInputElement).value).toBe('')
  })
})
