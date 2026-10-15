import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Lightbox, LightboxGallery } from './Lightbox'
import { sampleImages } from './sample-images'
import { ThemeScope } from '../ThemeScope'

const meta: Meta<typeof Lightbox> = {
  title: 'Components/Lightbox',
  component: Lightbox,
  decorators: [Story => <div style={{ maxWidth: '40rem', minBlockSize: '20rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Lightbox>

export const Gallery: Story = {
  name: 'Gallery of thumbnails',
  render: () => <LightboxGallery images={sampleImages} title="Places" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByRole('list', { name: 'Places' })).toBeVisible()
    await expect(c.getByRole('button', { name: 'Open Green mountains under a pale sky' })).toBeVisible()
  },
}

function OpenAt({ start = 1 }: { start?: number }) {
  const [open, setOpen] = useState(true)
  const [index, setIndex] = useState(start)
  return <Lightbox images={sampleImages} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} title="Places" />
}

export const Open: Story = {
  tags: ['!autodocs'],
  render: () => <OpenAt />,
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole('dialog', { name: 'Places 2 of 4' })).toBeVisible())
    await userEvent.click(body.getByRole('button', { name: 'Next image' }))
    await expect(body.getByRole('img', { name: 'A full moon over a dark lake' })).toBeVisible()
    await expect(body.getByRole('status')).toHaveTextContent('3 of 4: Skanderborg Lake at night')
  },
}

export const Single: Story = {
  name: 'One image',
  tags: ['!autodocs'],
  render: () => {
    const [open, setOpen] = useState(true)
    return <Lightbox images={[sampleImages[2]]} open={open} onOpenChange={setOpen} index={0} onIndexChange={() => {}} title="Photo" />
  },
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Photo' })).toBeVisible())
    await expect(within(document.body).queryByRole('button', { name: 'Next image' })).toBeNull()
  },
}

export const Danish: Story = {
  tags: ['!autodocs'],
  render: () => {
    const [open, setOpen] = useState(true)
    const [index, setIndex] = useState(0)
    return (
      <Lightbox
        images={sampleImages}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        title="Steder"
        labels={{ previous: 'Forrige billede', next: 'Næste billede', close: 'Luk', of: 'af' }}
      />
    )
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: () => <ThemeScope mode="dark"><OpenAt start={2} /></ThemeScope>,
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toHaveAttribute('data-mode', 'dark'))
  },
}
