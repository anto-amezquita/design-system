import type { Meta, StoryObj } from '@storybook/react-vite'
import { Timestamp } from './Timestamp'
import { darkModeDecorator } from '@/lib/storybook'

/*
  Relative stories use moments relative to when the story renders ("5
  minutes before now"), so the text, and the Chromatic snapshot, stay the
  same from day to day. Absolute stories, and the past-the-limit example,
  use fixed dates.
*/
const ago = (ms: number) => new Date(Date.now() - ms)
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const fixed = new Date(2026, 9, 20, 9, 5)
const longAgo = new Date(2025, 0, 15, 14, 0)

const meta: Meta<typeof Timestamp> = {
  title: 'Components/Timestamp',
  component: Timestamp,
  args: {
    date: ago(5 * MIN),
    format: 'relative',
    locale: 'en-GB',
    relativeLimitDays: 7,
    live: true,
  },
  argTypes: {
    date: { control: false },
    format: { control: 'inline-radio', options: ['relative', 'date', 'datetime', 'time'] },
    locale: { control: 'select', options: ['en-GB', 'en-US', 'da-DK', 'es-PE'] },
  },
}

export default meta
type Story = StoryObj<typeof Timestamp>

const text: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-small)',
  lineHeight: 'var(--line-height-small)',
  color: 'var(--color-text-secondary)',
}
const column: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-tight-gap)' }

export const Default: Story = {
  render: args => <p style={text}>Edited <Timestamp {...args} /></p>,
}

export const Relative: Story = {
  render: () => (
    <div style={column}>
      {[10_000, 5 * MIN, 2 * HOUR, DAY, 3 * DAY].map(ms => (
        <p key={ms} style={text}><Timestamp date={ago(ms)} locale="en-GB" /></p>
      ))}
      {/* Past the 7-day limit it shows the date. A fixed date, so the snapshot doesn't change daily. */}
      <p style={text}><Timestamp date={longAgo} locale="en-GB" /></p>
    </div>
  ),
}

export const Absolute: Story = {
  render: () => (
    <div style={column}>
      {(['date', 'datetime', 'time'] as const).map(f => (
        <p key={f} style={text}>{f}: <Timestamp date={fixed} format={f} locale="en-GB" /></p>
      ))}
    </div>
  ),
}

export const Locales: Story = {
  render: () => (
    <div style={column}>
      {['en-GB', 'da-DK', 'es-PE'].map(l => (
        <p key={l} style={text}>{l}: <Timestamp date={ago(DAY)} locale={l} /> · <Timestamp date={fixed} format="datetime" locale={l} /></p>
      ))}
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={column}>
      <p style={text}>Edited <Timestamp date={ago(5 * MIN)} locale="en-GB" /></p>
      <p style={text}>Published <Timestamp date={fixed} format="date" locale="en-GB" /></p>
    </div>
  ),
  decorators: [darkModeDecorator],
}
