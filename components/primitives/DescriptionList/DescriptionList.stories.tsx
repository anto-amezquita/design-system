import type { Meta, StoryObj } from '@storybook/react-vite'
import { DescriptionList, type DescriptionListEntry } from './DescriptionList'
import { StatusDot } from '../StatusDot'
import { Timestamp } from '../Timestamp'
import { darkModeDecorator } from '@/lib/storybook'

const fixed = new Date(2026, 9, 20, 9, 5)

const details: DescriptionListEntry[] = [
  { term: 'Status', description: <StatusDot status="success">Published</StatusDot> },
  { term: 'Version', description: '1.5.0' },
  { term: 'Maintainers', description: ['Antonio Amézquita', 'Claude'] },
  { term: 'Last release', description: <Timestamp date={fixed} format="date" locale="en-GB" /> },
  { term: 'Licence', description: 'MIT' },
]

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  args: {
    items: details,
    layout: 'inline',
    divided: false,
  },
  argTypes: {
    items: { control: false },
    layout: { control: 'inline-radio', options: ['inline', 'stacked'] },
    divided: { control: 'boolean' },
  },
  decorators: [Story => <div style={{ maxWidth: '36rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof DescriptionList>

export const Default: Story = {}

export const Divided: Story = {
  args: { divided: true },
}

export const Stacked: Story = {
  args: { layout: 'stacked' },
}

export const Narrow: Story = {
  name: 'Inline in a narrow column (stacks)',
  decorators: [Story => <div style={{ maxWidth: '18rem' }}><Story /></div>],
}

export const DarkMode: Story = {
  name: 'Dark mode',
  args: { divided: true },
  decorators: [darkModeDecorator],
}
