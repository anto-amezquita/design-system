import type { Meta, StoryObj } from '@storybook/react-vite'
import { Hero } from './Hero'
import { Button } from '@/components/primitives/Button/Button'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Design systems that feel alive',
    align: 'left',
  },
  argTypes: {
    align: {
      control: 'radio',
      options: ['left', 'centered'],
    },
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    lead: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Hero>

export const Default: Story = {
  render: (args) => <Hero {...args} />,
}

export const WithEyebrowAndLead: Story = {
  name: 'With eyebrow and lead',
  render: () => (
    <Hero
      eyebrow="Design engineer"
      title="Design systems that feel alive"
      lead="I build token-first, multi-brand design systems that scale across products and teams without losing their craft."
      actions={
        <>
          <Button variant="primary">View work</Button>
          <Button variant="ghost">Get in touch</Button>
        </>
      }
    />
  ),
}

export const Centered: Story = {
  render: () => (
    <Hero
      eyebrow="Case study"
      title="Rebuilding the design language from zero"
      lead="How a fragmented component library became a single source of truth across four product lines."
      align="centered"
      actions={
        <>
          <Button variant="primary">Read case study</Button>
        </>
      }
    />
  ),
}

export const TitleOnly: Story = {
  name: 'Title only',
  render: () => (
    <Hero title="Work" />
  ),
}

export const PageHeader: Story = {
  name: 'Page header variant',
  render: () => (
    <Hero
      eyebrow="Writing"
      title="Notes on design and systems"
      lead="Collected thoughts on typography, tokens, and the craft of building at scale."
    />
  ),
}

export const DarkMode: Story = {
  ...Default,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
