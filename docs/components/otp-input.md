# OtpInput

> A short code sent by text or email, shown as one box per character

- Tier: primitives
- Storybook: `Components/OtpInput`
- Import: `import { OtpInput } from '@amezquita/design-system/components/primitives/OtpInput'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | What the code is, e.g. "Verification code". |
| `hint?` | `string` | Where the code comes from: "We sent it to +45 •• •• •• 12." |
| `error?` | `string` |  |
| `length?` | `number` | Number of characters. Default 6. |
| `mode?` | `'numeric' \| 'alphanumeric'` | `numeric` (default) keeps digits only and brings up the number pad; `alphanumeric` keeps letters too, uppercased. |
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onValueChange?` | `(code: string) => void` |  |
| `onComplete?` | `(code: string) => void` | Called once the last character is in, e.g. to submit straight away. |
| `disabled?` | `boolean` |  |
| `name?` | `string` |  |
| `autoFocus?` | `boolean` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>`

## Best practices

### Do

- Say in the hint where the code went: "We sent it to +45 •• •• •• 12".
- Submit on `onComplete` when the code is all that's asked, so there's no extra button to find.
- Offer a way to send a new code nearby.

### Don't

- Don't clear the boxes on an error; let people fix one character.
- Don't use it for passwords or anything longer than about eight characters; use Input.
- Don't block paste.

## Accessibility

- One real input, not one per box: screen readers hear one field with its label and hint, and paste, SMS autofill (`autocomplete="one-time-code"`) and password managers work as usual
- No `maxlength`: the browser would cut a pasted "482 913" before the space is dropped; the component trims to `length` itself (tested)
- Characters 4.5:1 and box edges 3:1 in every brand and mode (tested); each box is 44px wide
- Announce the result of checking the code in a `role="status"` (see the "Submits when complete" story)
