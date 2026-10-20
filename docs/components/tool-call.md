# ToolCall

> A tool an assistant used or wants to use: what it does, whether it's waiting, running, done or failed, its input and output, and a request for permission when it needs one

- Tier: patterns
- Storybook: `Components/ToolCall`
- Import: `import { ToolCall } from '@amezquita/design-system/components/patterns/ToolCall'`

## Props

| Prop | Type | Description |
|---|---|---|
| `name` | `string` | The tool's name as the model calls it: `search_tokens`. Shown in the monospace face. |
| `title?` | `string` | What the call does, in words: "Search the tokens for “radius”". Default: the name. |
| `status` | `'pending' \| 'running' \| 'success' \| 'error' \| 'awaiting-approval' \| 'denied'` | `pending` (queued), `running`, `success`, `error`, `awaiting-approval` (shows Allow and Deny) or `denied`. Each has its own icon and word, not colour alone. |
| `input?` | `unknown` | The arguments: an object (shown as JSON) or a string. |
| `output?` | `unknown` | The result: an object (shown as JSON) or a string. |
| `error?` | `string` | Why it failed, shown in the details with `status="error"`. |
| `durationMs?` | `number` | How long it took, in milliseconds, shown after it finishes. |
| `onApprove?` | `() => void` | Called by Allow while `awaiting-approval`. |
| `onDeny?` | `() => void` | Called by Deny while `awaiting-approval`. |
| `defaultOpen?` | `boolean` | Show the input and output on first render. Default `false`. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>`

## Best practices

### Do

- Write `title` as what the call does for the person ("Search the tokens for “radius”"), and keep `name` for the technical detail.
- Ask for approval before anything that writes, deletes or spends, and show it as `denied` if refused.
- Put tool calls inside the assistant's ChatMessage, in the order they ran.

### Don't

- Don't show raw output to the person as the answer; the assistant's message says what it means.
- Don't auto-approve after a timeout; a request for permission waits.
- Don't use colour to tell statuses apart; the word and the icon's shape do.

## Accessibility

- The summary is Collapsible's button, so the whole line (title, tool name, status in words, time) is its name and `aria-expanded` says whether the details are open. With no input, output or error there is nothing to open, and it's plain text
- The status is a word ("Running", "Failed", "Needs your approval"), not colour alone; the icon has its own shape for each status and is hidden from screen readers. A running call is `aria-busy`, and its spinning icon stops under reduced motion
- Input and output are CodeBlocks named "Input" and "Output", with Copy, wrapped lines and a height limit on the output
- A call that needs permission asks in a group named "Allow this?" plus the call's title, with Allow and Deny as real buttons. It doesn't take focus on its own: it's part of a message the reader gets to
- Titles, tool names, status words and errors are tested at 4.5:1, and every status icon at 3:1, in all five brands, light and dark
