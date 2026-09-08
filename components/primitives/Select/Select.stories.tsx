import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'
import { darkModeDecorator } from '@/lib/storybook'

const basicGroups = [
  {
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'angular', label: 'Angular', disabled: true },
    ],
  },
]

const groupedOptions = [
  {
    label: 'Frontend',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
    ],
  },
  {
    label: 'Backend',
    options: [
      { value: 'node', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'go', label: 'Go' },
    ],
  },
]

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  args: {
    placeholder: 'Select a framework…',
    disabled: false,
    groups: basicGroups,
    'aria-label': 'Framework',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: '280px' }}>
      <Select {...args} />
    </div>
  ),
}

export const WithDefaultValue: Story = {
  name: 'With default value',
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <Select defaultValue="react" groups={basicGroups} aria-label="Framework" />
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <Select placeholder="Select a technology…" groups={groupedOptions} aria-label="Technology" />
    </div>
  ),
}

export const GroupedOpen: Story = {
  name: 'Grouped (open)',
  // .select__label (group headings like "Frontend"/"Backend") only renders
  // inside Radix's portal-mounted dropdown content, which no other story
  // exercises since none of them open the select — Chromatic was silently
  // never snapshotting that markup. Uses defaultOpen (static, mount-time)
  // rather than a play-function click: Radix Select closes on any window
  // blur, which Chromatic's own capture step triggers, closing it again
  // before the snapshot — confirmed by a first attempt at this story
  // rendering as closed despite the click firing. defaultOpen sidesteps
  // that entirely, matching Accordion's defaultValue-driven static-open
  // stories rather than fighting a click/blur race. Puts the label styling
  // (font-size-label, decisions/0005 rounds 24-25) under visual test.
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <Select defaultOpen placeholder="Select a technology…" groups={groupedOptions} aria-label="Technology" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <Select disabled defaultValue="react" groups={basicGroups} aria-label="Framework" />
    </div>
  ),
}

export const DarkMode: Story = {
  ...Default,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
