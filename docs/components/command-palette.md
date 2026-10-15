# CommandPalette

> Every action in an app, one search away: Ctrl+K or ⌘K, a few letters, Enter

- Tier: composition
- Storybook: `Components/CommandPalette`
- Import: `import { CommandPalette } from '@amezquita/design-system/components/composition/CommandPalette'`

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` |  |
| `onOpenChange` | `(open: boolean) => void` |  |
| `groups` | `{ label: string; commands: { id: string; label: string; description?: string; icon?: React.ReactNode; shortcut?: string[]; keywords?: string[]; disabled?: boolean; onSelect: () => void }[] }[]` |  |
| `title?` | `string` | Names the dialog for screen readers. Default "Command palette". |
| `placeholder?` | `string` | Names and fills the search field. Default "Search commands". |
| `emptyMessage?` | `(text: string) => string` | Shown when nothing matches. Gets the typed text. |
| `hint?` | `React.ReactNode \| null` | The key hints under the list. `null` hides them. |

## Usage example

```tsx
<Example />
```

## Best practices

### Do

- Put every command somewhere visible in the app too; the palette is a shortcut, not the only door.
- Name commands as verbs ("New page", "Switch to dark mode") and add the words people might type as `keywords`.
- Show the Ctrl+K hint on the button that opens it.

### Don't

- Don't use it for search results from your content; that's Search or Combobox.
- Don't run destructive commands straight from the palette; ask in an AlertDialog first.

## Accessibility

- A modal dialog named by a hidden title; focus starts in the search field, which is a combobox over a listbox with labelled groups
- The top match is active, so Enter runs it; Up and Down move, wrap and skip disabled commands; the count ("4 commands", "No commands match …") is announced
- Enter closes the palette, returns focus to what was focused before, then runs the command; Escape closes it the same way
- Matching ignores case and accents and also searches `keywords` and descriptions
- Shortcuts are `aria-keyshortcuts`; the keycaps are hidden so they aren't read twice
