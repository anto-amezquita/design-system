---
"@amezquita/design-system": minor
---

New `ChatMessage` pattern: one message in a conversation. `role` sets the layout: the user's words in a bubble on the end side, the assistant's as plain text in a reading column on the start side, system notes small and centred. Each message is an `article` named by its `author` and `timestamp`, so screen readers can move message by message; `continued` hides the name, time and avatar from sight for a follow-up but keeps them read out. `status="streaming"` marks the message busy and shows a typing indicator until text arrives (still under reduced motion), `error` describes a failed message, and `actions` holds Copy or Retry. No new tokens.
