---
"@amezquita/design-system": minor
---

New `ChatComposer` pattern: where a message is written and sent. The field grows with the text up to `maxRows`, then scrolls. Enter sends the trimmed text and Shift + Enter adds a line, and an input method's Enter (`isComposing`) never sends. Send is disabled while the message is blank; with `status="streaming"` it becomes Stop (`onStop`) and Enter keeps the draft. Focus stays in the field after sending. A hint names the keys as keycaps and describes the field; `actions` and `attachments` take an Attach button and Tags. No new tokens.
