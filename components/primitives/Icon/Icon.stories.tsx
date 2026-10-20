import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon, CheckCircleIcon, SealCheckIcon, WarningIcon } from '@phosphor-icons/react'
import { Icon } from './Icon'
import { Button } from '../Button'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  args: {
    icon: BellIcon,
    size: 'md',
    weight: 'regular',
    tone: 'primary',
  },
  argTypes: {
    icon: { control: false },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    weight: { control: 'select', options: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] },
    tone: { control: 'select', options: ['current', 'primary', 'secondary', 'accent', 'error'] },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

const text: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-primary)',
}
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-inline-gap)' }

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ ...row, alignItems: 'flex-end' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => <Icon key={s} icon={BellIcon} size={s} tone="primary" />)}
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={row}>
      {(['primary', 'secondary', 'accent', 'error'] as const).map(t => <Icon key={t} icon={BellIcon} tone={t} size="lg" />)}
    </div>
  ),
}

export const WithText: Story = {
  name: 'With text',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-element-gap)' }}>
      <p style={{ ...text, ...row }}>
        <Icon icon={CheckCircleIcon} weight="fill" tone="accent" />
        Saved
      </p>
      <p style={{ ...text, ...row }}>
        Antonio Amézquita
        <Icon icon={SealCheckIcon} weight="fill" tone="accent" size="sm" label="Verified" />
      </p>
      <div><Button variant="secondary"><Icon icon={BellIcon} size="sm" />Notify me</Button></div>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={row}>
      {(['primary', 'secondary', 'accent', 'error'] as const).map(t => <Icon key={t} icon={t === 'error' ? WarningIcon : BellIcon} tone={t} size="lg" />)}
    </div>
  ),
  decorators: [darkModeDecorator],
}
