import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SelectableCard, SelectableCardGroup } from './SelectableCard'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof SelectableCardGroup> = {
  title: 'Components/SelectableCard',
  component: SelectableCardGroup,
  args: {
    legend: 'Plan',
    type: 'single',
    columns: false,
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    columns: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [Story => <div style={{ maxWidth: '40rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof SelectableCardGroup>

const Plans = () => (
  <>
    <SelectableCard value="free" title="Free" meta="0 kr" description="One brand, community support." />
    <SelectableCard value="pro" title="Pro" meta="90 kr/mo" description="Five brands, Figma sync, priority support." />
    <SelectableCard value="team" title="Team" meta="Contact us" description="Unlimited brands. Not available in your region yet." disabled />
  </>
)

export const Default: Story = {
  args: { defaultValue: ['pro'] },
  render: args => <SelectableCardGroup {...args}><Plans /></SelectableCardGroup>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('One brand, community support.'))
    await expect(canvas.getByRole('radio', { name: /Free/ })).toBeChecked()
  },
}

export const Columns: Story = {
  args: { columns: true, defaultValue: ['pro'] },
  render: args => <SelectableCardGroup {...args}><Plans /></SelectableCardGroup>,
}

export const Multiple: Story = {
  args: { type: 'multiple', legend: 'Add-ons', defaultValue: ['sync'] },
  render: args => (
    <SelectableCardGroup {...args}>
      <SelectableCard value="sync" title="Figma sync" description="Tokens and components kept in step with Figma." />
      <SelectableCard value="mcp" title="MCP server" description="Agents read your components and tokens directly." />
      <SelectableCard value="docs" title="Docs site" description="A branded site for your system, synced on release." />
    </SelectableCardGroup>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  args: { defaultValue: ['pro'] },
  render: args => <SelectableCardGroup {...args}><Plans /></SelectableCardGroup>,
  decorators: [darkModeDecorator],
}
