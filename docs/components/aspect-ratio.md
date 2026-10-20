# AspectRatio

> Keeps media at a fixed width-to-height ratio as the width changes, and holds the space before it loads

- Tier: primitives
- Storybook: `Components/AspectRatio`
- Import: `import { AspectRatio } from '@amezquita/design-system/components/primitives/AspectRatio'`

## Props

| Prop | Type | Description |
|---|---|---|
| `ratio?` | `'1/1' \| '4/3' \| '3/2' \| '16/9' \| '21/9' \| '3/4' \| '9/16' \| number` | Width over height: a preset like `'16/9'`, or a number like `1.85`. Default `'16/9'`. A value that isn't a positive number falls back to 1/1. |
| `fit?` | `'cover' \| 'contain'` | How an `img`, `video` or `picture` child fills the box: `cover` (default) crops to fill it, `contain` shows all of it with space around. |
| `rounded?` | `boolean` | Round the corners with the brand's image radius. |

Also accepts all props of: `React.HTMLAttributes<HTMLDivElement>`

## Usage example

```tsx
args => (
  <div style={{ maxWidth: '32rem' }}>
    <AspectRatio {...args}><img src={art} alt="Abstract gradient with a pale circle at its centre" /></AspectRatio>
  </div>
)
```

## Best practices

### Do

- Wrap images, video and embeds whose size comes from the layout, like card media and galleries.
- Pick one ratio per collection, so a grid of cards lines up.
- Use `contain` for logos, diagrams and screenshots.

### Don't

- Don't put text content in an AspectRatio; text that grows (zoom, translation) gets cut off.
- Don't use it for an image that already has its own `width` and `height` and isn't resized; the browser already holds that space.
- Don't use `cover` on images where the crop would remove what matters.

## Accessibility

- No role of its own; the media inside carries the meaning, so give an `img` its `alt` (empty for decoration) and an `iframe` its `title`
- Holding the space stops the layout jumping as images load, which also keeps a keyboard or screen-magnifier user's place on the page
- `cover` crops: don't use it when the edges hold information (text, a chart's axis); use `contain`
