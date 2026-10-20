# Image

> An image with a required `alt`, space held before it loads, a quiet fallback if it fails, and an optional caption

- Tier: primitives
- Storybook: `Components/Image`
- Import: `import { Image } from '@amezquita/design-system/components/primitives/Image'`

## Props

| Prop | Type | Description |
|---|---|---|
| `src` | `string` |  |
| `alt` | `string` | Required. What the image shows, for anyone who can't see it. Pass `""` only when it's decoration and the text around it already says everything; screen readers then skip it. |
| `ratio?` | `AspectRatioPreset \| number` | Hold the image at a ratio (`'16/9'`, `'1/1'`, a number) whatever its file's size. Leave it out to keep the file's own shape; then set `width` and `height` so the browser can hold the space before it loads. |
| `fit?` | `'cover' \| 'contain'` | With `ratio`: `cover` (default) crops to fill, `contain` shows all of it. |
| `rounded?` | `boolean` | Round the corners with the brand's image radius. |
| `caption?` | `React.ReactNode` | A caption under the image. The image and caption render as a `figure`. |
| `loading?` | `'lazy' \| 'eager'` | `lazy` (default) waits until the image is near the screen; `eager` for the first image a page shows. |

Also accepts all props of: `Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'children'>`

## Best practices

### Do

- Write `alt` as what the image tells a reader, not "image of".
- Give `width` and `height`, or a `ratio`, so the page doesn't jump while images load.
- Use `caption` for credit or context everyone should see.

### Don't

- Don't put text in images; it can't be resized, translated or read.
- Don't lazy-load the image at the top of the page; it's the one people wait for.
- Don't repeat the caption in `alt`; screen readers would read it twice.

## Accessibility

- `alt` is required by the types, so an image can't ship without a decision about it
- A failed image keeps its name (`role="img"` with the `alt`), so a screen reader still hears what should be there; a decorative one stays hidden
- With `caption`, the `figure` is named by its `figcaption`; the caption doesn't replace `alt`, which still describes the image
- The fallback icon is tested at 3:1 and the caption at 4.5:1 in all five brands, light and dark
- `decoding="async"` and lazy loading by default; set `loading="eager"` on the first image of a page so it isn't delayed
