---
"@amezquita/design-system": minor
---

New `PromptForm` pattern: questions an assistant asks before it goes on. One to four questions, each a set of SelectableCards (one or several) with "Other" for an answer in words. Send is never disabled: an unanswered question says what's missing and the first problem gets focus. Once sent or skipped, the form becomes a summary of question and answer that takes focus, and `answers` renders that summary for a conversation's history. No new tokens.
