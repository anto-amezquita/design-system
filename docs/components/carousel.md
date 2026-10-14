# Carousel

> A row of slides shown a few at a time, moved with buttons, dots, swipe or arrow keys

- Tier: patterns
- Storybook: `Components/Carousel`
- Import: `import { Carousel } from '@amezquita/design-system/components/patterns/Carousel'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | What the slides are, e.g. "Featured projects". Required: it names the carousel for screen readers. |
| `children` | `React.ReactNode` | CarouselSlide elements. |
| `perView?` | `1 \| 2 \| 3` | How many slides show at once: 1 (default), 2 or 3. Narrow screens can override `--carousel-per-view` in CSS. |
| `defaultIndex?` | `number` | Starting slide (0-based) when uncontrolled. |
| `index?` | `number` | Controlled slide index. The carousel scrolls to it when it changes. Pair with `onIndexChange`. |
| `onIndexChange?` | `(index: number) => void` | Called when the first visible slide changes, by button, dot, swipe or keyboard. |
| `autoplay?` | `boolean` | Rotate on its own. Off by default. When on, a pause button comes first, rotation stops while the pointer or focus is inside, and it never starts when the user has asked for reduced motion (WCAG 2.2.2). |
| `interval?` | `number` | Milliseconds per slide while rotating. Defaults to the `--carousel-autoplay-interval` token (6 s). |
| `showDots?` | `boolean` | Show the position dots. Default `true`. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--carousel-autoplay-interval` | duration | `6000ms` |
| `--carousel-dot-size` | dimension | `8px` |

## Best practices

### Do

- Use a Carousel for a set of peers where seeing a few at a time is enough: projects, quotes, product images.
- Give every slide something worth seeing on its own; many people only see the first.
- Prefer `autoplay` off. If you turn it on, give each slide time to be read.

### Don't

- Don't hide important content or the main call to action in a later slide.
- Don't use a Carousel for steps in a process; that's a Stepper.
- Don't put more than about seven slides in one; use a grid with a "show more".

## Accessibility

- WAI-ARIA carousel pattern: a `<section>` with `aria-roledescription="carousel"` named by `label`; each slide a group with `aria-roledescription="slide"` and "n of N"
- Slides out of view are `inert`, so Tab and screen readers skip what can't be seen
- Previous / Next and the dots point at the track with `aria-controls`; the current dot has `aria-current`
- A polite status says "Slide n of N" after a user moves it; it's silent while rotating
- Rotation: the pause button comes first; rotation waits while the pointer or focus is inside, and never starts under reduced motion (WCAG 2.2.2)
- Keyboard: Tab to the track, then arrow keys move a slide (mirrored right-to-left); every control is a button
- Dots are 3:1 on the page in every brand and mode (tested), with a 44px target
