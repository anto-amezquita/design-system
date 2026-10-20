/**
 * A checkbox must look like a checkbox in every brand. Brands set one
 * corner radius for interactive controls, and a round brand's (demo-soft's
 * pill, demo-cool's 12px) turned the 20px box into a circle: a radio. Each
 * checkbox mark caps its corner at a quarter of its size, while a radio
 * stays round. Covers Checkbox, SelectableCard (multiple) and MultiSelect.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Checkbox } from './Checkbox'
import { RadioGroup } from '../Radio'
import { SelectableCard, SelectableCardGroup } from '../SelectableCard'
import { MultiSelect } from '../MultiSelect'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

/** Corner radius as a share of the box's width. */
const roundness = (el: Element) => {
  const style = getComputedStyle(el)
  return parseFloat(style.borderTopLeftRadius) / el.getBoundingClientRect().width
}

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('checkbox marks stay square-ish; radios stay round', () => {
  for (const brand of brands) {
    test(`${brand ?? 'base'}`, async () => {
      const { container, getByRole } = render(
        <div data-brand={brand} data-mode="light">
          <Checkbox label="Agree" />
          <RadioGroup aria-label="Size" defaultValue="s" options={[{ value: 's', label: 'Small' }]} />
          <SelectableCardGroup legend="Brands" type="multiple"><SelectableCard value="a" title="A" /></SelectableCardGroup>
          <SelectableCardGroup legend="Plan"><SelectableCard value="b" title="B" /></SelectableCardGroup>
          <MultiSelect label="Languages" options={['Danish', 'Spanish']} />
        </div>,
      )
      await userEvent.click(getByRole('combobox', { name: 'Languages' }))
      const [multipleMark, singleMark] = container.querySelectorAll('.selectable-card__indicator')
      for (const mark of [
        container.querySelector('.checkbox__root')!,
        multipleMark,
        document.querySelector('.multi-select__check')!,
      ]) {
        expect(roundness(mark)).toBeGreaterThanOrEqual(0)
        expect(roundness(mark)).toBeLessThanOrEqual(0.25)
      }
      expect(roundness(container.querySelector('.radio__item')!)).toBeGreaterThanOrEqual(0.5)
      expect(roundness(singleMark)).toBeGreaterThanOrEqual(0.5)
    })
  }
})
