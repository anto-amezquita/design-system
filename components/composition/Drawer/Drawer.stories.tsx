import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Drawer } from './Drawer'
import { Button } from '@/components/primitives/Button'
import { Checkbox } from '@/components/primitives/Checkbox'

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  argTypes: {
    side: { control: 'radio', options: ['right', 'left', 'bottom'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'full'] },
  },
}

export default meta
type Story = StoryObj<typeof Drawer>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Open drawer</Button>}
        title="Settings"
        description="Configure your preferences below."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Drawer body content goes here.
        </p>
      </Drawer>
    )
  },
}

export const FilterPanel: Story = {
  name: 'Filter panel (with Checkboxes)',
  render: () => {
    const [open, setOpen] = useState(false)
    const [filters, setFilters] = useState({
      design: true,
      frontend: false,
      ai: true,
      research: false,
      strategy: false,
    })

    const toggle = (key: keyof typeof filters) =>
      setFilters(prev => ({ ...prev, [key]: !prev[key] }))

    const activeCount = Object.values(filters).filter(Boolean).length

    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Filter {activeCount > 0 ? `(${activeCount})` : ''}
          </Button>
        }
        title="Filter projects"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFilters({ design: false, frontend: false, ai: false, research: false, strategy: false })}>
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)}>Apply</Button>
          </>
        }
      >
        <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <legend style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '8px', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
            Discipline
          </legend>
          {(Object.keys(filters) as (keyof typeof filters)[]).map(key => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox
                id={`filter-${key}`}
                checked={filters[key]}
                onCheckedChange={() => toggle(key)}
              />
              <label
                htmlFor={`filter-${key}`}
                style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            </div>
          ))}
        </fieldset>
      </Drawer>
    )
  },
}

export const AllSides: Story = {
  name: 'All sides',
  render: () => {
    const [side, setSide] = useState<'right' | 'left' | 'bottom' | null>(null)
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['right', 'left', 'bottom'] as const).map(s => (
          <Button key={s} variant="secondary" onClick={() => setSide(s)}>
            From {s}
          </Button>
        ))}
        <Drawer
          open={side !== null}
          onOpenChange={open => { if (!open) setSide(null) }}
          title={`Drawer — ${side}`}
          description={`Slides in from the ${side}.`}
          side={side ?? 'right'}
        >
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Content inside a {side} drawer.
          </p>
        </Drawer>
      </div>
    )
  },
}

export const Sizes: Story = {
  name: 'Size variants',
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'full' | null>(null)
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['sm', 'md', 'lg', 'full'] as const).map(s => (
          <Button key={s} variant="secondary" onClick={() => setSize(s)}>
            {s}
          </Button>
        ))}
        <Drawer
          open={size !== null}
          onOpenChange={open => { if (!open) setSize(null) }}
          title={`${size?.toUpperCase()} drawer`}
          size={size ?? 'md'}
        >
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            max-width: {size === 'sm' ? '320px' : size === 'md' ? '480px' : size === 'lg' ? '640px' : '100%'}
          </p>
        </Drawer>
      </div>
    )
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '24px', borderRadius: '8px', minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Open in dark mode</Button>}
        title="Dark mode drawer"
        description="Verify colors and borders look correct in dark mode."
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Background, border, text, and close button should all use dark mode tokens.
        </p>
      </Drawer>
    )
  },
}
