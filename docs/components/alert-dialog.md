# AlertDialog

> Confirmation gate for an action the user must explicitly accept or decline — real `alertdialog` role, no outside-click/close-button dismiss, unlike Dialog

- Tier: composition
- Storybook: `Components/AlertDialog`
- Import: `import { AlertDialog } from '@amezquita/design-system/components/composition/AlertDialog'`

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` |  |
| `onOpenChange` | `(open: boolean) => void` |  |
| `title` | `string` |  |
| `description?` | `string` |  |
| `children?` | `React.ReactNode` |  |
| `cancel` | `React.ReactElement` | Rendered inside AlertDialog.Cancel (asChild) — must be a single focusable element. Radix auto-focuses this on open, per the Radix Alert Dialog convention of defaulting focus to the least-destructive option. |
| `action` | `React.ReactElement` | Rendered inside AlertDialog.Action (asChild) — must be a single focusable element. Should read visually distinct from `cancel` — see the Radix Alert Dialog docs' own guidance on this. |
| `size?` | `'sm' \| 'md' \| 'lg'` |  |
| `onCloseAutoFocus?` | `(e: Event) => void` | Forwarded to Radix's onCloseAutoFocus. AlertDialog is always modal, so Radix restores focus to whatever was focused before IT opened — which, for a follow-up confirmation opened after some other dialog already closed, is often nothing useful. Pass this to manually restore focus somewhere specific instead (e.g. Dialog's own trigger, captured via its `triggerRef` prop before that Dialog closed). |

## Usage example

```tsx
<Demo />
```

## Accessibility

- Built on `@radix-ui/react-alert-dialog` — do not replace the Radix primitive, and do not substitute Dialog for it even though they look identical; the `alertdialog` role and the lack of outside-click dismiss are the entire reason this component exists
- Focus trap: Radix handles this; do not disable it
- Radix auto-focuses `cancel` on open — the least-destructive choice gets focus by default
- `Escape` closes via Cancel's path; do not override
- No close button in the header — the user must choose Cancel or Action, never dismiss silently
