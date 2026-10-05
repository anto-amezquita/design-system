/**
 * Contract test: Breadcrumb's <nav> takes a name and native attributes
 * (decisions/0007). It hardcoded aria-label="Breadcrumb", so two on one page
 * were two landmarks with the same name, which axe flags as landmark-unique.
 * Found by design-system-site, whose Themes page renders the same screen
 * twice (specs/2026-10-05-theme-scope.md, item 2).
 */

import { createRef } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

const items = [{ label: 'Projects', href: '/projects' }, { label: 'Settings' }]

describe('Breadcrumb passthrough', () => {
  test('names its landmark "Breadcrumb" by default', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
  })

  test('two on one page can have different names', () => {
    render(
      <>
        <Breadcrumb items={items} aria-label="Breadcrumb, base theme" />
        <Breadcrumb items={items} aria-label="Breadcrumb, portfolio theme" />
      </>,
    )
    const names = screen.getAllByRole('navigation').map(nav => nav.getAttribute('aria-label'))
    expect(names).toEqual(['Breadcrumb, base theme', 'Breadcrumb, portfolio theme'])
  })

  test('a ref and native attributes reach the <nav>', () => {
    const ref = createRef<HTMLElement>()
    const onKeyDown = vi.fn()
    render(<Breadcrumb ref={ref} items={items} id="trail" data-testid="trail" onKeyDown={onKeyDown} />)

    expect(ref.current?.tagName).toBe('NAV')
    expect(ref.current?.id).toBe('trail')
    fireEvent.keyDown(screen.getByTestId('trail'), { key: 'ArrowRight' })
    expect(onKeyDown).toHaveBeenCalledOnce()
  })

  test('className merges with the component’s own', () => {
    render(<Breadcrumb items={items} className="page-trail" />)
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('breadcrumb')
    expect(nav.className).toContain('page-trail')
  })

  test('children is rejected at compile time — the trail comes from items', () => {
    // The directive is the assertion: if `children` stops erroring, typecheck fails here.
    // @ts-expect-error - Breadcrumb builds its own children from items
    void (<Breadcrumb items={items}>extra</Breadcrumb>)
  })
})
