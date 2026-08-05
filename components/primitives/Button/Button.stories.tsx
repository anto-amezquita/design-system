import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { StarIcon } from '@phosphor-icons/react'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button',
    variant: 'primary',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'ghost', 'link'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    children: { control: 'text' },
    icon: { table: { disable: true } },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
}

export const Link: Story = {
  args: { variant: 'link', children: 'Link button', noArrow: true },
}

export const Loading: Story = {
  args: { variant: 'primary', children: 'Saving…', loading: true },
}

export const LoadingSecondary: Story = {
  name: 'Loading (secondary)',
  args: { variant: 'secondary', children: 'Loading…', loading: true },
}

export const FullWidth: Story = {
  name: 'Full width',
  render: () => (
    <div style={{ width: '320px' }}>
      <Button variant="primary" fullWidth>Full width primary</Button>
    </div>
  ),
}

export const WithIcon: Story = {
  name: 'With icon',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" icon={<StarIcon size={16} />} iconPosition="start" noArrow>Star</Button>
      <Button variant="secondary" icon={<StarIcon size={16} />} iconPosition="end" noArrow>Star end</Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Disabled', disabled: true },
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link" noArrow>Link</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  ),
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="primary">Default</Button>
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" loading>Loading</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="ghost">Default</Button>
        <Button variant="ghost" loading>Loading</Button>
        <Button variant="ghost" disabled>Disabled</Button>
      </div>
      <div>
        <Button variant="link" noArrow>Link button</Button>
      </div>
      <Button variant="primary" fullWidth>Full width</Button>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllStates,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
