# Icon

> A Phosphor icon at one of the brand's icon sizes and colours, hidden from screen readers unless named

- Tier: primitives
- Storybook: `Components/Icon`
- Import: `import { Icon } from '@amezquita/design-system/components/primitives/Icon'`

## Props

| Prop | Type | Description |
|---|---|---|
| `icon` | `PhosphorIcon` | The icon component, from `@phosphor-icons/react`: `icon={BellIcon}`. |
| `size?` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | The brand's icon sizes: `xs` (12px in the base theme), `sm` (16), `md` (default, 20), `lg` (24), `xl` (32). Next to text, `sm` sits with small text and `md` with body text. |
| `weight?` | `IconWeight` | Phosphor weight. Default `regular`; `bold` or `fill` to match heavier text or show a selected state. |
| `tone?` | `'current' \| 'primary' \| 'secondary' \| 'accent' \| 'error'` | Colour. `current` (default) takes the text colour around it, which is right inside buttons, links and alerts. The others are for an icon on its own: `primary`, `secondary`, `accent`, `error`, each at least 3:1 on the page surfaces. |
| `label?` | `string` | Name the icon when it carries meaning nothing else on screen gives ("Warning", "Verified"). It then reads as an image with that name. Leave it out when it decorates text that says the same thing: the icon is hidden from screen readers. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'role'>`

## Best practices

### Do

- Leave `tone="current"` inside buttons, links and alerts, so the icon follows their colour in every state.
- Give `label` when the icon is the only thing that says something ("Verified", "Warning").
- Pair `sm` with small text and `md` with body text.

### Don't

- Don't make an icon clickable on its own; use IconButton, which has a name, a focus ring and a 24px target.
- Don't rely on colour alone: an `error` tone needs words or a label that say it's an error.
- Don't import a second icon set; Phosphor is the system's set, so weights and style stay consistent.

## Accessibility

- Without `label` the wrapper is `aria-hidden`, so an icon next to text that says the same thing isn't read twice
- With `label` it's `role="img"` with that name; the SVG inside stays hidden and unfocusable, so it's announced once
- Every tone is tested at 3:1 or more on the primary, secondary and tertiary surfaces in all five brands, light and dark (WCAG 1.4.11, non-text contrast)
- Drawn in `currentColor`, so in forced-colors mode it takes the system colour of whatever it sits in
