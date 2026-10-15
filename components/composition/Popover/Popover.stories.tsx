import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { FunnelIcon } from '@phosphor-icons/react'
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './Popover'
import { Button } from '../../primitives/Button'
import { IconButton } from '../../primitives/IconButton'
import { Input } from '../../primitives/Input'
import { SegmentedControl } from '../../primitives/SegmentedControl'
import { ThemeScope } from '../ThemeScope'

const meta: Meta<typeof PopoverContent> = {
  title: 'Components/Popover',
  component: PopoverContent,
}

export default meta
type Story = StoryObj<typeof PopoverContent>

const filters = (
  <div style={{ display: 'grid', gap: 'var(--space-element-gap)', minInlineSize: '16rem' }}>
    <SegmentedControl label="Status" options={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'done', label: 'Done' }]} />
    <Input label="Owner" placeholder="Anyone" />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-inline-gap)' }}>
      <PopoverClose asChild><Button variant="secondary">Cancel</Button></PopoverClose>
      <PopoverClose asChild><Button>Apply</Button></PopoverClose>
    </div>
  </div>
)

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" icon={<FunnelIcon />}>Filters</Button>
      </PopoverTrigger>
      <PopoverContent title="Filters" showClose align="start">{filters}</PopoverContent>
    </Popover>
  ),
}

export const FromIconButton: Story = {
  name: 'From an IconButton, with an arrow',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton variant="secondary" icon={<FunnelIcon />} label="Filters" />
      </PopoverTrigger>
      <PopoverContent aria-label="Filters" showArrow>{filters}</PopoverContent>
    </Popover>
  ),
}

// Open on load, for the visual and a11y checks of the panel itself. Kept off
// the docs page, where an open overlay would cover it.
export const Open: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div style={{ minBlockSize: '22rem' }}>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary" icon={<FunnelIcon />}>Filters</Button>
        </PopoverTrigger>
        <PopoverContent title="Filters" showClose align="start">{filters}</PopoverContent>
      </Popover>
    </div>
  ),
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole('dialog', { name: 'Filters' })).toBeVisible())
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: () => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '24rem' }}>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary" icon={<FunnelIcon />}>Filters</Button>
        </PopoverTrigger>
        <PopoverContent title="Filters" showClose align="start" showArrow>{filters}</PopoverContent>
      </Popover>
    </ThemeScope>
  ),
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole('dialog', { name: 'Filters' })).toHaveAttribute('data-mode', 'dark'))
  },
}
