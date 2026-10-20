import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollArea } from './ScrollArea'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  args: {
    label: 'Release notes',
    orientation: 'vertical',
    maxHeight: '12rem',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'] },
  },
}

export default meta
type Story = StoryObj<typeof ScrollArea>

const frame: React.CSSProperties = {
  maxWidth: '24rem',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-component)',
}
const text: React.CSSProperties = {
  margin: 0,
  padding: 'var(--space-inline-gap) var(--space-element-gap)',
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-small)',
  lineHeight: 'var(--line-height-small)',
  color: 'var(--color-text-primary)',
}
const notes = ['Divider', 'Kbd', 'Progress Bar', 'Icon Button', 'Toggle Button', 'Segmented Control', 'Button Group', 'Slider', 'Carousel', 'Field', 'Input Group', 'Number Input', 'Search', 'Calendar', 'Date Picker']

export const Default: Story = {
  render: args => (
    <div style={frame}>
      <ScrollArea {...args}>
        {notes.map(n => <p key={n} style={text}>New: {n}</p>)}
      </ScrollArea>
    </div>
  ),
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal', label: 'Brand swatches', maxHeight: undefined },
  render: args => (
    <div style={frame}>
      <ScrollArea {...args}>
        <div style={{ display: 'flex', gap: 'var(--space-inline-gap)', padding: 'var(--space-element-gap)', inlineSize: 'max-content' }}>
          {notes.map(n => (
            <span key={n} style={{ ...text, padding: 'var(--space-inline-gap)', background: 'var(--color-surface-secondary)', borderRadius: 'var(--border-radius-component)', whiteSpace: 'nowrap' }}>{n}</span>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={frame}>
      <ScrollArea label="Release notes" maxHeight="10rem">
        {notes.map(n => <p key={n} style={text}>New: {n}</p>)}
      </ScrollArea>
    </div>
  ),
  decorators: [darkModeDecorator],
}
