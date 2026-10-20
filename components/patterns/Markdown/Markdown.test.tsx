/**
 * Markdown: each element renders as the system component (so it carries
 * that component's semantics, tokens and tests), headings shift down a
 * level by default, raw HTML is never rendered, unsafe URLs are dropped,
 * and inline code is readable in every brand and mode.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Markdown } from './Markdown'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const source = `# Tokens first

Every colour comes from a **token**, so a brand is a [thin skin](https://design.amezquita.dk).

## How it works

- One semantic layer
- Five brands

1. Write the brief
2. Set the tokens

> Less, but better.

\`\`\`css
.card { padding: var(--space-container-padding); }
\`\`\`

Use \`--color-surface-primary\` for the page.

| Token | Value |
| --- | --- |
| space-1 | 4px |

---

![The token tiers](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)
`

describe('Markdown renders system components', () => {
  test('headings shift down one level by default, with ids for linking', () => {
    const { getByRole } = render(<Markdown>{source}</Markdown>)
    const h = getByRole('heading', { name: 'Tokens first' })
    expect(h.tagName).toBe('H2')
    expect(h.className).toContain('heading--h2')
    expect(h.id).toBe('tokens-first')
    expect(getByRole('heading', { name: 'How it works' }).tagName).toBe('H3')
  })

  test('headingOffset 0 keeps # as h1; deep headings cap at h6', () => {
    const { getByRole } = render(<Markdown headingOffset={0}>{'# Page\n\n###### Deep'}</Markdown>)
    expect(getByRole('heading', { name: 'Page' }).tagName).toBe('H1')
    const deep = render(<Markdown headingOffset={3}>{'##### Deeper'}</Markdown>)
    expect(deep.getByRole('heading', { name: 'Deeper' }).tagName).toBe('H6')
  })

  test('a numbered list keeps its starting number', () => {
    const { getByRole } = render(<Markdown>{'3. Third\n4. Fourth'}</Markdown>)
    expect(getByRole('list').getAttribute('start')).toBe('3')
  })

  test('paragraphs, links, lists, quotes, code, tables, images and rules', () => {
    const { container, getByRole, getAllByRole } = render(<Markdown>{source}</Markdown>)
    expect(container.querySelector('p.text')).not.toBeNull()
    expect(getByRole('link', { name: 'thin skin' }).className).toContain('link')
    const lists = getAllByRole('list')
    expect(lists.map(l => l.tagName)).toEqual(['UL', 'OL'])
    expect(lists[0].className).toContain('list--marker-bullet')
    expect(container.querySelector('blockquote.blockquote')!.textContent).toContain('Less, but better.')
    const code = getByRole('figure', { name: 'css' })
    expect(code.querySelector('.code-block__text')!.textContent).toBe('.card { padding: var(--space-container-padding); }')
    expect(container.querySelector('code.markdown__code')!.textContent).toBe('--color-surface-primary')
    expect(getByRole('table')).toBeTruthy()
    expect(getByRole('columnheader', { name: 'Token' })).toBeTruthy()
    expect(getByRole('img', { name: 'The token tiers' }).tagName).toBe('IMG')
    expect(getByRole('separator')).toBeTruthy()
  })
})

describe('Markdown spacing', () => {
  test('blocks are direct children, spaced by the element gap; a heading gets more space above', () => {
    const { container } = render(
      <div>
        <span data-probe style={{ display: 'block', inlineSize: 'var(--space-element-gap)', blockSize: 'var(--space-component-gap)' }} />
        <Markdown>{'Intro\n\n- a\n- b\n\n## Next\n\nMore'}</Markdown>
      </div>,
    )
    const probe = container.querySelector('[data-probe]')!.getBoundingClientRect()
    const blocks = Array.from(container.querySelector('.markdown')!.children)
    expect(blocks.map(b => b.tagName)).toEqual(['P', 'UL', 'H3', 'P'])
    expect(parseFloat(getComputedStyle(blocks[1]).marginTop)).toBeCloseTo(probe.width, 1)
    expect(parseFloat(getComputedStyle(blocks[2]).marginTop)).toBeCloseTo(probe.height, 1)
  })
})

describe('Markdown is safe with untrusted text', () => {
  test('raw HTML is shown as text, never rendered', () => {
    const { container } = render(
      <Markdown>{'Hello <img src=x onerror="window.__pwned=1"> and <script>window.__pwned=1</script>'}</Markdown>,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
    expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined()
    expect(container.textContent).toContain('<img src=x')
  })

  test('javascript: links lose their href', () => {
    const { container } = render(<Markdown>{'[click](javascript:alert(1))'}</Markdown>)
    const a = container.querySelector('a')
    expect(a?.getAttribute('href') ?? '').not.toMatch(/^javascript:/i)
  })
})

describe('Markdown', () => {
  test('passes className, data attributes and ref to the wrapper', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(<Markdown className="extra" data-x="1" ref={n => { node = n }}>{'Hi'}</Markdown>)
    const el = container.firstElementChild as HTMLDivElement
    expect(el.className).toBe('markdown extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Markdown follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: body text, links and inline code readable`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Markdown>{'Text with a [link](#x) and `inline code`.'}</Markdown>
          </div>,
        )
        expect(contrastOf(container.querySelector('p')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('a')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('.markdown__code')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
