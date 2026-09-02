# Button

> Trigger for user actions; renders as `<button>` or `<a>` depending on context

- Tier: primitives
- Storybook: `Components/Button`
- Import: `import { Button } from '@amezquita/design-system/components/primitives/Button'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'primary' \| 'secondary' \| 'ghost' \| 'link'` |  |
| `children` | `React.ReactNode` |  |
| `onClick?` | `() => void` |  |
| `disabled?` | `boolean` |  |
| `loading?` | `boolean` |  |
| `fullWidth?` | `boolean` |  |
| `type?` | `'button' \| 'submit' \| 'reset'` |  |
| `icon?` | `React.ReactNode` |  |
| `iconPosition?` | `'start' \| 'end'` |  |
| `noArrow?` | `boolean` |  |
| `aria-label?` | `string` |  |
| `href?` | `string` |  |
| `curtainColor?` | `string` |  |
| `onNavigate?` | `(href: string, curtainColor?: string) => void` | Called instead of a plain navigation when set and the link is internal — lets host apps inject route-transition behavior (e.g. a page-curtain animation) without Button depending on any specific router or transition system. Omit for a plain internal navigation. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--button-arrow-nudge` | dimension | `2px` |
| `--button-border-radius` | dimension | `9999px` |
| `--button-border-width` | dimension | `1px` |
| `--button-duration` | duration | `200ms` |
| `--button-font-size` | dimension | `16px` |
| `--button-font-weight` | fontWeight | `500` |
| `--button-ghost-background` | color | `transparent` |
| `--button-ghost-background-hover` | color | `#F4F0EB` † |
| `--button-ghost-border` | color | `transparent` |
| `--button-ghost-foreground` | color | `#0A0A0A` † |
| `--button-glow-size` | dimension | `52px` |
| `--button-icon-gap` | dimension | `8px` |
| `--button-icon-size` | dimension | `20px` |
| `--button-outline-border-width` | dimension | `2px` |
| `--button-padding-x` | dimension | `24px` |
| `--button-padding-y` | dimension | `12px` |
| `--button-primary-background` | color | `#292524` † |
| `--button-primary-background-hover` | color | `#1C1917` † |
| `--button-primary-border` | color | `#292524` † |
| `--button-primary-foreground` | color | `#FFFFFF` † |
| `--button-secondary-background` | color | `transparent` |
| `--button-secondary-background-hover` | color | `#292524` † |
| `--button-secondary-border` | color | `#292524` † |
| `--button-secondary-foreground` | color | `#292524` † |
| `--button-secondary-foreground-hover` | color | `#FFFFFF` † |
| `--button-spinner-duration` | duration | `750ms` |
| `--button-wipe-duration-curve` | duration | `220ms` |
| `--button-wipe-duration-curve-out` | duration | `180ms` |
| `--button-wipe-duration-enter` | duration | `550ms` |
| `--button-wipe-duration-exit` | duration | `400ms` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Accessibility

- Semantic element: `<button>` by default; `<a>` when `href` is passed
- When rendered as `<a>`: no `disabled` attribute — use visual suppression only if truly needed
- ARIA: use `aria-label` for icon-only buttons; `disabled` on `<button>` removes it from tab order
- Keyboard: `Enter` + `Space` activate `<button>`; `Enter` follows `<a>`
