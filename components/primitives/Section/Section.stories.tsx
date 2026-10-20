import type { Meta, StoryObj } from '@storybook/react-vite'
import { Section } from './Section'
import { Button } from '../Button'
import { ThemeScope } from '../../composition/ThemeScope'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Section> = {
  title: 'Components/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
  args: {
    width: 'page',
    spacing: 'section',
    tone: 'default',
  },
  argTypes: {
    width: { control: 'select', options: ['text', 'media', 'wide', 'page', 'full'] },
    spacing: { control: 'inline-radio', options: ['none', 'component', 'section'] },
    tone: { control: 'inline-radio', options: ['default', 'subtle'] },
  },
}

export default meta
type Story = StoryObj<typeof Section>

const h2: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--font-size-h3)',
  lineHeight: 'var(--line-height-h3)',
  color: 'var(--color-text-primary)',
}
const p: React.CSSProperties = {
  margin: 'var(--space-inline-gap) 0 0',
  fontFamily: 'var(--font-family-base)',
  color: 'var(--color-text-secondary)',
}

const Content = ({ id, title = 'Tokens first' }: { id: string; title?: string }) => (
  <>
    <h2 id={id} style={h2}>{title}</h2>
    <p style={p}>Every colour, size and space comes from a token, so a brand is a thin skin over the same components.</p>
  </>
)

export const Default: Story = {
  render: args => <Section {...args} aria-labelledby="s-default"><Content id="s-default" /></Section>,
}

export const Bands: Story = {
  render: () => (
    <>
      <Section aria-labelledby="s-a"><Content id="s-a" /></Section>
      <Section tone="subtle" aria-labelledby="s-b"><Content id="s-b" title="Five brands" /></Section>
      <Section width="text" aria-labelledby="s-c"><Content id="s-c" title="Why it exists" /></Section>
    </>
  ),
}

export const DarkBand: Story = {
  name: 'Dark band (ThemeScope)',
  render: () => (
    <>
      <Section aria-labelledby="s-d"><Content id="s-d" /></Section>
      <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)' }}>
        <Section aria-labelledby="s-e">
          <Content id="s-e" title="Built to be read by agents" />
          <div style={{ marginTop: 'var(--space-element-gap)' }}><Button>Read the docs</Button></div>
        </Section>
      </ThemeScope>
    </>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <>
      <Section aria-labelledby="s-f"><Content id="s-f" /></Section>
      <Section tone="subtle" spacing="component" aria-labelledby="s-g"><Content id="s-g" title="Accessible by default" /></Section>
    </>
  ),
  decorators: [darkModeDecorator],
}
