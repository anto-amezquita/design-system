# ChatComposer

> Where a message is written and sent in a conversation: a field that grows with the text, Enter to send, and Stop while a reply streams

- Tier: patterns
- Storybook: `Components/ChatComposer`
- Import: `import { ChatComposer } from '@amezquita/design-system/components/patterns/ChatComposer'`

## Props

| Prop | Type | Description |
|---|---|---|
| `onSubmit` | `(message: string) => void` | Called with the message (trimmed) when it's sent with Enter or the Send button. |
| `label?` | `string` | The text field's name for screen readers; it isn't shown. Default "Message". |
| `placeholder?` | `string` | Shown in the empty field: "Ask about tokens…". |
| `value?` | `string` | Controlled text. Pair with `onValueChange`, and clear it yourself after `onSubmit`. |
| `defaultValue?` | `string` | Uncontrolled starting text. The field clears itself after sending. |
| `onValueChange?` | `(value: string) => void` | Called on every change. |
| `status?` | `'idle' \| 'streaming'` | `streaming`: a reply is arriving. Send becomes Stop (`onStop`), and Enter doesn't send, so a draft can be written in the meantime. |
| `onStop?` | `() => void` | Called by the Stop button while `streaming`. |
| `maxRows?` | `number` | The field grows with the text up to this many lines, then scrolls. Default 8. |
| `hint?` | `React.ReactNode` | The line under the field. Default: how Enter and Shift + Enter work, as keycaps. `null` hides it (on a touch-only screen, say). |
| `actions?` | `React.ReactNode` | Controls at the start of the bar, such as an Attach IconButton. |
| `attachments?` | `React.ReactNode` | Above the text: what's attached, such as removable Tags. |
| `disabled?` | `boolean` | The whole composer can't be used (the conversation is closed, say). |

Also accepts all props of: `Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>`

## Best practices

### Do

- Keep the hint on screens with a keyboard; it's the only place Shift + Enter is explained.
- Pass `status="streaming"` while a reply arrives, and wire `onStop` to cancel it.
- Put attachments in `attachments` as removable Tags named after the file.

### Don't

- Don't send on Enter in a field where new lines are the norm (a comment, an email); that's a Textarea with a Send button.
- Don't clear a controlled value before `onSubmit` has the text.
- Don't put the conversation's announcements here; the message list announces new messages.

## Accessibility

- A `form` and a native `textarea`, both named by `label`; the field is described by the hint, so the Enter and Shift + Enter keys are announced, not just shown
- Enter sends and Shift + Enter adds a line. Enter that confirms a word in an input method (Japanese, Chinese, Korean) never sends: it's checked with `isComposing`
- Send is a real submit button named "Send". It's disabled while the message is empty or blank, since there's nothing to send and the empty field says why. While streaming it becomes "Stop the reply"
- Focus stays in the field after sending, from Enter or from the button, so the next message can be typed straight away. A click on the box's padding or empty bar puts the caret in the field
- The focus ring is drawn on the whole box, which is what reads as the field. Text, placeholder and hint are tested at 4.5:1 and the edge at 3:1, in all five brands, light and dark
