import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Search } from './Search'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Search> = {
  title: 'Components/Search',
  component: Search,
  args: { label: 'Search components', placeholder: 'Button, Card, Field…' },
  decorators: [Story => <div style={{ maxWidth: '26rem', display: 'grid', gap: 'var(--space-component-gap)' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Search>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('search', { name: 'Search components' })).toBeInTheDocument()
    await expect(canvas.getByRole('searchbox', { name: 'Search components' })).toBeInTheDocument()
  },
}

export const WithShortcut: Story = {
  name: 'With a shortcut',
  args: { shortcut: '/' },
}

export const WithSubmit: Story = {
  name: 'With a Search button',
  args: { showSubmit: true },
}

export const Loading: Story = {
  args: { defaultValue: 'card', loading: true },
}

const all = ['Button', 'ButtonGroup', 'Card', 'Carousel', 'Divider', 'Field', 'IconButton', 'InputGroup', 'Kbd', 'NumberInput', 'ProgressBar', 'SegmentedControl', 'Slider']

function AsYouTypeExample() {
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(all)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      setShown(all.filter(n => n.toLowerCase().includes(q.toLowerCase())))
      setLoading(false)
    }, 250)
    return () => clearTimeout(t)
  }, [q])
  return (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <Search label="Search components" value={q} onValueChange={setQ} loading={loading} shortcut="/" />
      <p role="status" style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)' }}>
        {loading ? '' : `${shown.length} components`}
      </p>
      <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>{shown.map(n => <li key={n}>{n}</li>)}</ul>
    </div>
  )
}

export const AsYouType: Story = { name: 'Search as you type', render: () => <AsYouTypeExample /> }

export const DarkMode: Story = {
  render: args => (
    <>
      {/* Each search landmark needs its own name, or screen readers can't tell them apart. */}
      <Search {...args} label="Search components" shortcut="/" />
      <Search {...args} label="Search tokens" showSubmit />
      <Search {...args} label="Search decisions" defaultValue="card" loading />
    </>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
