import type { Decorator } from '@storybook/react-vite'

/* Wraps a story in a dark-mode scope the way the site does it: data-mode on
   the element that paints the background, so every token inside resolves
   against the dark cascade. Used by each component's DarkMode story — the
   rendered-story a11y audit runs axe on these, which is what catches
   wrong-token-on-dark-surface bugs. */
export const darkModeDecorator: Decorator = (Story) => (
  <div
    data-mode="dark"
    style={{
      background: 'var(--color-surface-primary)',
      padding: '32px',
      borderRadius: '8px',
    }}
  >
    <Story />
  </div>
)
