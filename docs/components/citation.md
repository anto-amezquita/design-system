# Citation

> A small link from a claim to its source: a numbered marker or a source chip, as in AI answers and articles

- Tier: primitives
- Storybook: `Components/Citation`
- Import: `import { Citation } from '@amezquita/design-system/components/primitives/Citation'`

## Props

| Prop | Type | Description |
|---|---|---|
| `href` | `string` | Where it links: the source's URL, or `#source-2` for a list of sources on the page. |
| `title` | `string` | The source's title. It names the link for screen readers and shows as a tooltip. |
| `index?` | `number` | The number shown: `1` for the first source. Give this or `source`. |
| `source?` | `string` | A short source name shown instead of a number: "Wikipedia", "docs.claude.com". Give this or `index`. |
| `external?` | `boolean` | Open in a new tab, and say so to screen readers. Default `false`. |

Also accepts all props of: `Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'title' | 'children' | 'target'>`

## Usage example

```tsx
args => <p style={text}>Good design is as little design as possible.<Citation {...args} /></p>
```

## Best practices

### Do

- Put the marker right after the claim it supports, before the punctuation.
- Link numbered markers to a list of sources on the page, with matching `id`s.
- Use source chips when there are only one or two sources and no list.

### Don't

- Don't number citations without a list to match; a reader can't tell what "2" is.
- Don't cite something the text doesn't actually say; a citation is a promise.
- Don't open on-page sources (`#source-1`) in a new tab.

## Accessibility

- The link's name says what it is and where it goes: "Source 1: Ten principles for good design". A bare "1" would be meaningless out of context (WCAG 2.4.4)
- The visible text ("1", "Wikipedia") is inside that name, so speech input ("click source 1") works (WCAG 2.5.3)
- It's one `aria-label` rather than hidden text around the marker: the chip is a flex box, and the accessible name would otherwise get stray spaces ("Source 1 : …")
- `external` adds "(opens in a new tab)" to the name
- The marker is tested at 4.5:1 on its chip, at rest and on hover, in all five brands, light and dark; keyboard focus shows the focus ring. In forced-colors mode it's outlined in the link colour
- It's an inline link in running text, so the 24px target size doesn't apply (WCAG 2.5.8 exception)
