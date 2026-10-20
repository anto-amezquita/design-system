/**
 * SelectableCard: a fieldset whose legend is the question, native radios
 * or checkboxes named by each card's title, arrow keys and forms working as
 * usual, the whole card clickable, checked marked by more than colour, and
 * edges, text and indicators readable in every brand and mode.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { SelectableCard, SelectableCardGroup } from './SelectableCard'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const plans = (props: Partial<React.ComponentProps<typeof SelectableCardGroup>> = {}) => (
  <SelectableCardGroup legend="Plan" {...props}>
    <SelectableCard value="free" title="Free" meta="0 kr" description="One brand, community support." />
    <SelectableCard value="pro" title="Pro" meta="90 kr/mo" description="Five brands, Figma sync." />
    <SelectableCard value="team" title="Team" meta="Contact us" description="Unlimited brands." disabled />
  </SelectableCardGroup>
)

describe('SelectableCard, single', () => {
  test('a group named by its legend, radios named by title and meta, described by the description', () => {
    const { getByRole } = render(plans())
    expect(getByRole('group', { name: 'Plan' }).tagName).toBe('FIELDSET')
    const pro = getByRole('radio', { name: 'Pro 90 kr/mo' })
    expect(pro).toHaveProperty('name')
    expect(document.getElementById(pro.getAttribute('aria-describedby')!)!.textContent).toBe('Five brands, Figma sync.')
  })

  test('clicking anywhere on a card chooses it; one at a time', async () => {
    const onValueChange = vi.fn()
    const { getByRole, getByText } = render(plans({ onValueChange }))
    await userEvent.click(getByText('Five brands, Figma sync.'))
    expect(getByRole('radio', { name: /Pro/ })).toBeChecked()
    expect(onValueChange).toHaveBeenLastCalledWith(['pro'])
    await userEvent.click(getByText('Free'))
    expect(getByRole('radio', { name: /Free/ })).toBeChecked()
    expect(getByRole('radio', { name: /Pro/ })).not.toBeChecked()
  })

  test('arrow keys move between radios and skip the disabled one', async () => {
    const { getByRole } = render(plans({ defaultValue: ['free'] }))
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(getByRole('radio', { name: /Free/ }))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(getByRole('radio', { name: /Pro/ }))
    expect(getByRole('radio', { name: /Pro/ })).toBeChecked()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(getByRole('radio', { name: /Free/ }))
  })

  test('disabled card can\'t be chosen', async () => {
    const { getByRole, getByText } = render(plans())
    // Playwright won't click a disabled control's label on its own (rightly),
    // so force the click to check it really does nothing.
    await userEvent.click(getByText('Unlimited brands.'), { force: true })
    expect(getByRole('radio', { name: /Team/ })).not.toBeChecked()
    expect(getByRole('radio', { name: /Team/ })).toBeDisabled()
    // Marked by a dashed edge, not only by colour (which barely differs in demo-warm).
    expect(getComputedStyle(getByText('Unlimited brands.').closest('.selectable-card')!).borderTopStyle).toBe('dashed')
  })

  test('values reach the form; required blocks an empty submit', () => {
    const { container } = render(<form>{plans({ name: 'plan', defaultValue: ['pro'], required: true })}</form>)
    const form = container.querySelector('form')!
    expect(new FormData(form).get('plan')).toBe('pro')
    cleanup()
    const empty = render(<form>{plans({ name: 'plan', required: true })}</form>)
    expect(empty.container.querySelector('form')!.checkValidity()).toBe(false)
  })

  test('controlled: follows value, reports clicks', async () => {
    const onValueChange = vi.fn()
    const { getByRole, getByText } = render(plans({ value: ['free'], onValueChange }))
    await userEvent.click(getByText('Pro'))
    expect(onValueChange).toHaveBeenCalledWith(['pro'])
    expect(getByRole('radio', { name: /Free/ })).toBeChecked()
  })

  test('keyboard focus rings the card', async () => {
    const { container } = render(plans())
    await userEvent.keyboard('{Tab}')
    expect(getComputedStyle(container.querySelector('.selectable-card')!).outlineStyle).toBe('solid')
  })
})

describe('SelectableCard, multiple', () => {
  test('checkboxes; any number; the value is the set chosen, in order', async () => {
    const onValueChange = vi.fn()
    const { getAllByRole, getByText } = render(
      <SelectableCardGroup legend="Add-ons" type="multiple" onValueChange={onValueChange}>
        <SelectableCard value="sync" title="Figma sync" />
        <SelectableCard value="mcp" title="MCP server" />
      </SelectableCardGroup>,
    )
    expect(getAllByRole('checkbox')).toHaveLength(2)
    await userEvent.click(getByText('Figma sync'))
    await userEvent.click(getByText('MCP server'))
    expect(onValueChange).toHaveBeenLastCalledWith(['sync', 'mcp'])
    await userEvent.click(getByText('Figma sync'))
    expect(onValueChange).toHaveBeenLastCalledWith(['mcp'])
  })

  test('columns lay cards side by side when there is room', () => {
    const { container } = render(
      <div style={{ inlineSize: '800px' }}>
        <SelectableCardGroup legend="Plan" columns>
          <SelectableCard value="a" title="A" />
          <SelectableCard value="b" title="B" />
        </SelectableCardGroup>
      </div>,
    )
    const [a, b] = Array.from(container.querySelectorAll('.selectable-card')).map(c => c.getBoundingClientRect())
    expect(a.top).toBe(b.top)
  })

  test('a card outside a group says so', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<SelectableCard value="x" title="x" />)).toThrow(/inside a SelectableCardGroup/)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
const lum = ([r, g, b]: number[]) => {
  const ch = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const ratio = (a: string, b: string) => { const [h, l] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05) }

describe('SelectableCard follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: edges and indicators 3:1, checked mark 3:1, text 4.5:1 (disabled too)`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            {plans({ defaultValue: ['pro'] })}
          </div>,
        )
        const page = getComputedStyle(container.firstElementChild!).backgroundColor
        const [free, pro, team] = Array.from(container.querySelectorAll('.selectable-card'))
        expect(ratio(getComputedStyle(free).borderTopColor, page), 'edge').toBeGreaterThanOrEqual(3)
        expect(ratio(getComputedStyle(free.querySelector('.selectable-card__indicator')!).borderTopColor, page), 'indicator').toBeGreaterThanOrEqual(3)
        expect(ratio(getComputedStyle(pro).borderTopColor, page), 'checked edge').toBeGreaterThanOrEqual(3)
        const ind = getComputedStyle(pro.querySelector('.selectable-card__indicator')!)
        expect(ratio(ind.backgroundColor, page), 'checked indicator').toBeGreaterThanOrEqual(3)
        expect(ratio(ind.color, ind.backgroundColor), 'tick').toBeGreaterThanOrEqual(3)
        for (const card of [free, pro, team]) {
          for (const el of Array.from(card.querySelectorAll('.selectable-card__title, .selectable-card__meta, .selectable-card__description'))) {
            expect(contrastOf(el), el.className).toBeGreaterThanOrEqual(4.5)
          }
        }
        expect(contrastOf(container.querySelector('legend')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
