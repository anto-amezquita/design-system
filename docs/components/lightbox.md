# Lightbox

> Images large, one at a time, over the page: a product's photos, a portfolio piece

- Tier: composition
- Storybook: `Components/Lightbox`
- Import: `import { Lightbox } from '@amezquita/design-system/components/composition/Lightbox'`

## Props

| Prop | Type | Description |
|---|---|---|
| `images` | `{ src: string; alt: string; caption?: string; width?: number; height?: number; thumbnail?: string }[]` |  |
| `open` | `boolean` |  |
| `onOpenChange` | `(open: boolean) => void` |  |
| `index` | `number` | Which image shows, from 0. |
| `onIndexChange` | `(index: number) => void` |  |
| `title?` | `string` | Names the dialog. Default "Images". |
| `labels?` | `{ previous?: string; next?: string; close?: string; of?: string }` | Words for other languages. |

## Best practices

### Do

- Write `alt` for what the image shows, and put credits or places in `caption`.
- Pass a smaller `thumbnail` for galleries.
- Give `width` and `height`, so nothing jumps while images load.

### Don't

- Don't use a Lightbox for content people need to act on; use a Dialog.
- Don't autoplay through images; people move at their own pace.

## Accessibility

- A modal dialog named by its title and position; focus starts on Close and stays inside
- Previous and Next buttons, Left and Right, Home and End, and a sideways swipe move through the images, wrapping at the ends so no button is ever disabled
- Each change is announced: "3 of 4: Skanderborg Lake at night"
- Escape or Close shuts it and focus returns to what opened it, such as the thumbnail
- Each thumbnail is a button named "Open <alt>"; the thumbnail image itself is decorative
- Images are fitted, never cropped, and keep their space while loading when `width` and `height` are given
