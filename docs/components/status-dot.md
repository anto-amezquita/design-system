# StatusDot

> A small coloured dot that marks a status (online, live, degraded, failed), always with words

- Tier: primitives
- Storybook: `Components/StatusDot`
- Import: `import { StatusDot } from '@amezquita/design-system/components/primitives/StatusDot'`

## Props

| Prop | Type | Description |
|---|---|---|
| `status?` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'error'` | What the dot means, by role, so each brand sets the colour: `neutral` (default: offline, draft, idle), `info`, `success` (online, live, passing), `warning` (away, degraded), `error` (failed, down). |
| `pulse?` | `boolean` | A slow pulse, for something live or in progress. Off for anyone who prefers reduced motion. |
| `children?` | `React.ReactNode` | The words shown next to the dot: "Online". Give this or `label`. |
| `label?` | `string` | Words read to screen readers only, when there's no room to show them. Give this or `children`; never for an error. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--status-dot-pulse-duration` | duration | `2000ms` |
| `--status-dot-size` | dimension | `8px` |

## Best practices

### Do

- Write the status in words next to the dot wherever there's room.
- Use `pulse` only for something happening right now (a live stream, a running job), one at a time.
- Map your states to the five roles: online → `success`, away → `warning`, offline → `neutral`.

### Don't

- Don't use `label` for errors or warnings someone has to act on; show the words.
- Don't pulse several dots on one screen; motion stops meaning "live" and starts being noise.
- Don't use a StatusDot as a count or a notification badge; that's Badge.

## Accessibility

- Colour never carries the status alone (WCAG 1.4.1): the types won't accept a StatusDot without `children` or `label`. The dot itself is `aria-hidden`
- `label` hides the words from sighted users, who then see only the colour. Use it only for low-stakes status that's also written out somewhere they can reach (presence next to a name, with the full status on the profile); never for an error or anything that needs action
- Each dot is its feedback role's solid colour, the same one Alert and Toast use for their edges. It's at least 3:1 on the primary surface in every brand and mode. **Known limit:** in light mode, `success` and `warning` measure about 2.9:1 on the secondary surface, in all five brands. I accepted that rather than darken the feedback colours system-wide or add colour tokens only this component would use, because the dot always comes with words
- In forced-colors mode the dot is drawn as a border in the system text colour, so it stays visible
- The pulse is a ring behind the dot, so the dot's own colour never fades; it's removed entirely for reduced motion
