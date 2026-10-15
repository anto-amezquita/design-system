# LightboxGallery

> Sub-component of Lightbox.

- Tier: composition
- Storybook: `Components/Lightbox`
- Import: `import { LightboxGallery } from '@amezquita/design-system/components/composition/Lightbox'`

## Props

| Prop | Type | Description |
|---|---|---|
| `images` | `{ src: string; alt: string; caption?: string; width?: number; height?: number; thumbnail?: string }[]` |  |
| `title` | `string` | Names the gallery and the dialog. |
| `labels?` | `{ images: { src: string; alt: string; caption?: string; width?: number; height?: number; thumbnail?: string }[]; open: boolean; onOpenChange: (open: boolean) => void; index: number; onIndexChange: (index: number) => void; title?: string; labels?: { previous?: string; next?: string; close?: string; of?: string } }['labels']` |  |
| `className?` | `string` |  |

## Usage example

See `Lightbox`'s own usage example — LightboxGallery is one of its sub-components, not used standalone.
