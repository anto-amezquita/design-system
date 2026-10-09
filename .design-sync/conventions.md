# Building with the Amezquita design system

## Setup and brand

Load `styles.css` and `_ds_bundle.js` (see Loading below). Components come from `window.AmezquitaDesignSystem`.

Two providers are real requirements. Wrap the app once:

```jsx
const { ToastProvider, TooltipProvider } = window.AmezquitaDesignSystem;
<ToastProvider><TooltipProvider>{app}</TooltipProvider></ToastProvider>
```

`Tooltip` throws without `TooltipProvider`, and `useToast()` does nothing without `ToastProvider` (call `toast({ title, description, variant })` with variant `success | warning | error | info | neutral`).

**Brand: `base` is the default.** It's white-label, with neutral greys and the system font stack. Don't add a brand unless the user asks for one. For the Amezquita portfolio brand (warm neutrals, Schibsted Grotesk), wrap that region in `<ThemeScope brand="portfolio">`. The provider chain further down this README shows `ThemeScope brand="portfolio"` only because the preview cards render in that brand. It is optional, not a requirement. `ThemeScope mode="dark"` (or `"light"`) gives a region its own mode, and the overlays opened inside it (Dialog, Drawer, Menu, Select, Tooltip) follow it.

## Styling: semantic CSS custom properties

There are no utility classes. Don't invent class names. Components style themselves. For your own layout glue, use inline `style` or your own CSS with `var(--token)`. Use semantic tokens only, never the raw scales (`--color-neutral-*`, `--color-warm-*`, `--space-1`…):

| Family | Use |
|---|---|
| Surface | `--color-surface-primary`, `--color-surface-secondary`, `--color-surface-tertiary`, `--color-surface-inverse` |
| Text | `--color-text-primary`, `--color-text-secondary`, `--color-text-inverse` |
| Border | `--color-border-default`, `--color-border-strong`, `--color-border-focus` |
| Accent | `--color-accent-default`, `--color-accent-hover`, `--color-accent-foreground` |
| Feedback | `--color-feedback-{success,warning,error,info}-{background,border,foreground}` |
| Spacing | `--space-tight-gap`, `--space-inline-gap`, `--space-label-gap`, `--space-element-gap`, `--space-component-gap`, `--space-section-gap`, `--space-container-padding`, `--space-layout-margin` |
| Type | `--font-family-base`, `--font-family-heading`, `--font-family-mono`, `--font-size-body`, `--font-size-small`, `--font-size-caption`, `--line-height-body`, `--line-height-small` |
| Shape | `--border-radius-component`, `--border-radius-interactive`, `--border-radius-pill`, `--border-width-default`, `--shadow-card`, `--shadow-dropdown` |
| Width | `--size-container-text`, `--size-container-page`, `--size-container-wide` |

Breakpoints are `768px` (tablet) and `1024px` (desktop), mobile-first. `NavigationMenu` and the inline `SideNav` only appear from 1024px up. Below that, `SideNav` becomes a drawer opened by `SideNavTrigger`.

## Where the truth lives

- Every token is defined in `_ds_bundle.css`, which `styles.css` imports. Read it before styling.
- `components/<group>/<Name>/<Name>.prompt.md` has props and real story JSX. `<Name>.d.ts` is the prop contract. Groups are `primitives`, `composition` and `patterns`.
- Use `Heading` (`level` 1–5, optional `as`) for headings, not raw `<h*>` with your own sizes.

## Example

```jsx
const { Card, CardHeader, CardTitle, CardBody, CardDescription, CardFooter, Button, Badge } = window.AmezquitaDesignSystem;

<div style={{ display: 'grid', gap: 'var(--space-component-gap)', maxWidth: 'var(--size-container-text)' }}>
  <Card>
    <CardHeader>
      <CardTitle>Token audit</CardTitle>
      <Badge variant="success">Passing</Badge>
    </CardHeader>
    <CardBody>
      <CardDescription>All 35 components resolve every token they reference.</CardDescription>
    </CardBody>
    <CardFooter>
      <Button variant="secondary">View report</Button>
    </CardFooter>
  </Card>
</div>
```
