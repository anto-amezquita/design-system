import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Slider } from './Slider'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  args: { label: 'Volume', defaultValue: 40, showValue: true },
  decorators: [Story => <div style={{ maxWidth: '24rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Volume' })
    await expect(slider).toHaveValue('40')
    // Keyboard stepping is covered in Slider.test.tsx with real browser input;
    // Storybook's simulated keys don't move a native range.
  },
}

export const Formatted: Story = {
  name: 'Value in words',
  args: { label: 'Price limit', min: 0, max: 2000, step: 50, defaultValue: 750, formatValue: (v: number) => `${v} kr.` },
}

export const WithHint: Story = {
  args: { label: 'Opacity', defaultValue: 80, formatValue: (v: number) => `${v}%`, hint: 'Lower values let the background show through.' },
}

export const HiddenLabel: Story = {
  name: 'Label for screen readers only',
  args: { hideLabel: true, showValue: false },
}

export const Disabled: Story = {
  args: { disabled: true },
}

function ControlledExample() {
  const [size, setSize] = useState(16)
  return (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <Slider label="Text size" min={12} max={32} value={size} onValueChange={setSize} showValue formatValue={v => `${v}px`} />
      <p style={{ margin: 0, fontSize: `${size}px` }}>The quick brown fox</p>
    </div>
  )
}

export const Controlled: Story = { render: () => <ControlledExample /> }

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
      <Slider label="Volume" defaultValue={40} showValue />
      <Slider label="Opacity" defaultValue={80} formatValue={v => `${v}%`} showValue hint="Lower values let the background show through." />
      <Slider label="Disabled" defaultValue={30} disabled />
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
