import type { Preview, Decorator } from '@storybook/react-vite'
import { TooltipProvider } from '@/components/composition/Tooltip'
import { ToastProvider } from '@/components/composition/Toast'
import '../styles/brands/portfolio.css'
import '../styles/brands/dark.css'
import '../styles/brands/bold.css'
import '../styles/reset.css'
import './storybook.css'

// TooltipProvider and ToastProvider are stateless/pure — safe to provide globally.
const providersDecorator: Decorator = (Story) => (
  <ToastProvider>
    <TooltipProvider>
      <Story />
    </TooltipProvider>
  </ToastProvider>
)

const storyDecorator: Decorator = (Story) => (
  <div style={{ minHeight: '100vh', padding: '48px', backgroundColor: 'var(--color-surface-primary)' }}>
    <Story />
  </div>
)

const preview: Preview = {
  decorators: [storyDecorator, providersDecorator],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
  },
}

export default preview
