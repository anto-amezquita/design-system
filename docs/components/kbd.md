# Kbd

> A key the user presses, drawn as a keycap

- Tier: primitives
- Storybook: `Components/Kbd`
- Import: `import { Kbd } from '@amezquita/design-system/components/primitives/Kbd'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactNode` |  |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Best practices

### Do

- Use Kbd for keys in help text, menus and tooltips: "Press Esc to close".
- Write keys the way they're printed on the keyboard: "Ctrl", "Enter", "K".
- Show the platform's keys when you know it: "⌘ K" on macOS, "Ctrl K" elsewhere.

### Don't

- Don't use Kbd for code or file names; that's `<code>`.
- Don't make a Kbd clickable. It shows a key; it isn't a button.
- Don't list a shortcut that doesn't exist yet.

## Accessibility

- Semantic element: native `<kbd>`
- Sized in `em`, so it matches the text around it
- Text on the keycap is 4.5:1 and the lower edge 3:1 in every brand and mode (tested)
- Screen readers read symbols literally ("⌘" may be read as "place of interest"). Write the key's name, or pair the symbol with `VisuallyHidden` text
