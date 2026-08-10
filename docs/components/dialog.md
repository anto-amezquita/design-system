# Dialog

> Overlay for tasks or information requiring focused attention

- Tier: composition
- Storybook: `Components/Dialog`
- Import: `import { Dialog } from '@amezquita/design-system/components/composition/Dialog'`

## Props

| Prop | Type | Description |
|---|---|---|
| `open?` | `boolean \| never` |  |
| `onOpenChange?` | `(open: boolean) => void \| never` |  |
| `defaultOpen?` | `never \| boolean` |  |
| `trigger?` | `React.ReactElement` | Must be a single DOM element — React.Fragment is not supported (Radix asChild). |
| `title` | `string` |  |
| `description?` | `string` |  |
| `children` | `React.ReactNode` |  |
| `footer?` | `React.ReactNode` |  |
| `size?` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  |
| `scrollable?` | `boolean` |  |
| `modal?` | `boolean` |  |
| `onPointerDownOutside?` | `(e: Event) => void` | Call e.preventDefault() to prevent the dialog from closing on outside click. |
| `onEscapeKeyDown?` | `(e: KeyboardEvent) => void` | Call e.preventDefault() to prevent the dialog from closing on Escape key. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--dialog-background` | color | `#FAFAF9` † |
| `--dialog-border` | color | `#E2DDD9` † |
| `--dialog-border-radius` | dimension | `8px` † |
| `--dialog-border-width` | dimension | `1px` |
| `--dialog-close-color` | color | `#57534E` † |
| `--dialog-close-hover` | other | `#0A0A0A` † |
| `--dialog-close-size` | dimension | `28px` |
| `--dialog-entrance-offset` | dimension | `8px` |
| `--dialog-gap` | dimension | `16px` |
| `--dialog-max-width` | dimension | `560px` |
| `--dialog-max-width-lg` | dimension | `720px` |
| `--dialog-max-width-sm` | dimension | `480px` |
| `--dialog-max-width-xl` | dimension | `1024px` |
| `--dialog-overlay-color` | color | `#E2DDD9` † |
| `--dialog-padding` | dimension | `48px` |
| `--dialog-shadow` | shadow | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` |
| `--dialog-title-size` | dimension | `24px` |
| `--dialog-title-weight` | other | `700` |
| `--dialog-z-index` | other | `400` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Dialog
  trigger={<Button>Open dialog</Button>}
  title="Confirm action"
  description="This action cannot be undone. Are you sure you want to continue?"
  footer={
    <>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
    Proceeding will permanently delete the selected items from your account.
  </p>
</Dialog>
```

## Accessibility

- Built on `@radix-ui/react-dialog` — do not replace the Radix primitive
- Focus trap: Radix handles this; do not disable it
- `Escape` closes the dialog; do not override
- `RadixDialog.Title` provides the accessible name automatically — always pass `title` prop
- Return focus to the trigger element on close (Radix default behaviour)
