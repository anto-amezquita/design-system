# FileUpload

> Pick files by button or by dragging them in, see what's chosen, and remove any

- Tier: primitives
- Storybook: `Components/FileUpload`
- Import: `import { FileUpload } from '@amezquita/design-system/components/primitives/FileUpload'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | What the files are, e.g. "Attachments". |
| `hint?` | `string` | Say what's allowed: "PDF or images, up to 10 MB each." |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `accept?` | `string` | Like the native `accept`: "image/*,.pdf". Files that don't match are turned away with a reason. |
| `maxSize?` | `number` | Largest file in bytes. |
| `maxFiles?` | `number` | Most files at once. 1 makes it a single-file picker. |
| `files?` | `File[]` | Controlled list. Pair with `onFilesChange`. |
| `onFilesChange?` | `(files: File[]) => void` |  |
| `name?` | `string` |  |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'id'>`

## Best practices

### Do

- Say in the hint which types and sizes are allowed.
- Tell people why a file was turned away, as FileUpload does, and keep the ones that were fine.
- Show upload progress in your app after choosing, with ProgressBar.

### Don't

- Don't hide the button and rely on dragging alone.
- Don't clear the chosen files when another field has an error.
- Don't set `maxFiles` without saying the limit in the hint.

## Accessibility

- A real `<input type="file">`, hidden visually but focusable: Tab, Enter / Space and the system picker work as usual; its name reads "Attachments, Choose files" and the hint describes it
- Dragging is an extra, never the only way; "or drag them here" is hidden from screen readers
- Each file has a remove button named after it ("Remove portfolio.pdf"); after removing, focus moves to the next file's button, or back to the picker when the list is empty
- A polite status says what happened: "2 files added.", "cv.pdf removed.", and why a file was turned away
- Disabled doesn't fade the words, so they stay 4.5:1
