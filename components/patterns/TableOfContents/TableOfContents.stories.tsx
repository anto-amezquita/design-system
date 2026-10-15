import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { TableOfContents, headingsToItems, type TableOfContentsItem } from './TableOfContents'
import { ThemeScope } from '../../composition/ThemeScope'

const sections = [
  { id: 'tokens', title: 'Tokens', subs: [{ id: 'semantic', title: 'Semantic tokens' }, { id: 'component', title: 'Component tokens' }] },
  { id: 'brands', title: 'Brands and modes', subs: [] },
  { id: 'contrast', title: 'Contrast', subs: [{ id: 'pairs', title: 'Tested pairs' }] },
  { id: 'release', title: 'Releases', subs: [] },
]

const paragraph = 'Every colour, space and radius comes from a token, so a brand is a set of values rather than a set of overrides. Components read semantic tokens only; a lint rule keeps primitives out of component CSS.'

function Article({ prefix = '' }: { prefix?: string }) {
  return (
    <article style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)', lineHeight: 1.6 }}>
      {sections.map(s => (
        <section key={s.id}>
          <h2 id={prefix + s.id} style={{ marginBlock: '1.5rem 0.5rem' }}>{s.title}</h2>
          <p>{paragraph}</p><p>{paragraph}</p>
          {s.subs.map(sub => (
            <div key={sub.id}><h3 id={prefix + sub.id}>{sub.title}</h3><p>{paragraph}</p><p>{paragraph}</p></div>
          ))}
        </section>
      ))}
    </article>
  )
}

const items: TableOfContentsItem[] = sections.map(s => ({ id: s.id, label: s.title, children: s.subs.map(x => ({ id: x.id, label: x.title })) }))

function Page({ toc }: { toc: (root: HTMLElement | null) => React.ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 14rem', gap: '2rem', alignItems: 'start' }}>
      <div ref={setRoot} tabIndex={0} aria-label="Article" role="region" style={{ blockSize: '24rem', overflow: 'auto', paddingInline: '0.5rem' }}>
        <Article />
      </div>
      {toc(root)}
    </div>
  )
}

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
}

export default meta
type Story = StoryObj<typeof TableOfContents>

export const Default: Story = {
  name: 'Follows the scroll',
  render: () => <Page toc={root => <TableOfContents items={items} root={root} offset={24} />} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const nav = c.getByRole('navigation', { name: 'On this page' })
    await waitFor(() => expect(within(nav).getByRole('link', { name: 'Tokens' })).toHaveAttribute('aria-current', 'location'))
  },
}

function FromHeadingsExample() {
  const ref = useRef<HTMLDivElement>(null)
  const [found, setFound] = useState<TableOfContentsItem[]>([])
  useEffect(() => { if (ref.current) setFound(headingsToItems(ref.current)) }, [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 14rem', gap: '2rem', alignItems: 'start' }}>
      <div ref={ref} style={{ blockSize: '16rem', overflow: 'hidden' }}><Article prefix="h-" /></div>
      <TableOfContents items={found} activeId="h-contrast" />
    </div>
  )
}

export const FromHeadings: Story = {
  name: 'Built from the headings',
  render: () => <FromHeadingsExample />,
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation')
    await waitFor(() => expect(within(nav).getAllByRole('link')).toHaveLength(7))
  },
}

export const Danish: Story = {
  args: {
    'aria-label': 'På denne side',
    activeId: 'farver',
    items: [
      { id: 'tokens-da', label: 'Tokens', children: [{ id: 'farver', label: 'Farver' }, { id: 'afstande', label: 'Afstande' }] },
      { id: 'brands-da', label: 'Brands og tilstande' },
      { id: 'kontrast', label: 'Kontrast' },
    ],
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: () => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px' }}>
      <TableOfContents items={items} activeId="semantic" />
    </ThemeScope>
  ),
}
