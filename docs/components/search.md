# Search

> A site or list search: a search landmark with Enter to search, Escape to clear and an optional shortcut

- Tier: primitives
- Storybook: `Components/Search`
- Import: `import { Search } from '@amezquita/design-system/components/primitives/Search'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label?` | `string` | What is searched, e.g. "Search components". Names the landmark and the field. Default "Search". |
| `placeholder?` | `string` |  |
| `value?` | `string` | Controlled query. Pair with `onValueChange`. |
| `defaultValue?` | `string` |  |
| `onValueChange?` | `(query: string) => void` | Every change, for search-as-you-type. |
| `onSearch?` | `(query: string) => void` | Enter or the submit button: run the search. |
| `showSubmit?` | `boolean` | Show a Search button after the field. Without it, Enter still submits. |
| `shortcut?` | `string` | One key that moves focus to the field from anywhere on the page, like "/" on many sites. Shown as a Kbd hint while the field is empty and unfocused; ignored while someone types in another field. |
| `loading?` | `boolean` | Results are on their way: a spinner replaces the shortcut hint and the field is `aria-busy`. |
| `disabled?` | `boolean` |  |
| `name?` | `string` |  |

Also accepts all props of: `Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'role' | 'defaultValue'>`

## Best practices

### Do

- Name it after what it searches: "Search components", not just "Search", when the page has other searches.
- Say how many results there are in a status region, so screen-reader users know it worked.
- Keep the query in the field after searching, so it can be refined.

### Don't

- Don't use Search to filter a short list that fits on screen; that can be a plain Input.
- Don't pick a shortcut that a browser or screen reader already uses; single keys like "/" are safest.
- Don't use a placeholder as the only label; `label` names it for screen readers either way.

## Accessibility

- A `<form role="search">` landmark and a searchbox (`type="search"`), both named by `label`
- Enter searches without reloading; Escape clears, a second Escape leaves the field
- The shortcut is announced with `aria-keyshortcuts` and ignored while someone types in another field, so "/" still types a slash there
- Loading sets `aria-busy`; announce the result count yourself with a `role="status"` near the results (see the "Search as you type" story)
- Each search landmark on a page needs its own name (axe: landmark-unique)
