# Divider

> A line that separates groups of content, horizontally or vertically

- Tier: primitives
- Storybook: `Components/Divider`
- Import: `import { Divider } from '@amezquita/design-system/components/primitives/Divider'`

## Props

| Prop | Type | Description |
|---|---|---|
| `orientation?` | `'horizontal' \| 'vertical'` | Direction of the line. A vertical Divider stretches to its row's height. |
| `decorative?` | `boolean` | `true` when the line only decorates: it renders `role="none"` and screen readers skip it. Leave `false` (the default) when it separates groups of content a reader should hear as separate; it then renders `role="separator"`. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'>`

## Usage example

```tsx
args => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '24rem' }}>
    <p style={text}>Account details</p>
    <Divider {...args} />
    <p style={text}>Notification settings</p>
  </div>
)
```

## Best practices

### Do

- Use a Divider between groups a reader should hear as separate: settings sections, menu groups.
- Set `decorative` when the line is only visual, like between links in a footer row.
- Let the parent's `gap` set the space around it.

### Don't

- Don't add a Divider where spacing or a heading already separates the groups; extra lines add noise.
- Don't put margins on a Divider to space content; use the layout's `gap`.
- Don't use a Divider as the border of a container; that's what Card is for.

## Accessibility

- Semantic element: `<div role="separator">`, with `aria-orientation="vertical"` when vertical; `<div role="none">` when decorative
- Not focusable; no keyboard interaction
- Drawn as a border, so it stays visible in forced-colors mode
- The line uses the default border colour, below 3:1 on purpose: it groups content but carries no meaning on its own (WCAG 1.4.11 doesn't apply). Don't let it be the only thing that tells two things apart
