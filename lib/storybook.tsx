import { useEffect } from 'react'
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

/* For stories whose overlay is portalled to <body> (Menu's panel, SideNav's
   drawer): the portal lands outside darkModeDecorator's wrapper, so on its
   own it would render light. This sets data-mode="dark" on <body> while the
   story is mounted, putting the portalled content in the dark cascade too.
   Use it alongside darkModeDecorator. */
export const bodyDarkModeDecorator: Decorator = (Story) => {
  useEffect(() => {
    document.body.setAttribute('data-mode', 'dark')
    return () => document.body.removeAttribute('data-mode')
  }, [])
  return <Story />
}
