import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Patterns/Breadcrumb',
  component: Breadcrumb,
}

export default meta
type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Design System' },
      ]}
    />
  ),
}

export const TwoLevels: Story = {
  name: 'Two levels',
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Case Studies' },
      ]}
    />
  ),
}

export const SingleLevel: Story = {
  name: 'Single level (root page)',
  render: () => (
    <Breadcrumb items={[{ label: 'Home' }]} />
  ),
}

export const CustomSeparator: Story = {
  name: 'Custom separator',
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Design System' },
      ]}
      separator="›"
    />
  ),
}

export const LongLabels: Story = {
  name: 'Long labels (truncation)',
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'A very long section name that goes on and on', href: '/section' },
        { label: 'An even longer page title that would overflow a narrow container' },
      ]}
    />
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Design System' },
      ]}
    />
  ),
}
