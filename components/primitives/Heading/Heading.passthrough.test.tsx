/**
 * Contract test: Heading must forward a ref and spread unrecognised props
 * onto the rendered element, and merge a consumer's className rather than
 * discarding it — the same contract decisions/0007 established for every
 * single-element primitive. Also covers the `level`/`as` decoupling this
 * component exists for (decisions/0008): `level` controls visual size,
 * `as` controls the real rendered tag, and they're independent.
 */

import { createRef } from 'react'
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

describe('Heading prop/ref passthrough', () => {
  test('ref reaches the real heading DOM node', () => {
    const ref = createRef<HTMLHeadingElement>()
    render(<Heading ref={ref} level={2}>Title</Heading>)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('H2')
  })

  test('unrecognised props spread onto the rendered element', () => {
    render(<Heading level={3} data-testid="section-title">Title</Heading>)

    expect(screen.getByTestId('section-title')).toBeInTheDocument()
  })

  test("consumer className merges with the component's own, rather than replacing it", () => {
    render(<Heading level={1} className="hero-title">Title</Heading>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.className).toContain('heading')
    expect(heading.className).toContain('heading--h1')
    expect(heading.className).toContain('hero-title')
  })
})

describe('Heading level/as decoupling', () => {
  test('defaults the rendered tag to match level', () => {
    render(<Heading level={4}>Title</Heading>)
    expect(screen.getByRole('heading', { level: 4 }).tagName).toBe('H4')
  })

  test('a large visual level can render as a smaller semantic tag', () => {
    render(<Heading level={1} as="h2">Title</Heading>)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.tagName).toBe('H2')
    expect(heading.className).toContain('heading--h1')
  })

  test('a small visual level can render as the document h1', () => {
    render(<Heading level={5} as="h1">Title</Heading>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.tagName).toBe('H1')
    expect(heading.className).toContain('heading--h5')
  })
})
