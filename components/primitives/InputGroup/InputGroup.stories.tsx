import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { CopyIcon } from '@phosphor-icons/react'
import { InputGroup, InputAddon } from './InputGroup'
import { Input } from '../Input'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
  decorators: [Story => <div style={{ maxWidth: '24rem', display: 'grid', gap: 'var(--space-component-gap)' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof InputGroup>

export const Default: Story = {
  name: 'Text before',
  render: () => (
    <InputGroup label="Website" hint="Your portfolio or company site.">
      <InputAddon>https://</InputAddon>
      <Input placeholder="example.dk" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Website' })
    await expect(input).toHaveAccessibleDescription('https:// Your portfolio or company site.')
  },
}

export const TextAfter: Story = {
  name: 'Text after',
  render: () => (
    <InputGroup label="Price" required>
      <Input placeholder="0" />
      <InputAddon>kr.</InputAddon>
    </InputGroup>
  ),
}

export const WithButton: Story = {
  name: 'With a button',
  render: () => (
    <>
      <InputGroup label="Discount code">
        <Input />
        <Button variant="secondary">Apply</Button>
      </InputGroup>
      <InputGroup label="Share link">
        <Input defaultValue="https://design.amezquita.dk" readOnly />
        <IconButton variant="secondary" icon={<CopyIcon />} label="Copy link" />
      </InputGroup>
    </>
  ),
}

export const Error: Story = {
  render: () => (
    <InputGroup label="Price" error="Enter a price above 0 kr.">
      <Input defaultValue="-5" />
      <InputAddon>kr.</InputAddon>
    </InputGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <InputGroup label="Website" disabled>
      <InputAddon>https://</InputAddon>
      <Input defaultValue="amezquita.dk" />
    </InputGroup>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-component-gap)' }}>
      <InputGroup label="Website" hint="Your portfolio or company site.">
        <InputAddon>https://</InputAddon>
        <Input placeholder="example.dk" />
      </InputGroup>
      <InputGroup label="Price" error="Enter a price above 0 kr.">
        <Input defaultValue="-5" />
        <InputAddon>kr.</InputAddon>
      </InputGroup>
      <InputGroup label="Discount code">
        <Input />
        <Button variant="secondary">Apply</Button>
      </InputGroup>
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
