# ChatMessage

> One message in a conversation, from a person or a model: who wrote it, when, what it says, and whether it's still arriving or failed

- Tier: patterns
- Storybook: `Components/ChatMessage`
- Import: `import { ChatMessage } from '@amezquita/design-system/components/patterns/ChatMessage'`

## Props

| Prop | Type | Description |
|---|---|---|
| `role` | `'user' \| 'assistant' \| 'system'` | Who wrote it. `user`: the person using the app, in a bubble on the end side. `assistant`: the other side (a model or a person), as plain text on the start side, the width of a reading column. `system`: a note about the conversation ("Antonio joined"), small and centred, its name read out but not shown. Named `role` like the messages in most chat SDKs, so `role={message.role}` maps straight across. |
| `author` | `string` | The sender's name. Always read out; shown unless `continued`. |
| `avatar?` | `React.ReactNode` | An Avatar, beside user and assistant messages. |
| `timestamp?` | `Date \| string \| number` | When it was sent, shown as a time beside the name (Timestamp). |
| `continued?` | `boolean` | The next message from the same sender: name, time and avatar are hidden from sight (still read out), and the content keeps its column. |
| `status?` | `'complete' \| 'streaming'` | `streaming`: the reply is still arriving; the message is `aria-busy`, and with no content yet it shows a typing indicator. |
| `streamingLabel?` | `string` | What the typing indicator says to screen readers. Default "Writing a reply". |
| `error?` | `string` | Why the message failed ("Not sent. Check your connection."), shown under it. |
| `actions?` | `React.ReactNode` | Controls for this message, such as Copy and Retry IconButtons, shown under it. |
| `children?` | `React.ReactNode` | The message: text, or rich content such as Markdown. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'role'>`

## Best practices

### Do

- Pass `continued` for consecutive messages from the same sender, so a run reads as one block.
- Render a model's answer through Markdown inside the message.
- Give a failed message a way out: a Retry action next to the error.

### Don't

- Don't put the conversation's live region on each message; one log around the list announces new messages once.
- Don't leave out `author` for the user's own messages; "You" is fine, silence isn't.
- Don't use colour alone to tell user and assistant apart; side and shape already do.

## Accessibility

- Each message is an `article` named by its sender and time (`aria-labelledby`), so screen reader users can move message by message and always hear who wrote it, also when the name is hidden from sight on a continued message or a system note
- The avatar is hidden from screen readers: the name already says who, and initials read out before it are noise
- A streaming message is `aria-busy` until it's complete. Announcing new messages is the conversation's job (MessageList, a polite log), not each message's
- A failed message is described by its error (`aria-describedby`), and the error has an icon and words, not colour alone
- Names, times, bubble text, system notes and errors are tested at 4.5:1, and the typing dots at 3:1, in all five brands, light and dark
