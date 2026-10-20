import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid, GridItem } from './Grid'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  args: {
    columns: 3,
    gap: 'element',
    align: 'stretch',
  },
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 12 } },
    minItemWidth: { control: 'inline-radio', options: [undefined, 'sm', 'md', 'lg'] },
    gap: { control: 'select', options: ['none', 'tight', 'inline', 'element', 'component', 'section'] },
    rowGap: { control: 'select', options: [undefined, 'none', 'tight', 'inline', 'element', 'component', 'section'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const box: React.CSSProperties = {
  padding: 'var(--space-element-gap)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-component)',
  background: 'var(--color-surface-primary)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-base)',
}

const names = ['Colour', 'Type', 'Spacing', 'Motion', 'Radius', 'Elevation']

export const Default: Story = {
  render: args => (
    <Grid {...args}>
      {names.map(n => <div key={n} style={box}>{n}</div>)}
    </Grid>
  ),
}

export const PerBreakpoint: Story = {
  name: 'Per breakpoint',
  args: { columns: { base: 1, tablet: 2, desktop: 3 } as never },
  render: args => (
    <Grid {...args}>
      {names.map(n => <div key={n} style={box}>{n}</div>)}
    </Grid>
  ),
}

export const AsManyAsFit: Story = {
  name: 'As many as fit',
  args: { minItemWidth: 'sm', columns: undefined },
  render: args => (
    <Grid {...args}>
      {names.map(n => <div key={n} style={box}>{n}</div>)}
    </Grid>
  ),
}

export const Spans: Story = {
  args: { columns: 4 },
  render: args => (
    <Grid {...args}>
      <GridItem span="full" style={box}>Header: full row</GridItem>
      <GridItem span={{ base: 'full', desktop: 3 }} style={box}>Main: 3 of 4 on desktop</GridItem>
      <GridItem span={{ base: 'full', desktop: 1 }} style={box}>Aside</GridItem>
      <div style={box}>1</div>
      <div style={box}>2</div>
      <GridItem span={2} style={box}>Two columns</GridItem>
    </Grid>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <Grid as="ul" minItemWidth="sm" gap="component" aria-label="Foundations">
      {names.map(n => <li key={n} style={box}>{n}</li>)}
    </Grid>
  ),
  decorators: [darkModeDecorator],
}
