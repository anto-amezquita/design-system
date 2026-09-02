# Hero

> Page-level section header with eyebrow, title, lead text, and an action slot

- Tier: patterns
- Storybook: `Components/Hero`
- Import: `import { Hero } from '@amezquita/design-system/components/patterns/Hero'`

## Props

| Prop | Type | Description |
|---|---|---|
| `eyebrow?` | `string` |  |
| `title` | `string` |  |
| `titleAs?` | `'h1' \| 'h2'` |  |
| `lead?` | `string` |  |
| `actions?` | `React.ReactNode` |  |
| `align?` | `'left' \| 'centered'` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--hero-background` | color | `#FAFAF9` † |
| `--hero-eyebrow-color` | color | `#57534E` † |
| `--hero-eyebrow-size` | dimension | `14px` |
| `--hero-eyebrow-spacing` | dimension | `0.01em` |
| `--hero-eyebrow-weight` | other | `600` |
| `--hero-gap` | dimension | `24px` |
| `--hero-lead-color` | color | `#57534E` † |
| `--hero-lead-max-width` | dimension | `60ch` |
| `--hero-lead-size` | dimension | `20px` |
| `--hero-max-width` | dimension | `800px` |
| `--hero-padding-x` | dimension | `32px` |
| `--hero-padding-y` | dimension | `96px` |
| `--hero-title-color` | color | `#0A0A0A` † |
| `--hero-title-weight` | other | `800` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Hero {...args} />
```

## Accessibility

- `<section>` wrapper — apply a meaningful `aria-label` at the page level when needed
- `titleAs` controls heading level; always set it correctly for document outline
- Actions slot: interactive elements inside must carry their own accessible labels
