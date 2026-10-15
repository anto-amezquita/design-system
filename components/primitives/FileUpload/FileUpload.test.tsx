/**
 * FileUpload: a real file input named "<label> Choose files"; picking or
 * dropping adds files; type, size and count limits turn files away with a
 * reason; each file has a named remove button and focus lands somewhere
 * sensible after removing; a polite status says what happened. Chromium.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { FileUpload, matchesAccept } from './FileUpload'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const pdf = (name = 'cv.pdf', size = 1000) => new File(['x'.repeat(size)], name, { type: 'application/pdf' })
const png = (name = 'photo.png', size = 1000) => new File(['x'.repeat(size)], name, { type: 'image/png' })
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement
const status = (c: HTMLElement) => c.querySelector('[role="status"]')!.textContent

// Real DragEvents with a real DataTransfer, as the browser sends them.
const drag = (zone: Element, type: 'dragenter' | 'drop', files: File[] = []) => {
  const dataTransfer = new DataTransfer()
  files.forEach(f => dataTransfer.items.add(f))
  zone.dispatchEvent(new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }))
}
const drop = (zone: Element, files: File[]) => {
  act(() => drag(zone, 'dragenter'))
  act(() => drag(zone, 'drop', files))
}

describe('matchesAccept', () => {
  test.each([
    ['image/*', png(), true],
    ['image/*', pdf(), false],
    ['.pdf', pdf(), true],
    ['application/pdf', pdf(), true],
    ['image/*, .pdf', pdf(), true],
    [undefined, pdf(), true],
  ])('%s', (accept, file, expected) => {
    expect(matchesAccept(file, accept)).toBe(expected)
  })
})

describe('FileUpload', () => {
  test('a real file input, named and described', () => {
    const { container } = render(<FileUpload label="Attachments" hint="PDF only." />)
    const input = fileInput(container)
    expect(input.multiple).toBe(true)
    const name = input.getAttribute('aria-labelledby')!.split(' ').map(id => document.getElementById(id)!.textContent).join(' ')
    expect(name).toBe('Attachments Choose files')
    expect(document.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe('PDF only.')
  })

  test('choosing files lists them and says so', async () => {
    const onFilesChange = vi.fn()
    const { container, getByText } = render(<FileUpload label="Attachments" onFilesChange={onFilesChange} />)
    await userEvent.upload(fileInput(container), [pdf('a.pdf'), pdf('b.pdf')])
    expect(getByText('a.pdf')).toBeTruthy()
    expect(getByText('b.pdf')).toBeTruthy()
    expect(onFilesChange.mock.lastCall![0]).toHaveLength(2)
    expect(status(container)).toBe('2 files added.')
  })

  test('dropping files adds them; the zone highlights while dragging', () => {
    const { container, getByText } = render(<FileUpload label="Attachments" />)
    const zone = container.querySelector('.file-upload__zone')!
    act(() => drag(zone, 'dragenter'))
    expect(zone.classList.contains('file-upload__zone--dragging')).toBe(true)
    drop(zone, [png('dropped.png')])
    expect(getByText('dropped.png')).toBeTruthy()
    expect(zone.classList.contains('file-upload__zone--dragging')).toBe(false)
  })

  test('wrong type, too large and too many are turned away, each with a reason', async () => {
    const { container, getByText, queryByText } = render(
      <FileUpload label="Attachments" accept=".pdf" maxSize={2000} maxFiles={2} />,
    )
    drop(container.querySelector('.file-upload__zone')!, [pdf('ok.pdf'), png('photo.png'), pdf('big.pdf', 5000), pdf('two.pdf'), pdf('three.pdf')])
    expect(getByText('ok.pdf')).toBeTruthy()
    expect(getByText('two.pdf')).toBeTruthy()
    expect(queryByText('three.pdf')).toBeNull()
    // The reasons show in the visible list (and again in the screen-reader status).
    const reasons = Array.from(container.querySelectorAll('.file-upload__rejected li')).map(li => li.textContent)
    expect(reasons[0]).toBe("photo.png wasn't added: that type isn't allowed.")
    expect(reasons[1]).toMatch(/^big\.pdf wasn't added: it's larger than 2 kB\.$/)
    expect(reasons[2]).toBe("three.pdf wasn't added: at most 2 files.")
    expect(status(container)).toContain('2 files added.')
  })

  test('maxFiles 1: a single picker that replaces the file', async () => {
    const { container, getByText, queryByText } = render(<FileUpload label="Photo" maxFiles={1} />)
    expect(fileInput(container).multiple).toBe(false)
    expect(getByText('Choose a file')).toBeTruthy()
    await userEvent.upload(fileInput(container), png('one.png'))
    await userEvent.upload(fileInput(container), png('two.png'))
    expect(queryByText('one.png')).toBeNull()
    expect(getByText('two.png')).toBeTruthy()
  })

  test('remove: named after the file; focus goes to the next one, then back to the picker', async () => {
    const { container, getByRole } = render(<FileUpload label="Attachments" />)
    await userEvent.upload(fileInput(container), [pdf('a.pdf'), pdf('b.pdf')])
    await userEvent.click(getByRole('button', { name: 'Remove a.pdf' }))
    await expect.poll(() => document.activeElement).toBe(getByRole('button', { name: 'Remove b.pdf' }))
    expect(status(container)).toBe('a.pdf removed.')
    await userEvent.click(getByRole('button', { name: 'Remove b.pdf' }))
    await expect.poll(() => document.activeElement).toBe(fileInput(container))
  })

  test('error: invalid, red zone edge', () => {
    const { container } = render(<FileUpload label="Attachments" error="Add a file." />)
    expect(fileInput(container).getAttribute('aria-invalid')).toBe('true')
    const red = getComputedStyle(container.querySelector('.field__message--error')!).color
    expect(getComputedStyle(container.querySelector('.file-upload__zone')!).borderTopColor).toBe(red)
  })

  test('keyboard focus on the hidden input shows a ring on its visible face', async () => {
    const { container } = render(<><button type="button">before</button><FileUpload label="Attachments" /></>)
    ;(container.querySelector('button') as HTMLButtonElement).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(fileInput(container))
    expect(getComputedStyle(container.querySelector('.file-upload__button')!).outlineStyle).toBe('solid')
  })

  test('disabled: no adding by drop', () => {
    const { container, queryByText } = render(<FileUpload label="Attachments" disabled />)
    expect(fileInput(container).disabled).toBe(true)
    drop(container.querySelector('.file-upload__zone')!, [pdf('x.pdf')])
    expect(queryByText('x.pdf')).toBeNull()
  })
})
