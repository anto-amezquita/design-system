/**
 * ToolCall: the summary names the call, its tool and its status in words;
 * input and output sit behind a disclosure as named code blocks; a running
 * call is busy; a call that needs permission asks in a named group with
 * Allow and Deny; and text and status icons are readable in every brand.
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
import { ToolCall, type ToolCallStatus } from './ToolCall'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('ToolCall', () => {
  test('the summary is a disclosure button naming the call, the tool, the status and the time', async () => {
    const { getByRole } = render(
      <ToolCall name="search_tokens" title="Search the tokens" status="success" durationMs={820} input={{ query: 'radius' }} output={{ results: 2 }} />,
    )
    const button = getByRole('button', { name: /Search the tokens/ })
    expect(button.textContent).toContain('search_tokens')
    expect(button.textContent).toContain('Done · 820 ms')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    const input = getByRole('figure', { name: /Input/ })
    const lines = Array.from(input.querySelectorAll('.code-block__text')).map(l => l.textContent)
    expect(lines).toEqual(['{', '  "query": "radius"', '}'])
    expect(getByRole('figure', { name: /Output/ })).toBeTruthy()
  })

  test('a string input or output is shown as it is', async () => {
    const { getByRole } = render(<ToolCall name="run" status="success" input="npm test" defaultOpen />)
    expect(getByRole('figure', { name: /Input/ }).querySelector('.code-block__text')!.textContent).toBe('npm test')
  })

  test('with nothing to show, there is no disclosure, only the summary', () => {
    const { queryByRole, container } = render(<ToolCall name="list_components" status="pending" />)
    expect(queryByRole('button')).toBeNull()
    expect(container.textContent).toContain('list_components')
    expect(container.textContent).toContain('Waiting')
  })

  test('the icon is hidden from screen readers; the status is in words', () => {
    const { container } = render(<ToolCall name="x" status="error" />)
    expect(container.querySelector('.tool-call__icon')!.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('.tool-call__status')!.textContent).toBe('Failed')
  })

  test('running is busy; finished calls show their time', () => {
    const { container, rerender } = render(<ToolCall name="x" status="running" durationMs={5} />)
    const el = container.firstElementChild!
    expect(el.getAttribute('aria-busy')).toBe('true')
    expect(el.textContent).not.toContain('ms')
    rerender(<ToolCall name="x" status="error" durationMs={14200} />)
    expect(el.hasAttribute('aria-busy')).toBe(false)
    expect(el.textContent).toContain('Failed · 14 s')
    rerender(<ToolCall name="x" status="success" durationMs={1530} />)
    expect(el.textContent).toContain('Done · 1.5 s')
  })

  test('a failed call shows why in its details', async () => {
    const { getByRole, container } = render(<ToolCall name="run_tests" status="error" error="3 tests failed" input="npm test" />)
    await userEvent.click(getByRole('button'))
    expect(container.querySelector('.tool-call__error')!.textContent).toBe('3 tests failed')
  })

  test('awaiting approval: a group named by the question and the call, with Allow and Deny', async () => {
    const onApprove = vi.fn()
    const onDeny = vi.fn()
    const { getByRole } = render(
      <ToolCall name="write_file" title="Write acme.json" status="awaiting-approval" onApprove={onApprove} onDeny={onDeny} />,
    )
    const group = getByRole('group', { name: 'Allow this? Write acme.json' })
    expect(group.textContent).toContain('Allow')
    await userEvent.click(getByRole('button', { name: 'Allow' }))
    await userEvent.click(getByRole('button', { name: 'Deny' }))
    expect(onApprove).toHaveBeenCalledOnce()
    expect(onDeny).toHaveBeenCalledOnce()
  })

  test('passes className, data attributes and ref to the wrapper', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(<ToolCall name="x" status="pending" className="extra" data-x="1" ref={n => { node = n }} />)
    const el = container.firstElementChild as HTMLDivElement
    expect(el.className).toContain('extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const
const statuses: ToolCallStatus[] = ['pending', 'running', 'success', 'error', 'awaiting-approval', 'denied']

/** Contrast of an icon's colour against what's behind it, measured as text of that colour. */
function iconContrast(icon: Element) {
  const probe = document.createElement('span')
  probe.textContent = 'x'
  probe.style.color = getComputedStyle(icon).color
  icon.parentElement!.append(probe)
  const ratio = contrastOf(probe)
  probe.remove()
  return ratio
}

describe('ToolCall follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: titles and status words readable, status icons visible`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {statuses.map(s => <ToolCall key={s} name="tool_name" title="A call" status={s} error="Why" input="x" defaultOpen />)}
          </div>,
        )
        for (const call of container.querySelectorAll('.tool-call')) {
          expect(contrastOf(call.querySelector('.tool-call__title')!)).toBeGreaterThanOrEqual(4.5)
          expect(contrastOf(call.querySelector('.tool-call__status')!)).toBeGreaterThanOrEqual(4.5)
          expect(contrastOf(call.querySelector('.tool-call__name')!)).toBeGreaterThanOrEqual(4.5)
          expect(iconContrast(call.querySelector('.tool-call__icon')!)).toBeGreaterThanOrEqual(3)
        }
        expect(contrastOf(container.querySelector('.tool-call__error')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
