/**
 * Disabled controls stay readable. The shared disabled opacity was 0.1, so a
 * disabled Button, Input or Checkbox kept a tenth of its strength and its
 * words were close to invisible. Disabled now means quieter colours from
 * tested pairs. This renders every component that used the fade, disabled,
 * in all five brands, light and dark, and checks that nothing is faded and
 * that every piece of text is at least 4.5:1 on what's behind it.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseLight from '../styles/brands/base-light.css?raw'
import baseDark from '../styles/brands/base-dark.css?raw'
import portfolio from '../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from './contrast-test-utils'

import { Button } from '../components/primitives/Button'
import { Checkbox } from '../components/primitives/Checkbox'
import { RadioGroup } from '../components/primitives/Radio'
import { Switch } from '../components/primitives/Switch'
import { Field } from '../components/primitives/Field'
import { Input } from '../components/primitives/Input'
import { Textarea } from '../components/primitives/Textarea'
import { OtpInput } from '../components/primitives/OtpInput'
import { Select } from '../components/primitives/Select'
import { Slider } from '../components/primitives/Slider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/patterns/Accordion'
import { Tabs, TabsList, TabsTrigger } from '../components/patterns/Tabs'
import { Pagination } from '../components/patterns/Pagination'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const scopes = (['base', 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const)
  .flatMap(brand => (['light', 'dark'] as const).map(mode => ({ brand, mode })))

function Disabled() {
  return (
    <>
      <Button disabled>Save</Button>
      <Button variant="secondary" disabled>Cancel</Button>
      <Button variant="ghost" disabled>Skip</Button>
      <Button variant="link" disabled>Learn more</Button>
      <Checkbox label="Remember me" disabled />
      <Checkbox label="Newsletter" disabled defaultChecked />
      <RadioGroup aria-label="Size" defaultValue="m" options={[{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }]} disabled />
      <Switch label="Notifications" disabled />
      <Switch label="Dark mode" disabled defaultChecked />
      <Field label="Email" disabled><Input defaultValue="ana@example.com" /></Field>
      <Input label="Name" defaultValue="Ana" disabled />
      <Textarea label="Notes" defaultValue="Call back on Monday" disabled />
      <OtpInput label="Code" defaultValue="482913" disabled />
      <Select aria-label="Country" groups={[{ options: [{ value: 'dk', label: 'Denmark' }] }]} defaultValue="dk" disabled />
      <Slider label="Volume" defaultValue={40} showValue disabled />
      <Accordion type="single" collapsible>
        <AccordionItem value="a" disabled><AccordionTrigger>Shipping</AccordionTrigger><AccordionContent>Two days.</AccordionContent></AccordionItem>
      </Accordion>
      <Tabs defaultValue="a">
        <TabsList aria-label="Views"><TabsTrigger value="a">Overview</TabsTrigger><TabsTrigger value="b" disabled>History</TabsTrigger></TabsList>
      </Tabs>
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    </>
  )
}

/** Elements that hold text themselves, leaving out text that's only for screen readers. */
function textHolders(root: Element) {
  return [...root.querySelectorAll<HTMLElement>('*')].filter(el =>
    [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())
    && !el.closest('.visually-hidden')
    && el.getClientRects().length > 0,
  )
}

describe('disabled controls stay readable', () => {
  for (const { brand, mode } of scopes) {
    test(`${brand} ${mode}: nothing is faded, all text is 4.5:1`, () => {
      const { container } = render(
        <div data-brand={brand === 'base' ? undefined : brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
          <Disabled />
        </div>,
      )
      const scope = container.firstElementChild!
      // A fade is a partial opacity; 0 is a native input kept invisible on purpose (OtpInput's).
      const faded = [...scope.querySelectorAll<HTMLElement>('*')].filter(el => { const o = Number(getComputedStyle(el).opacity); return o > 0 && o < 1 })
      expect(faded.map(el => el.className || el.tagName)).toEqual([])
      const texts = textHolders(scope)
      expect(texts.length).toBeGreaterThan(20)
      const low = texts
        .map(el => ({ text: el.textContent!.trim().slice(0, 20), ratio: Math.round(contrastOf(el) * 100) / 100 }))
        .filter(t => t.ratio < 4.5)
      expect(low).toEqual([])
    })
  }
})
