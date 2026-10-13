# Button

> Trigger for user actions; renders as `<button>` or `<a>` depending on context

- Tier: primitives
- Storybook: `Components/Button`
- Import: `import { Button } from '@amezquita/design-system/components/primitives/Button'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'primary' \| 'secondary' \| 'ghost' \| 'link'` | How much emphasis the action gets. `primary` (default) for the one main action in a view, `secondary` for actions beside it, `ghost` for low-emphasis actions, `link` for an action that should read as text. |
| `children` | `React.ReactNode` | The label. Name the action ("Save changes"), not the element ("Click here"). |
| `onClick?` | `(event: React.MouseEvent<HTMLButtonElement \| HTMLAnchorElement>) => void` | Runs on click. It doesn't run on a disabled or loading Button, or on an internal link that `onNavigate` handles. |
| `disabled?` | `boolean` | Blocks the action. A `<button>` gets the native `disabled` attribute and leaves the tab order; an `<a>` gets `aria-disabled`, loses its `href` and is removed from the tab order. |
| `loading?` | `boolean` | Shows a spinner over the label and blocks the action like `disabled`, with `aria-busy` set. The label stays in place, invisible, so the Button keeps its width and the layout doesn't jump. Unlike `disabled`, it keeps the variant's colours: busy, not unavailable. |
| `fullWidth?` | `boolean` | Stretches the Button to the width of its container. Meant for narrow layouts and stacked forms. |
| `type?` | `'button' \| 'submit' \| 'reset'` | The native button type. Defaults to `'button'`, so a Button inside a form doesn't submit it by accident; set `'submit'` for the form's main action. Ignored when `href` is set. |
| `icon?` | `React.ReactNode` | An icon beside the label, hidden from screen readers; the label carries the meaning. For an icon-only Button, also set `aria-label`. |
| `iconPosition?` | `'start' \| 'end'` | Which side of the label the icon goes on. Defaults to `'start'`. An icon at `'end'` takes the arrow's place, so `arrow` is ignored then. |
| `arrow?` | `boolean` | Trailing arrow after the label. Off by default — turn it on for a call to action that leads somewhere. Ignored on the `link` variant, while loading, and when an icon sits at the end. |
| `motion?` | `'functional' \| 'expressive'` | `'expressive'` adds the hover wipe and glow, and loads GSAP on demand. Left at `'functional'`, hover is a plain background change and no animation code is fetched. See decisions/0016. |
| `aria-label?` | `string` | An accessible name for when the visible label isn't enough, e.g. an icon-only Button. |
| `href?` | `string` | Renders an `<a>` instead of a `<button>`, for an action that navigates. |
| `curtainColor?` | `string` | A colour passed to `onNavigate` along with the link, for a route transition that needs one. Does nothing on its own. |
| `onNavigate?` | `(href: string, curtainColor?: string) => void` | Called instead of a plain navigation when set and the link is internal — lets host apps inject route-transition behavior (e.g. a page-curtain animation) without Button depending on any specific router or transition system. Omit for a plain internal navigation. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'type'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--button-arrow-nudge` | dimension | `2px` |
| `--button-border-radius` | dimension | `9999px` † |
| `--button-ghost-background` | color | `transparent` |
| `--button-ghost-border` | color | `transparent` |
| `--button-glow-color` | color | `rgba(255, 255, 255, 0.45)` |
| `--button-glow-size` | dimension | `52px` |
| `--button-outline-border-width` | dimension | `2px` † |
| `--button-padding-x` | dimension | `24px` |
| `--button-padding-y` | dimension | `12px` |
| `--button-secondary-background` | color | `transparent` |
| `--button-secondary-background-hover` | color | `#262626` † |
| `--button-secondary-border` | color | `#262626` † |
| `--button-secondary-foreground` | color | `#262626` † |
| `--button-spinner-duration` | duration | `750ms` |
| `--button-wipe-duration-curve` | duration | `220ms` |
| `--button-wipe-duration-curve-out` | duration | `180ms` |
| `--button-wipe-duration-enter` | duration | `550ms` |
| `--button-wipe-duration-exit` | duration | `400ms` |

† resolves differently across brands and light/dark themes — see `tokens.json` for every value.

## Best practices

### Do

- Use one `primary` Button per view, for the action most people came to do.
- Name the action with a verb: "Save changes", "Send invite".
- Use `href` for anything that goes somewhere, and a plain Button for anything that acts on the page.
- Use `loading` while an action runs, instead of disabling the Button and changing its label.
- Give an icon-only Button an `aria-label`.

### Don't

- Don't put two `primary` Buttons side by side; make one of them `secondary`.
- Don't use a Button for a link inside running text; that's what `Link` is for.
- Don't disable a Button without saying nearby why. A disabled Button can't explain itself.
- Don't turn on `arrow` for an action that stays on the page; the arrow promises a destination.
- Don't make `motion="expressive"` the default in a shared wrapper unless the brand calls for it (ADR 0016).

## Accessibility

- Semantic element: `<button>` by default; `<a>` when `href` is passed
- When rendered as `<a>`: there's no native `disabled`, so `disabled` sets `aria-disabled`, drops the `href` and removes it from the tab order
- ARIA: use `aria-label` for icon-only buttons; `disabled` on `<button>` removes it from tab order
- Keyboard: `Enter` + `Space` activate `<button>`; `Enter` follows `<a>`
