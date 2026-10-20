import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chart } from './Chart'
import { darkModeDecorator } from '@/lib/storybook'

const signups = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2026, i, 1),
  web: 1200 + i * 90 + (i % 3) * 140,
  ios: 800 + i * 60 - (i % 4) * 70,
  android: 600 + i * 110,
}))

const shipped = [
  { quarter: 'Q1', primitives: 6, composition: 3, patterns: 2 },
  { quarter: 'Q2', primitives: 4, composition: 2, patterns: 3 },
  { quarter: 'Q3', primitives: 8, composition: 1, patterns: 4 },
  { quarter: 'Q4', primitives: 38, composition: 9, patterns: 17 },
]

const meta: Meta<typeof Chart> = {
  title: 'Components/Chart',
  component: Chart,
  args: {
    type: 'line',
    title: 'Monthly signups, 2026',
    description: 'Web leads every month; Android grows fastest.',
    data: signups,
    x: 'month',
    xLabel: 'Month',
    series: [{ key: 'web', label: 'Web' }, { key: 'ios', label: 'iOS' }, { key: 'android', label: 'Android' }],
    locale: 'en-GB',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['line', 'bar'] },
  },
  decorators: [Story => <div style={{ maxWidth: '44rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Chart>

export const Line: Story = {}

export const Area: Story = {
  name: 'Line with area (one series)',
  args: {
    title: 'Web signups, 2026',
    description: undefined,
    series: [{ key: 'web', label: 'Web' }],
    area: true,
  },
}

export const Bar: Story = {
  name: 'Grouped bar',
  args: {
    type: 'bar',
    title: 'Components shipped per quarter',
    description: 'Most arrived in Q4, with the coverage plan.',
    data: shipped,
    x: 'quarter',
    xLabel: 'Quarter',
    series: [{ key: 'primitives', label: 'Primitives' }, { key: 'composition', label: 'Composition' }, { key: 'patterns', label: 'Patterns' }],
  },
}

export const AsTable: Story = {
  name: 'As a table',
  args: { defaultView: 'table' },
}

export const SixSeries: Story = {
  name: 'Six series (every chart colour)',
  args: {
    title: 'Six series',
    description: 'Each series has its own colour, line style and marker.',
    data: signups.map((d, i) => ({ ...d, a: 300 + i * 40, b: 500 + i * 20, c: 900 - i * 15 })),
    series: [
      { key: 'web', label: 'Web' }, { key: 'ios', label: 'iOS' }, { key: 'android', label: 'Android' },
      { key: 'a', label: 'Desktop' }, { key: 'b', label: 'Tablet' }, { key: 'c', label: 'Other' },
    ],
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
