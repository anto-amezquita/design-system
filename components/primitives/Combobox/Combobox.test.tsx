/**
 * Combobox: the WAI-ARIA combobox with list autocomplete. Typing filters
 * and highlights; arrows move through enabled options; Enter picks;
 * Escape closes, then clears; leaving the field settles what was typed.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Combobox } from './Combobox'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const towns = ['Aarhus', 'Aalborg', 'Odense', 'Randers', 'Skanderborg', 'São Paulo']
const activeOption = (box: Element) => {
  const id = box.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent : null
}
const options = () => [...document.querySelectorAll('[role="option"]')].map(o => o.textContent)
const status = () => document.querySelector('[role="status"]')?.textContent
const described = (el: Element) =>
  (el.getAttribute('aria-describedby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')

describe('Combobox', () => {
  test('a named, closed combobox with list autocomplete', () => {
    const { getByRole } = render(<Combobox label="Town" options={towns} defaultValue="Odense" />)
    const box = getByRole('combobox', { name: 'Town' }) as HTMLInputElement
    expect(box.value).toBe('Odense')
    expect(box.getAttribute('aria-expanded')).toBe('false')
    expect(box.getAttribute('aria-autocomplete')).toBe('list')
  })

  test('typing filters, ranks starts first, marks the match and announces the count', async () => {
    const { getByRole } = render(<Combobox label="Town" options={towns} />)
    const box = getByRole('combobox')
    await userEvent.type(box, 'r')
    expect(box.getAttribute('aria-expanded')).toBe('true')
    expect(options()).toEqual(['Randers', 'Aarhus', 'Aalborg', 'Skanderborg'])
    expect(document.querySelector('mark')?.textContent).toBe('R')
    expect(status()).toBe('4 results')
    // Accents don't matter.
    await userEvent.clear(box)
    await userEvent.type(box, 'sao')
    expect(options()).toEqual(['São Paulo'])
    expect(status()).toBe('1 result')
  })

  test('arrows move, focus stays in the field, Enter picks', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Combobox label="Town" options={towns} onValueChange={onValueChange} />)
    const box = getByRole('combobox') as HTMLInputElement
    await userEvent.type(box, 'aa')
    expect(activeOption(box)).toBeNull()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(activeOption(box)).toBe('Aalborg')
    expect(document.activeElement).toBe(box)
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('Aalborg')
    expect(box.value).toBe('Aalborg')
    expect(box.getAttribute('aria-expanded')).toBe('false')
  })

  test('Arrow Down on a chosen value opens the full list at it', async () => {
    const { getByRole } = render(<Combobox label="Town" options={towns} defaultValue="Randers" />)
    const box = getByRole('combobox')
    await userEvent.click(box)
    expect(options()).toHaveLength(towns.length)
    expect(activeOption(box)).toBe('Randers')
    expect(document.getElementById(box.getAttribute('aria-activedescendant')!)!.getAttribute('aria-selected')).toBe('true')
  })

  test('disabled options are skipped and cannot be picked', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(
      <Combobox
        label="Room"
        onValueChange={onValueChange}
        options={[{ value: 'a', label: 'Aurora' }, { value: 'b', label: 'Borealis', disabled: true }, { value: 'c', label: 'Cumulus' }]}
      />,
    )
    const box = getByRole('combobox')
    await userEvent.click(box)
    await userEvent.keyboard('{ArrowDown}')
    expect(activeOption(box)).toBe('Cumulus')
    // A pointer can still land on it; the runner won't click aria-disabled, so dispatch it.
    ;(document.querySelector('[aria-disabled="true"]') as HTMLElement).click()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('Escape closes, then clears', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Combobox label="Town" options={towns} defaultValue="Odense" onValueChange={onValueChange} />)
    const box = getByRole('combobox') as HTMLInputElement
    await userEvent.click(box)
    await userEvent.keyboard('{Escape}')
    expect(box.getAttribute('aria-expanded')).toBe('false')
    expect(box.value).toBe('Odense')
    await userEvent.keyboard('{Escape}')
    expect(box.value).toBe('')
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  test('the clear button clears and returns focus to the field', async () => {
    const { getByRole } = render(<Combobox label="Town" options={towns} defaultValue="Odense" />)
    await userEvent.click(getByRole('button', { name: 'Clear Town' }))
    const box = getByRole('combobox') as HTMLInputElement
    expect(box.value).toBe('')
    expect(document.activeElement).toBe(box)
  })

  test('leaving the field: an exact match is taken, anything else gets a reason', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<><Combobox label="Town" options={towns} onValueChange={onValueChange} /><button>Next</button></>)
    const box = getByRole('combobox') as HTMLInputElement
    await userEvent.type(box, 'odense')
    await userEvent.keyboard('{Tab}')
    expect(onValueChange).toHaveBeenLastCalledWith('Odense')
    expect(box.value).toBe('Odense')

    await userEvent.clear(box)
    await userEvent.type(box, 'Oslo')
    await userEvent.keyboard('{Tab}')
    expect(box.getAttribute('aria-invalid')).toBe('true')
    expect(described(box)).toContain('Choose town from the list, or clear the field.')
  })

  test('allowCustom keeps typed text as the value', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Combobox label="Job title" options={['Designer']} allowCustom onValueChange={onValueChange} />)
    await userEvent.type(getByRole('combobox'), 'Sound engineer{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('Sound engineer')
  })

  test('loading and empty states are shown and announced', async () => {
    const { getByRole, rerender } = render(<Combobox label="Town" options={[]} loading filter={false} />)
    await userEvent.type(getByRole('combobox'), 'x')
    expect(status()).toBe('Loading…')
    rerender(<Combobox label="Town" options={[]} filter={false} />)
    expect(status()).toBe('No matches for “x”')
    expect(document.querySelector('.combobox__message')?.textContent).toBe('No matches for “x”')
  })

  test('submits the value with a name', () => {
    const { container } = render(<form><Combobox label="Town" options={towns} defaultValue="Vejle" name="town" /></form>)
    expect(new FormData(container.querySelector('form')!).get('town')).toBe('Vejle')
  })
})
