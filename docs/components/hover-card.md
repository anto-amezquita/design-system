# HoverCard

> A preview of what a link leads to: a person's profile, a page's summary

- Tier: composition
- Storybook: `Components/HoverCard`
- Import: `import { HoverCard } from '@amezquita/design-system/components/composition/HoverCard'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactNode` |  |
| `open?` | `boolean` |  |
| `defaultOpen?` | `boolean` |  |
| `onOpenChange?` | `(open: boolean) => void` |  |
| `openDelay?` | `number` | Milliseconds before opening. Defaults to `--hover-card-open-delay` (500 ms). |
| `closeDelay?` | `number` | Milliseconds before closing once the pointer leaves. Defaults to `--hover-card-close-delay` (300 ms). |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--hover-card-close-delay` | duration | `300ms` |
| `--hover-card-open-delay` | duration | `500ms` |
| `--hover-card-width` | dimension | `320px` |

## Usage example

```tsx
args => (
  <p>
    Reviewed by{' '}
    <HoverCard {...args}>
      <HoverCardTrigger><Link href="#ana">@ana</Link></HoverCardTrigger>
      <HoverCardContent aria-label="Ana Quispe"><Profile /></HoverCardContent>
    </HoverCard>
    {' '}and <Link href="#mikkel">@mikkel</Link>.
  </p>
)
```

## Best practices

### Do

- Repeat everything in the card at the link's destination; the card only saves a click.
- Keep it short: a name, a line or two, at most a couple of actions.

### Don't

- Don't put the only way to do something in a hover card; touch users never see it.
- Don't put a hover card on a button that does something; it belongs on links to things.

## Accessibility

- Built on Popover, not Radix HoverCard, which is for mouse users only: the card also opens when keyboard focus lands on the link
- Tab from the link moves into the card when it has links or buttons; Tab past the last one continues to what follows the link, and Shift+Tab goes back
- Escape closes it and keeps focus on the link; it stays open while the pointer is over it, and closes after a short grace time when the pointer leaves (WCAG 1.4.13)
- A touch doesn't open it, so tapping the link just follows it
- The link gets no popup semantics; the card is a named group, not a dialog
