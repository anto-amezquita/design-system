/**
 * Grid: columns per breakpoint (each falling back to the one below), as many
 * as fit with minItemWidth, spans, list semantics, and gaps that follow each
 * brand's spacing roles. Runs in Chromium with the real CSS, so the cascade
 * and the media queries decide.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { page } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Grid, GridItem, type GridGap } from './Grid'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const columnCount = (el: Element) => getComputedStyle(el).gridTemplateColumns.split(' ').length
const items = (n: number) => Array.from({ length: n }, (_, i) => <div key={i}>{i}</div>)

describe('Grid columns', () => {
  test('one column by default', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Grid>{items(3)}</Grid>)
    expect(getComputedStyle(container.firstElementChild!).display).toBe('grid')
    expect(columnCount(container.firstElementChild!)).toBe(1)
  })

  test('a number applies at every width', async () => {
    await page.viewport(400, 800)
    const { container } = render(<Grid columns={3}>{items(3)}</Grid>)
    expect(columnCount(container.firstElementChild!)).toBe(3)
  })

  for (const [width, expected] of [[400, 1], [800, 2], [1280, 4]] as const) {
    test(`per breakpoint at ${width}px: ${expected} columns`, async () => {
      await page.viewport(width, 800)
      const { container } = render(<Grid columns={{ base: 1, tablet: 2, desktop: 4 }}>{items(4)}</Grid>)
      expect(columnCount(container.firstElementChild!)).toBe(expected)
    })
  }

  test('a breakpoint left out takes the one below it', async () => {
    await page.viewport(800, 800)
    const { container } = render(<Grid columns={{ base: 2, desktop: 4 }}>{items(4)}</Grid>)
    expect(columnCount(container.firstElementChild!)).toBe(2)
  })

  test('columns are clamped to 1–12', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Grid columns={40}>{items(2)}</Grid>)
    expect(columnCount(container.firstElementChild!)).toBe(12)
  })

  test('minItemWidth fits as many columns as the container allows', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <div style={{ inlineSize: '800px' }}>
        <Grid minItemWidth="md" gap="none" data-g="md">{items(6)}</Grid>
        <Grid minItemWidth="sm" gap="none" data-g="sm">{items(6)}</Grid>
        <Grid minItemWidth="lg" gap="none" data-g="lg" columns={6}>{items(6)}</Grid>
      </div>,
    )
    expect(columnCount(container.querySelector('[data-g="md"]')!)).toBe(3) // 800 / 256
    expect(columnCount(container.querySelector('[data-g="sm"]')!)).toBe(4) // 800 / 192
    expect(columnCount(container.querySelector('[data-g="lg"]')!)).toBe(2) // columns ignored
  })

  test('an item never overflows a container narrower than the minimum', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <div style={{ inlineSize: '150px' }}>
        <Grid minItemWidth="lg"><div data-item>x</div></Grid>
      </div>,
    )
    expect(container.querySelector('[data-item]')!.getBoundingClientRect().width).toBe(150)
  })
})

describe('GridItem span', () => {
  test('spans columns, the full row, and per breakpoint', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Grid columns={4} gap="none" style={{ inlineSize: '400px' }}>
        <GridItem span={2} data-i="two">a</GridItem>
        <GridItem span="full" data-i="full">b</GridItem>
        <GridItem span={{ base: 'full', desktop: 1 }} data-i="resp">c</GridItem>
      </Grid>,
    )
    const w = (k: string) => container.querySelector(`[data-i="${k}"]`)!.getBoundingClientRect().width
    expect(w('two')).toBe(200)
    expect(w('full')).toBe(400)
    expect(w('resp')).toBe(100)
  })

  test('a span is clamped to 1–12', () => {
    const { container } = render(<GridItem span={20} data-i="c">d</GridItem>)
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--grid-item-column')).toBe('span 12')
  })

  test('responsive span uses the base value on a phone', async () => {
    await page.viewport(400, 800)
    const { container } = render(
      <Grid columns={4} gap="none" style={{ inlineSize: '400px' }}>
        <GridItem span={{ base: 'full', desktop: 1 }} data-i="resp">c</GridItem>
      </Grid>,
    )
    expect(container.querySelector('[data-i="resp"]')!.getBoundingClientRect().width).toBe(400)
  })
})

describe('Grid semantics', () => {
  test('ul keeps list semantics without markers', () => {
    const { getByRole, getAllByRole } = render(
      <Grid as="ul" columns={2}><GridItem as="li">One</GridItem><li>Two</li></Grid>,
    )
    const list = getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(getAllByRole('listitem')).toHaveLength(2)
    expect(getComputedStyle(list).listStyleType).toBe('none')
    expect(getComputedStyle(list).paddingInlineStart).toBe('0px')
  })

  test('passes className, style, data attributes and ref through', () => {
    let node: HTMLElement | null = null
    const { container } = render(
      <Grid className="extra" data-x="1" style={{ maxInlineSize: '10px' }} ref={n => { node = n }} />,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toBe('grid grid--gap-element grid--align-stretch extra')
    expect(el.dataset.x).toBe('1')
    expect(el.style.maxInlineSize).toBe('10px')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const
const gaps: Exclude<GridGap, 'none'>[] = ['tight', 'inline', 'element', 'component', 'section']

describe('Grid gap follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: gap and rowGap are their --space-*-gap tokens`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {gaps.map(gap => (
              <div key={gap}>
                <span data-probe={gap} style={{ display: 'block', inlineSize: `var(--space-${gap}-gap)` }} />
                <Grid columns={2} gap={gap} rowGap="tight" data-grid={gap}>{items(4)}</Grid>
              </div>
            ))}
            <span data-probe="row" style={{ display: 'block', inlineSize: 'var(--space-tight-gap)' }} />
          </div>,
        )
        const tight = container.querySelector('[data-probe="row"]')!.getBoundingClientRect().width
        for (const gap of gaps) {
          const expected = container.querySelector(`[data-probe="${gap}"]`)!.getBoundingClientRect().width
          const s = getComputedStyle(container.querySelector(`[data-grid="${gap}"]`)!)
          expect(expected, gap).toBeGreaterThan(0)
          expect(parseFloat(s.columnGap), gap).toBeCloseTo(expected, 1)
          expect(parseFloat(s.rowGap), gap).toBeCloseTo(tight, 1)
        }
      })
    }
  }
})
