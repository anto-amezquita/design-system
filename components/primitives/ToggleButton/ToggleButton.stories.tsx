import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { GridFourIcon, SpeakerSlashIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon } from '@phosphor-icons/react'
import { ToggleButton } from './ToggleButton'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ToggleButton> = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  args: {
    label: 'Show grid',
    icon: <GridFourIcon />,
    defaultPressed: false,
    hideLabel: false,
  },
  argTypes: {
    icon: { control: false },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
}

export default meta
type Story = StoryObj<typeof ToggleButton>

const row: React.CSSProperties = { display: 'flex', gap: 'var(--space-inline-gap)', alignItems: 'center', flexWrap: 'wrap' }

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('button', { name: 'Show grid' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  },
}

export const States: Story = {
  render: () => (
    <div style={row}>
      <ToggleButton label="Off" />
      <ToggleButton label="On" defaultPressed />
      <ToggleButton label="Off, disabled" disabled />
      <ToggleButton label="On, disabled" defaultPressed disabled />
    </div>
  ),
}

export const IconOnly: Story = {
  name: 'Icon only (text formatting)',
  render: () => (
    <div style={row} role="group" aria-label="Text formatting">
      <ToggleButton hideLabel icon={<TextBIcon />} label="Bold" defaultPressed />
      <ToggleButton hideLabel icon={<TextItalicIcon />} label="Italic" />
      <ToggleButton hideLabel icon={<TextUnderlineIcon />} label="Underline" />
      <ToggleButton hideLabel size="sm" icon={<SpeakerSlashIcon />} label="Mute" />
    </div>
  ),
}

function ControlledExample() {
  const [muted, setMuted] = useState(false)
  return (
    <div style={{ ...row, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <ToggleButton label="Mute" icon={<SpeakerSlashIcon />} pressed={muted} onPressedChange={setMuted} />
      <span>Sound is {muted ? 'off' : 'on'}</span>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
}

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
      <div style={row}>
        <ToggleButton label="Off" icon={<GridFourIcon />} />
        <ToggleButton label="On" icon={<GridFourIcon />} defaultPressed />
        <ToggleButton label="Disabled" disabled />
      </div>
      <div style={row}>
        <ToggleButton hideLabel icon={<TextBIcon />} label="Bold" defaultPressed />
        <ToggleButton hideLabel icon={<TextItalicIcon />} label="Italic" />
      </div>
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
