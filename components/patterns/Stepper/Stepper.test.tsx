/**
 * Stepper: an ordered list with aria-current="step", each state also in
 * words, finished steps leading back, upcoming steps never clickable.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Stepper } from './Stepper'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const steps = [
  { id: 'a', label: 'Basket' },
  { id: 'b', label: 'Address', href: '#address' },
  { id: 'c', label: 'Delivery' },
  { id: 'd', label: 'Payment' },
]

describe('Stepper', () => {
  test('an ordered list named "Progress" by default, with the current step marked', () => {
    const { getByRole, getAllByRole } = render(<Stepper steps={steps} current={2} />)
    expect(getByRole('list', { name: 'Progress' }).tagName).toBe('OL')
    const items = getAllByRole('listitem')
    expect(items.map(i => i.getAttribute('aria-current'))).toEqual([null, null, 'step', null])
    expect(items.map(i => i.textContent)).toEqual([
      'Basket (Completed)', 'Address (Completed)', '3Delivery (Current step)', '4Payment (Not started)',
    ])
  })

  test('the numbers and icons are hidden; the words carry the state', () => {
    const { getAllByRole } = render(<Stepper steps={steps} current={1} />)
    for (const i of getAllByRole('listitem')) expect(i.querySelector('.stepper__indicator')!.getAttribute('aria-hidden')).toBe('true')
  })

  test('finished steps lead back: a link with href, a button with onStepClick; later steps never', async () => {
    const onStepClick = vi.fn()
    const { getByRole, queryByRole } = render(<Stepper steps={steps} current={2} onStepClick={onStepClick} />)
    expect(getByRole('link', { name: /Address/ }).getAttribute('href')).toBe('#address')
    expect(getByRole('link', { name: 'Address (Completed)' })).toBeTruthy()
    await userEvent.click(getByRole('button', { name: 'Basket (Completed)' }))
    expect(onStepClick).toHaveBeenCalledWith(0)
    expect(queryByRole('button', { name: /Delivery/ })).toBeNull()
    expect(queryByRole('button', { name: /Payment/ })).toBeNull()
  })

  test('an error step says so, in words and with its description', () => {
    const { getAllByRole } = render(
      <Stepper steps={[steps[0], { id: 'b', label: 'Address', error: true, description: 'Postcode is missing' }, steps[2]]} current={2} />,
    )
    expect(getAllByRole('listitem')[1].textContent).toBe('Address (Needs attention)Postcode is missing')
  })

  test('all done: current past the last step', () => {
    const { getAllByRole } = render(<Stepper steps={steps} current={steps.length} />)
    expect(getAllByRole('listitem').every(i => i.textContent!.endsWith('(Completed)'))).toBe(true)
  })

  test('status words can be translated', () => {
    const { getAllByRole } = render(<Stepper steps={steps} current={1} statusLabels={{ complete: 'Fuldført', current: 'Nuværende trin' }} />)
    expect(getAllByRole('listitem')[0].textContent).toBe('Basket (Fuldført)')
    expect(getAllByRole('listitem')[1].textContent).toBe('2Address (Nuværende trin)')
  })

  test('narrow and horizontal: only the current label shows, the rest stay readable', () => {
    const { container } = render(<div style={{ width: 240 }}><Stepper steps={steps} current={1} /></div>)
    const texts = [...container.querySelectorAll<HTMLElement>('.stepper__text')]
    expect(texts[1].getBoundingClientRect().width).toBeGreaterThan(20)
    expect(texts[0].getBoundingClientRect().width).toBeLessThanOrEqual(1)
    expect(texts[0].textContent).toBe('Basket (Completed)')
  })
})
