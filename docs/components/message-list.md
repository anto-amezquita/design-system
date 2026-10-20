# MessageList

> A conversation's messages in a scrolling list that follows the newest one, waits while you read back, and reads each finished reply aloud once

- Tier: patterns
- Storybook: `Components/MessageList`
- Import: `import { MessageList } from '@amezquita/design-system/components/patterns/MessageList'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Names the conversation for screen readers: "Conversation with Assistant". |
| `children` | `React.ReactNode` | The messages, oldest first: ChatMessages, or any `article` elements. |
| `announce?` | `boolean` | Read each new message aloud once it's complete (not while it streams): "Assistant: …". Your own messages aren't read back. Default `true`. |
| `jumpLabel?` | `string` | The button that returns to the newest message when you've scrolled up. Default "Jump to latest". |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

## Usage example

```tsx
args => (
  <div style={frame}>
    <MessageList {...args}><Messages list={history} /></MessageList>
  </div>
)
```

## Best practices

### Do

- Pair it with ChatComposer under it, and give the pair a fixed height so only the messages scroll.
- Keep the list's `label` about who the conversation is with.
- Use `continued` on ChatMessages so a run from one sender sits together.

### Don't

- Don't add your own live region for new messages; this one already reads them, once.
- Don't scroll the page to the newest message yourself; the list does it, and only when you're at the bottom.
- Don't put non-message content between the articles; the feed counts every article as a message.

## Accessibility

- It follows the WAI-ARIA feed pattern: a `feed` named by `label`, each message an `article` with `aria-posinset` and `aria-setsize`, and `aria-busy` on the feed while a reply streams. Page Up and Page Down move between messages, Home and End go to the first and the newest. One message is in the tab order at a time (the newest, or the last one you were on)
- New messages are read aloud through one polite status region, as "Assistant: …", once each is complete. Streaming text isn't read token by token, the history on screen when the list mounts isn't read, and your own messages aren't read back
- The list follows the newest message only while you're at the bottom. Scroll up to read and it stays put; a button says how many new messages are waiting, and takes you back and focuses the newest. Sending a message always brings you back down. Under reduced motion the scroll jumps instead of gliding
- Tested: the feed attributes, the keys, following, waiting, the count, the jump and its focus, and what is and isn't read aloud
