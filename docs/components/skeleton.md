# Skeleton

> Placeholder loading state that mirrors the geometry of the content it replaces

- Tier: primitives
- Storybook: `Components/Skeleton`
- Import: `import { Skeleton } from '@amezquita/design-system/components/primitives/Skeleton'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'text' \| 'circle' \| 'rect'` |  |
| `width?` | `string \| number` |  |
| `height?` | `string \| number` |  |
| `lines?` | `number` |  |
| `label?` | `string` | Pass a label (e.g. "Loading…") on ONE skeleton per loading context to announce the loading state to screen readers. Omit on additional skeletons in the same region to avoid multiple identical announcements. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--skeleton-border-radius` | dimension | `4px` |
| `--skeleton-height-rect` | dimension | `48px` |
| `--skeleton-height-text` | dimension | `1em` |
