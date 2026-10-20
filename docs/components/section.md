# Section

> A band of a page: edge-to-edge background, space above and below, content centred at a set width with the page gutter

- Tier: primitives
- Storybook: `Components/Section`
- Import: `import { Section } from '@amezquita/design-system/components/primitives/Section'`

## Props

| Prop | Type | Description |
|---|---|---|
| `width?` | `'text' \| 'media' \| 'wide' \| 'page' \| 'full'` | How wide the content gets, centred: `text` (a readable line, 45rem in the base theme), `media` (60rem), `wide` (80rem), `page` (default, 90rem) or `full` (no limit). The background always runs edge to edge. |
| `spacing?` | `'none' \| 'component' \| 'section'` | Space above and below: `section` (default; grows with the viewport), `component` for a tighter band, `none` when the parent spaces sections. |
| `tone?` | `'default' \| 'subtle'` | Background: `default` (none, the page shows through) or `subtle` (the secondary surface) to set a band apart. For a dark band on a light page, wrap the Section in ThemeScope instead, so every component inside switches too. |
| `as?` | `'section' \| 'header' \| 'footer' \| 'main' \| 'article' \| 'aside' \| 'div'` | `section` (default), or `header`, `footer`, `main`, `article`, `aside`, `div`. A `section` is only a landmark once it has a name: pass `aria-labelledby` pointing at its heading. |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Usage example

```tsx
args => <Section {...args} aria-labelledby="s-default"><Content id="s-default" /></Section>
```

## Best practices

### Do

- Use one Section per band of a page, and let Stack or Grid lay out what's inside.
- Use `width="text"` for reading content, so lines stay a comfortable length.
- Alternate `default` and `subtle` to tell neighbouring bands apart.

### Don't

- Don't nest Sections; the gutter and spacing would double. Use Stack inside.
- Don't name every Section as a landmark; a page with twenty regions is as hard to navigate as one with none.
- Don't set a dark background on a Section by hand; components inside would keep their light colours. Use ThemeScope.

## Accessibility

- A `<section>` is only a region landmark once it has a name: pass `aria-labelledby` pointing at its heading. Without one it's a plain grouping, which is fine for bands that don't need to be jumped to
- Named Sections need different names: two regions both called "Pricing" can't be told apart (axe `landmark-unique`, checked in the stories)
- Primary and secondary text are tested at 4.5:1 or more on the `subtle` band in all five brands, light and dark
- No dark `tone`: a dark band on a light page needs every component inside to switch, so wrap the Section in `ThemeScope mode="dark"` instead
