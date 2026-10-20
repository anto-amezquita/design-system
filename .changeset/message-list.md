---
"@amezquita/design-system": minor
---

New `MessageList` pattern: a conversation's messages in a scrolling list. It follows the newest message while you're at the bottom, including a reply that streams in; scroll up and it stays put, with a button that counts new messages and takes you back. Your own message always brings you back down. It's a WAI-ARIA feed: articles know their position, Page Up and Page Down move between them, and each finished reply is read aloud once through a polite status region (not while streaming, not history, not your own). No new tokens.
