# AppShell

> The frame of an app's pages: skip link, header, section navigation, main content, aside, footer and bottom bar, in the right landmarks and laid out per breakpoint

- Tier: patterns
- Storybook: `Components/AppShell`
- Import: `import { AppShell } from '@amezquita/design-system/components/patterns/AppShell'`

## Props

| Prop | Type | Description |
|---|---|---|
| `header?` | `React.ReactNode` | The page's header, usually a TopNav (which renders the `header` landmark itself). |
| `sidebar?` | `React.ReactNode` | Section navigation, usually a SideNav: a column beside the content from 1024px up, its own drawer below. Wrap the AppShell in SideNavProvider so the header's SideNavTrigger can open that drawer. |
| `aside?` | `React.ReactNode` | Secondary content beside the main content from 1024px up (details, activity), after it below. |
| `asideLabel?` | `string` | Names the aside landmark. Required with `aside`, so screen readers can tell it apart. |
| `footer?` | `React.ReactNode` | Footer content. AppShell renders the `footer` landmark around it, so don't pass a `footer` element. |
| `bottomNav?` | `React.ReactNode` | A MobileNav. The main content gets room at the bottom below 1024px so the bar doesn't cover it. |
| `children` | `React.ReactNode` | The page's content, inside `main`. |
| `mainId?` | `string` | `id` of the `main` element, which the skip link jumps to. Default `main-content`. |
| `skipLinkLabel?` | `string` | Text of the skip link. Default "Skip to main content". |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--app-shell-aside-width` | dimension | `320px` |

## Usage example

```tsx
<SideNavProvider>
  <AppShell
    header={<SectionHeader />}
    sidebar={<SideNav items={sectionItems} headerItems={headerItems} currentHref="#button" aria-label="Components" />}
    footer={<Footer />}
  >
    <Content />
  </AppShell>
</SideNavProvider>
```

## Best practices

### Do

- Use one AppShell per page layout, and put the page's own sections inside with Section.
- Wrap it in SideNavProvider when there's a SideNav, so the header's trigger can open the drawer.
- Pick the header by whether there's a SideNav (see Which header above).
- Name the aside by what it holds: "On this page", "Details".

### Don't

- Don't pass a `main` or `footer` element into the slots; AppShell already renders them, and two of each confuse landmark navigation.
- Don't nest AppShells; a dialog or drawer is the place for a second layer.
- Don't hide essential actions in the aside; below 1024px it's at the end of the page.

## Accessibility

- One of each landmark, in reading order: the `header` (yours, or TopNav's), the section `nav` (SideNav's), `main`, a named `aside`, `footer`. AppShell warns in development when an `aside` has no `asideLabel`
- A SkipLink comes first and moves focus to `main` (`tabIndex={-1}`), not just the scroll position
- Reading and tab order follow source order in both layouts: below 1024px the aside comes after main rather than being moved with CSS
- The sidebar scrolls on its own when the navigation is longer than the window, and starts below a sticky header instead of under it; the header's height is measured, so it stays right when the header wraps
- MobileNav is fixed to the bottom; its height is measured too, and the footer (or main) leaves that much room, so the bar never covers the last content. From 1024px, where MobileNav hides, the room goes away
- AppShell draws no colours of its own beyond the page surface and dividers; the navigation components carry their own contrast tests
