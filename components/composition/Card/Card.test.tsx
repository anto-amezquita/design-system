/**
 * Card's header pads its own bottom when it's the card's last part, as the
 * footer would; followed by a body or footer, it leaves the bottom to them.
 * Runs in Chromium with the base CSS, so the cascade decides. Found by
 * design-system-site, whose hero card (media, title, meta) ended flush
 * under its text once its button was removed.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Button } from '../../primitives/Button'
import { Card, CardFooter, CardHeader, CardMedia, CardTitle } from './Card'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const px = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const bottom = (el: Element | null) => el && getComputedStyle(el).paddingBottom

describe('Card header padding', () => {
  test('a header that ends the card pads its bottom like a footer', () => {
    const { container } = render(
      <Card>
        <CardMedia><img alt="" src="data:," /></CardMedia>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
      </Card>,
    )
    expect(bottom(container.querySelector('.card__header'))).toBe(px('--space-container-padding'))
  })

  test('a header followed by a footer leaves the bottom to it', () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardFooter><Button>Read more</Button></CardFooter>
      </Card>,
    )
    expect(bottom(container.querySelector('.card__header'))).toBe('0px')
  })

  test('a compact card halves it', () => {
    const { container } = render(
      <Card compact>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
      </Card>,
    )
    const half = `${parseFloat(px('--space-container-padding')) / 2}px`
    expect(bottom(container.querySelector('.card__header'))).toBe(half)
  })
})
