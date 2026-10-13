/**
 * Lines and marks that show a state use color-accent-text, not the accent
 * fill: a brand's accent can be a pastel too light to see as a thin line
 * (demo-soft's #BCB4F4 is 1.83:1 on its surface; WCAG 1.4.11 wants 3:1).
 * color-accent-text is checked at 3:1 by the accent-on-surface pair. Runs
 * in Chromium inside a demo-soft scope, where the two tokens differ.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseLight from '../styles/brands/base-light.css?raw'
import demoSoftScoped from '../styles/brands/demo-soft-scoped.css?raw'
import { RadioGroup } from '../components/primitives/Radio'
import { Card } from '../components/composition/Card'
import { Tabs, TabsList, TabsTrigger } from '../components/patterns/Tabs'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + demoSoftScoped
  document.head.append(style)
})

afterEach(cleanup)

// Resolved by the browser, as rgb(), from inside the scope.
function resolved(name: string, scope: Element) {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  scope.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

describe('accent marks in a pastel brand (demo-soft)', () => {
  test('the two accents differ there, so the test means something', () => {
    const { container } = render(<div data-brand="demo-soft" data-mode="light" />)
    const scope = container.firstElementChild!
    expect(resolved('--color-accent-text', scope)).not.toBe(resolved('--color-accent-default', scope))
  })

  test('Radio: checked ring and dot', () => {
    const { container } = render(
      <div data-brand="demo-soft" data-mode="light">
        <RadioGroup aria-label="Plan" defaultValue="a" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
      </div>,
    )
    const scope = container.firstElementChild!
    const text = resolved('--color-accent-text', scope)
    const checked = container.querySelector('.radio__item[data-state="checked"]')!
    expect(getComputedStyle(checked).borderTopColor).toBe(text)
    expect(getComputedStyle(container.querySelector('.radio__indicator')!).backgroundColor).toBe(text)
  })

  test('Tabs: the active indicator (line variant)', () => {
    const { container } = render(
      <div data-brand="demo-soft" data-mode="light">
        <Tabs defaultValue="a"><TabsList aria-label="T"><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList></Tabs>
      </div>,
    )
    const scope = container.firstElementChild!
    const active = container.querySelector('.tabs__trigger[data-state="active"]')!
    expect(getComputedStyle(active, '::after').backgroundColor).toBe(resolved('--color-accent-text', scope))
  })

  test('Card: the featured border', () => {
    const { container } = render(
      <div data-brand="demo-soft" data-mode="light"><Card featured>x</Card></div>,
    )
    const scope = container.firstElementChild!
    expect(getComputedStyle(container.querySelector('.card')!).borderTopColor).toBe(resolved('--color-accent-text', scope))
  })
})
