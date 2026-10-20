import type { Meta, StoryObj } from '@storybook/react-vite'
import { List } from './List'
import { Item } from '../Item'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  args: {
    marker: 'none',
    divided: true,
    gap: 'none',
  },
  argTypes: {
    marker: { control: 'inline-radio', options: ['none', 'bullet', 'number'] },
    gap: { control: 'inline-radio', options: ['none', 'tight', 'inline', 'element'] },
    divided: { control: 'boolean' },
    ordered: { control: 'boolean' },
  },
  decorators: [Story => <div style={{ maxWidth: '28rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof List>

export const Default: Story = {
  render: args => (
    <List {...args} aria-label="Files">
      <Item title="brand-brief.pdf" description="2 MB" />
      <Item title="tokens.json" description="12 KB" />
      <Item title="case-study.md" description="8 KB" />
    </List>
  ),
}

export const Bullets: Story = {
  args: { marker: 'bullet', divided: false, gap: 'tight' },
  render: args => (
    <List {...args}>
      <li>Every colour, size and space comes from a token.</li>
      <li>A brand is a thin skin over the same components.</li>
      <li>Every component works in light and dark, in all five brands.</li>
    </List>
  ),
}

export const Numbered: Story = {
  args: { marker: 'number', divided: false, gap: 'tight' },
  render: args => (
    <List {...args}>
      <li>Write the brand brief.</li>
      <li>Pick a direction and set its tokens.</li>
      <li>Check every component in the new brand.</li>
    </List>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-component-gap)' }}>
      <List divided aria-label="Files">
        <Item title="brand-brief.pdf" description="2 MB" />
        <Item title="tokens.json" description="12 KB" />
      </List>
      <List marker="bullet" gap="tight">
        <li>Every colour comes from a token.</li>
        <li>A brand is a thin skin.</li>
      </List>
    </div>
  ),
  decorators: [darkModeDecorator],
}
