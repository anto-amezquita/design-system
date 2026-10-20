/**
 * PromptForm: every question needs an answer, "Other" needs words, the
 * first problem gets focus, a complete form sends every answer and turns
 * into a summary that takes focus, and the frame stays readable in every
 * brand and mode.
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
import { PromptForm, type PromptQuestion } from './PromptForm'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

/** The native input is visually hidden; people click its card. */
const pick = (input: HTMLElement) => userEvent.click(input.closest('label')!)

const questions: PromptQuestion[] = [
  {
    id: 'framework',
    question: 'Which framework is the app in?',
    options: [
      { value: 'next', label: 'Next.js', description: 'App Router' },
      { value: 'vite', label: 'Vite' },
    ],
  },
  {
    id: 'brands',
    question: 'Which brands should it support?',
    multiple: true,
    allowOther: false,
    options: [
      { value: 'base', label: 'Base' },
      { value: 'warm', label: 'Demo warm' },
    ],
  },
]

const setup = (props: Partial<React.ComponentProps<typeof PromptForm>> = {}) => {
  const onSubmit = vi.fn()
  const utils = render(<PromptForm title="A few questions" questions={questions} onSubmit={onSubmit} {...props} />)
  return { ...utils, onSubmit }
}

describe('PromptForm', () => {
  test('a named region with a form; each question is a group named by the question', () => {
    const { getByRole } = setup()
    expect(getByRole('region', { name: 'A few questions' })).toBeTruthy()
    expect(getByRole('form', { name: 'A few questions' })).toBeTruthy()
    expect(getByRole('group', { name: 'Which framework is the app in?' })).toBeTruthy()
    expect(getByRole('radio', { name: 'Other' })).toBeTruthy()
    expect(getByRole('group', { name: 'Which brands should it support?' }).querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
  })

  test('sending with a question unanswered shows why and focuses its first choice', async () => {
    const { getByRole, onSubmit } = setup()
    await pick(getByRole('radio', { name: 'Vite' }))
    await userEvent.click(getByRole('button', { name: 'Send answers' }))
    expect(onSubmit).not.toHaveBeenCalled()
    const group = getByRole('group', { name: 'Which brands should it support?' })
    expect(document.getElementById(group.getAttribute('aria-describedby')!)!.textContent).toBe('Choose at least one.')
    expect(document.activeElement).toBe(getByRole('checkbox', { name: 'Base' }))
    await pick(getByRole('checkbox', { name: 'Base' }))
    expect(group.hasAttribute('aria-describedby')).toBe(false)
  })

  test('"Other" opens a text field in the question\'s context, which must be filled', async () => {
    const { getByRole, onSubmit } = setup()
    await pick(getByRole('radio', { name: 'Other' }))
    await pick(getByRole('checkbox', { name: 'Base' }))
    const field = getByRole('textbox', { name: 'Your answer' })
    expect(field.closest('[role="group"]')!.getAttribute('aria-labelledby')).toBeTruthy()
    await userEvent.click(getByRole('button', { name: 'Send answers' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(field)
    expect(field.getAttribute('aria-invalid')).toBe('true')
    await userEvent.type(field, 'Remix')
    await userEvent.click(getByRole('button', { name: 'Send answers' }))
    expect(onSubmit).toHaveBeenCalledWith({ framework: ['Remix'], brands: ['base'] })
  })

  test('a complete form sends every answer and becomes a summary that takes focus', async () => {
    const { getByRole, queryByRole, container, onSubmit } = setup()
    await pick(getByRole('radio', { name: /Next\.js/ }))
    await pick(getByRole('checkbox', { name: 'Base' }))
    await pick(getByRole('checkbox', { name: 'Demo warm' }))
    await userEvent.click(getByRole('button', { name: 'Send answers' }))
    expect(onSubmit).toHaveBeenCalledWith({ framework: ['next'], brands: ['base', 'warm'] })
    expect(queryByRole('form')).toBeNull()
    expect(document.activeElement).toBe(container.querySelector('.prompt-form__summary'))
    const text = container.querySelector('dl')!.textContent!
    expect(text).toContain('Which framework is the app in?')
    expect(text).toContain('Next.js')
    expect(text).toContain('Base, Demo warm')
  })

  test('Skip calls onSkip and leaves "Skipped"', async () => {
    const onSkip = vi.fn()
    const { getByRole, container } = setup({ onSkip })
    await userEvent.click(getByRole('button', { name: 'Skip' }))
    expect(onSkip).toHaveBeenCalled()
    expect(container.textContent).toContain('Skipped')
  })

  test('an earlier answer renders as its summary without taking focus', () => {
    const { container, queryByRole } = setup({ answers: { framework: ['vite'], brands: ['base'] } })
    expect(queryByRole('form')).toBeNull()
    expect(container.querySelector('dl')!.textContent).toContain('Vite')
    expect(document.activeElement).toBe(document.body)
  })

  test('passes className, data attributes and ref to the section', () => {
    let node: HTMLElement | null = null
    const { getByRole } = setup({ className: 'extra', ['data-x' as string]: '1', ref: (n: HTMLElement | null) => { node = n } } as never)
    const el = getByRole('region')
    expect(el.className).toContain('extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('PromptForm follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: title, error and skipped text readable`, async () => {
        const { container, getByRole } = render(
          <div data-brand={brand} data-mode={mode}>
            <PromptForm title="A few questions" questions={questions} onSubmit={() => {}} />
            <PromptForm title="Earlier" questions={questions} onSubmit={() => {}} answers="skipped" />
          </div>,
        )
        await userEvent.click(getByRole('button', { name: 'Send answers' }))
        expect(contrastOf(container.querySelector('.prompt-form__title')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('.prompt-form__error')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('.prompt-form__skipped')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
