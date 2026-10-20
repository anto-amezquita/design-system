# DescriptionList

> Labelled values, like the details panel of a file or an order: terms and their descriptions, side by side or stacked

- Tier: primitives
- Storybook: `Components/DescriptionList`
- Import: `import { DescriptionList } from '@amezquita/design-system/components/primitives/DescriptionList'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `{ term: React.ReactNode; description: React.ReactNode \| React.ReactNode[]; id?: string }[]` | The pairs, in order. |
| `layout?` | `'inline' \| 'stacked'` | `inline` (default): term and value side by side, falling back to stacked when the list is narrower than 30rem. `stacked`: term above its value. |
| `divided?` | `boolean` | A line between pairs. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDListElement>, 'children'>`

## Best practices

### Do

- Use it for read-only details: a file's metadata, an order summary, a profile's facts.
- Keep terms short; they're labels, not sentences.
- Put rich values in the description (a StatusDot, a Timestamp, a Link) rather than formatting text by hand.

### Don't

- Don't use it for editable fields; that's a FormLayout with Fields.
- Don't use it for data people compare across rows; that's Table.
- Don't leave a term without a value; show "—" or "None" so the pair still reads.

## Accessibility

- A `dl` with `dt` and `dd`, so screen readers announce terms and their definitions as pairs; each pair is wrapped in a `div`, which HTML allows inside a `dl`
- Visual order matches source order in both layouts, so reading order never jumps
- Terms and values are tested at 4.5:1 on the primary and secondary surfaces in all five brands, light and dark
- Long values wrap instead of overflowing, down to 320px wide
