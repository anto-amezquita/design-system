import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ResizablePanels } from './ResizablePanels'
import { SegmentedControl } from '../../primitives/SegmentedControl'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ResizablePanels> = {
  title: 'Components/ResizablePanels',
  component: ResizablePanels,
  args: {
    label: 'Resize file list',
    orientation: 'horizontal',
    defaultSize: 30,
    minSize: 15,
    maxSize: 70,
    step: 5,
    collapsible: false,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    children: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof ResizablePanels>

const frame: React.CSSProperties = {
  display: 'flex',
  blockSize: '18rem',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-component)',
  overflow: 'hidden',
}
const pane: React.CSSProperties = {
  padding: 'var(--space-element-gap)',
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-small)',
  lineHeight: 'var(--line-height-small)',
  color: 'var(--color-text-primary)',
}
const files = ['Button.tsx', 'Button.css', 'Button.test.tsx', 'Button.stories.tsx', 'index.ts']

const Files = () => (
  <nav aria-label="Files" style={pane}>
    {files.map(f => <div key={f}>{f}</div>)}
  </nav>
)
const Editor = () => (
  <article style={pane}>
    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Drag the line, or focus it and use the arrow keys, Home and End. Double-click to reset.</p>
  </article>
)

export const Default: Story = {
  render: args => (
    <div style={frame}>
      <ResizablePanels {...args} style={{ flex: 1 }}>
        <Files />
        <Editor />
      </ResizablePanels>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sep = within(canvasElement).getByRole('separator', { name: 'Resize file list' })
    sep.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(sep).toHaveAttribute('aria-valuenow', '35')
    await userEvent.keyboard('{ArrowLeft}')
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical', label: 'Resize preview', defaultSize: 60 },
  render: Default.render,
}

export const Collapsible: Story = {
  args: { collapsible: true, label: 'Resize file list (Enter collapses it)' },
  render: Default.render,
}

// WCAG 2.5.7: dragging needs a single-pointer alternative. The keyboard
// covers every size; for pointer users, the app offers presets and passes
// the chosen size in.
export const WithPresets: Story = {
  name: 'With size presets (single-pointer alternative)',
  render: args => {
    const [size, setSize] = useState(30)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline-gap)' }}>
        <SegmentedControl
          label="File list width"
          value={String(size)}
          onValueChange={v => setSize(Number(v))}
          options={[{ value: '20', label: 'Narrow' }, { value: '30', label: 'Medium' }, { value: '50', label: 'Wide' }]}
        />
        <div style={frame}>
          <ResizablePanels {...args} size={size} onSizeChange={setSize} style={{ flex: 1 }}>
            <Files />
            <Editor />
          </ResizablePanels>
        </div>
      </div>
    )
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: Default.render,
  decorators: [darkModeDecorator],
}
