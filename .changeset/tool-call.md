---
"@amezquita/design-system": minor
---

New `ToolCall` pattern: a tool an assistant used or wants to use. The summary names the call (`title`), the tool (`name`, monospace), its status in words with an icon of its own shape (waiting, running, done, failed, needs approval, denied) and how long it took. Input and output show as JSON or text in CodeBlocks behind a Collapsible. A call with `status="awaiting-approval"` asks "Allow this?" with Allow and Deny. Running calls are `aria-busy`, and the spinning icon stops under reduced motion. No new tokens.
