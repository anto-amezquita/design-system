# PromptForm

> Questions an assistant asks before it goes on, each a set of choices with "Other" for an answer in words, sent together and kept as a summary

- Tier: patterns
- Storybook: `Components/PromptForm`
- Import: `import { PromptForm } from '@amezquita/design-system/components/patterns/PromptForm'`

## Props

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | What the form is for, shown above the questions: "A few questions before I start". |
| `questions` | `{ id: string; question: string; options: { value: string; label: string; description?: string }[]; multiple?: boolean; allowOther?: boolean }[]` | One to four questions, answered together. |
| `onSubmit` | `(answers: PromptAnswers) => void` | Called with every answer once each question has one. The form then shows a summary. |
| `onSkip?` | `() => void` | Offer to go on without answering. The form then shows "Skipped". |
| `answers?` | `PromptAnswers \| 'skipped'` | Show a form answered earlier (in a conversation's history) as its summary, not as a form. |
| `submitLabel?` | `string` | The submit button's label. Default "Send answers". |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'onSubmit' | 'title'>`

## Best practices

### Do

- Ask only what changes what happens next, and keep it to four questions or fewer.
- Write each question as a full sentence, and add a description to an option when the label alone doesn't decide it.
- Keep the summary in the conversation (pass `answers` when you render history), so the record of what was chosen stays.

### Don't

- Don't use PromptForm for a long form or a settings page; that's FormLayout.
- Don't turn off "Other" unless the options really are the only answers.
- Don't disable Send until everything is filled; people need to hear what's missing.

## Accessibility

- A `section` region and a `form`, both named by the title. Each question is SelectableCardGroup's `fieldset`, with the question as its `legend` and native radios or checkboxes underneath
- Send is never disabled: it says what's missing instead. Each unanswered question gets an error under it with an icon and words, linked to its fieldset with `aria-describedby`, and focus moves to the first problem (its first choice, or the empty "Other" field). An error clears as soon as that question is answered
- With "Other" chosen, the question's block becomes a group named by the question, so the "Your answer" field is heard in context
- After sending or skipping, the form is replaced by a summary (a DescriptionList of question and answer), and focus moves to it, so keyboard and screen reader users aren't left on a control that's gone. A summary passed in as `answers` doesn't take focus
- Title, errors and "Skipped" are tested at 4.5:1 in all five brands, light and dark
