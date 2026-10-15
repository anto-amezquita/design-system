/**
 * Lightbox: a modal of images. Buttons, arrow keys, Home/End and a swipe
 * move and wrap; each change is announced; the dialog's name includes the
 * position; Escape closes and focus returns to the thumbnail. Runs in
 * Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { LightboxGallery } from './Lightbox'
import { sampleImages } from './sample-images'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const shown = () => document.querySelector<HTMLImageElement>('.lightbox__image')?.alt
const dialog = () => document.querySelector('[role="dialog"]')
const status = () => document.querySelector('.lightbox [role="status"]')?.textContent

async function openAt(name: string) {
  const r = render(<LightboxGallery images={sampleImages} title="Places" />)
  await userEvent.click(r.getByRole('button', { name: `Open ${name}` }))
  await vi.waitFor(() => expect(dialog()).not.toBeNull())
  return r
}

describe('Lightbox', () => {
  test('thumbnails are buttons named after the image; a click opens it there', async () => {
    await openAt('Green mountains under a pale sky')
    expect(shown()).toBe('Green mountains under a pale sky')
    expect(document.querySelector('.lightbox__title')!.textContent).toBe('Places2 of 4')
    expect(document.querySelector('figcaption')!.textContent).toBe('Cusco, Peru')
  })

  test('arrows, Home and End move and wrap; the change is announced', async () => {
    await openAt('Green mountains under a pale sky')
    await userEvent.keyboard('{ArrowRight}')
    expect(shown()).toBe('A full moon over a dark lake')
    expect(status()).toBe('3 of 4: Skanderborg Lake at night')
    await userEvent.keyboard('{End}{ArrowRight}')
    expect(shown()).toBe('Desert dunes under a low orange sun')
    await userEvent.keyboard('{ArrowLeft}')
    expect(shown()).toBe('A flat grey coast in winter light')
    await userEvent.keyboard('{Home}')
    expect(shown()).toBe('Desert dunes under a low orange sun')
  })

  test('the buttons move too', async () => {
    const { getByRole } = await openAt('Desert dunes under a low orange sun')
    await userEvent.click(getByRole('button', { name: 'Previous image' }))
    expect(shown()).toBe('A flat grey coast in winter light')
  })

  test('a sideways swipe moves; a short one does not', async () => {
    await openAt('Desert dunes under a low orange sun')
    const box = document.querySelector('.lightbox')!
    fireEvent.pointerDown(box, { pointerType: 'touch', clientX: 300, clientY: 300 })
    fireEvent.pointerUp(box, { pointerType: 'touch', clientX: 200, clientY: 310 })
    expect(shown()).toBe('Green mountains under a pale sky')
    fireEvent.pointerDown(box, { pointerType: 'touch', clientX: 300, clientY: 300 })
    fireEvent.pointerUp(box, { pointerType: 'touch', clientX: 280, clientY: 300 })
    expect(shown()).toBe('Green mountains under a pale sky')
  })

  test('Escape closes and focus returns to the thumbnail', async () => {
    const { getByRole } = await openAt('A full moon over a dark lake')
    await userEvent.keyboard('{Escape}')
    await vi.waitFor(() => expect(dialog()).toBeNull())
    expect(document.activeElement).toBe(getByRole('button', { name: 'Open A full moon over a dark lake' }))
  })

  test('the close button is named and closes it', async () => {
    await openAt('Desert dunes under a low orange sun')
    await userEvent.click(within(document.body).getByRole('button', { name: 'Close' }))
    await vi.waitFor(() => expect(dialog()).toBeNull())
  })
})
