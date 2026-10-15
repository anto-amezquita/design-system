import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Carousel, CarouselSlide } from './Carousel'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../../composition/Card'
import { darkModeDecorator } from '@/lib/storybook'

const projects = [
  { title: 'Token pipeline', text: 'DTCG tokens built with Style Dictionary into five brands.' },
  { title: 'Contrast gate', text: 'Every text and control pair checked in ten modes on each push.' },
  { title: 'Theme scope', text: 'Light and dark regions on one page, overlays included.' },
  { title: 'Docs site', text: 'The whole site wears the brand you pick.' },
  { title: 'Agent rules', text: 'Decisions written down so tools follow them too.' },
]

const slide = (p: (typeof projects)[number], i: number) => (
  <CarouselSlide key={p.title}>
    <Card>
      <CardHeader>
        <CardTitle as="h3">{p.title}</CardTitle>
        <CardDescription>Project {i + 1}</CardDescription>
      </CardHeader>
      <CardBody>
        <p style={{ margin: 0, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>{p.text}</p>
      </CardBody>
    </Card>
  </CarouselSlide>
)

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  args: { label: 'Featured projects', perView: 1 },
  argTypes: {
    perView: { control: 'inline-radio', options: [1, 2, 3] },
    children: { control: false },
  },
  render: args => <Carousel {...args}>{projects.map(slide)}</Carousel>,
  decorators: [Story => <div style={{ maxWidth: '40rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Carousel>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('region', { name: 'Featured projects' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true'))
  },
}

export const ThreePerView: Story = {
  name: 'Three per view',
  args: { perView: 3 },
  decorators: [Story => <div style={{ maxWidth: '60rem' }}><Story /></div>],
}

export const Autoplay: Story = {
  name: 'Rotating (with pause)',
  args: { autoplay: true, interval: 4000 },
}

export const NoDots: Story = {
  args: { showDots: false },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  args: { perView: 2 },
  decorators: [darkModeDecorator],
}
