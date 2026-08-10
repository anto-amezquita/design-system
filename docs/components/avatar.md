# Avatar

> User profile picture with fallback to initials when no image is provided

- Tier: primitives
- Storybook: `Components/Avatar`
- Import: `import { Avatar } from '@amezquita/design-system/components/primitives/Avatar'`

## Props

| Prop | Type | Description |
|---|---|---|
| `src?` | `string` |  |
| `alt?` | `string` |  |
| `fallback?` | `string` |  |
| `size?` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--avatar-border` | color | `#E2DDD9` † |
| `--avatar-border-radius` | dimension | `9999px` |
| `--avatar-border-width` | dimension | `1px` |
| `--avatar-fallback-background` | color | `#F4F0EB` † |
| `--avatar-fallback-font-size` | dimension | `14px` |
| `--avatar-fallback-font-weight` | fontWeight | `600` |
| `--avatar-fallback-foreground` | color | `#57534E` † |
| `--avatar-group-overlap` | dimension | `-8px` |
| `--avatar-ring-color` | color | `#0A0A0A` † |
| `--avatar-ring-width` | dimension | `2px` |
| `--avatar-size-lg` | dimension | `40px` |
| `--avatar-size-md` | other | `32px` |
| `--avatar-size-sm` | other | `24px` |
| `--avatar-size-xl` | other | `64px` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.
