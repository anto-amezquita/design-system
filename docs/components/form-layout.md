# FormLayout

> The frame of a form: spacing, sections, rows, actions, and an error summary after a failed submit

- Tier: patterns
- Storybook: `Components/FormLayout`
- Import: `import { FormLayout } from '@amezquita/design-system/components/patterns/FormLayout'`

## Props

| Prop | Type | Description |
|---|---|---|
| `as?` | `'form' \| 'div'` | `form` (default) or `div`, when the form element lives elsewhere. |

Also accepts all props of: `React.FormHTMLAttributes<HTMLFormElement>`

## Usage example

```tsx
<FormLayout onSubmit={e => e.preventDefault()}>
  <FormSection title="Contact details" description="We only use these to send your order.">
    <FormRow>
      <Input label="First name" autoComplete="given-name" />
      <Input label="Last name" autoComplete="family-name" />
    </FormRow>
    <Input label="Email" type="email" autoComplete="email" hint="For the receipt." />
  </FormSection>
  <FormSection title="Delivery">
    <Input label="Street and number" autoComplete="street-address" />
    <FormRow columns={3}>
      <Input label="Postcode" autoComplete="postal-code" />
      <Input label="City" autoComplete="address-level2" />
      <Field label="Country">
        <Select groups={countries} placeholder="Choose" />
      </Field>
    </FormRow>
  </FormSection>
  <FormActions>
    <Button variant="secondary">Back</Button>
    <Button type="submit">Continue to payment</Button>
  </FormActions>
</FormLayout>
```

## Best practices

### Do

- Validate on submit, then show the summary and the field errors together.
- Give every field an `id` so the summary can link to it.
- Keep one column for most fields; use FormRow only for short fields that belong together.

### Don't

- Don't disable the submit button until the form is valid; let people submit and tell them what's missing.
- Don't put the main action first in FormActions; it goes last (and on top when stacked).
- Don't use FormSection for a single question with options; that's Field with `group`.

## Accessibility

- Each FormSection is a region named by its heading, so screen-reader users can jump between parts
- The error summary (GOV.UK pattern) takes focus after a failed submit, is named by its count, and links to each field; the link moves focus to the field, not just the scroll position
- Summary text is 4.5:1 on its background in every brand and mode (tested)
- Show the same message at the field (`error` on Input / Field) as in the summary
