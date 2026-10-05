import type { Decorator } from '@storybook/react-vite'
import { ThemeScope } from '../components/composition/ThemeScope'

/* Wraps a story in a dark ThemeScope, the way a site scopes a dark region:
   data-mode="dark" on the element that paints the background, so every token
   inside resolves against the dark cascade. Overlays the story opens (a
   Menu's panel, SideNav's drawer, a Dialog) portal to <body>, and follow the
   scope there too (decisions/0021), so they render dark as well. Used by each
   component's DarkMode story; the rendered-story a11y audit runs axe on
   these, which is what catches wrong-token-on-dark-surface bugs.

   Until 1.3.2 this was a plain <div>, and Menu and SideNav also needed a
   bodyDarkModeDecorator that set data-mode on <body> for their portalled
   content. Other dark stories' overlays rendered light. */
export const darkModeDecorator: Decorator = (Story) => (
  <ThemeScope
    mode="dark"
    style={{
      background: 'var(--color-surface-primary)',
      padding: '32px',
      borderRadius: '8px',
    }}
  >
    <Story />
  </ThemeScope>
)
