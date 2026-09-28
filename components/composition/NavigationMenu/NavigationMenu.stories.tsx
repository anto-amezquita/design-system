import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { BookOpenIcon, BriefcaseIcon, EnvelopeSimpleIcon, UserIcon } from '@phosphor-icons/react'
import { darkModeDecorator } from '../../../lib/storybook'
import { mediaQuery } from '../../../lib/breakpoints'
import type { NavItem } from '../../../lib/navigation'
import { NavigationMenu } from './NavigationMenu'

const meta: Meta<typeof NavigationMenu> = {
  title: 'Composition/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    // Hidden below breakpoint.desktop by design, so snapshot it wide.
    chromatic: { viewports: [1280] },
    a11y: {
      config: {
        rules: [
          {
            // Suppression, narrowed to one element: while a group is open,
            // Radix renders a visually hidden <span aria-hidden tabindex="0">
            // after its trigger. It's a focus sentinel — focusing it moves
            // focus straight into the open content — so no one ever lands on
            // it, but axe's aria-hidden-focus flags it. Every other
            // aria-hidden element on the page is still checked.
            id: 'aria-hidden-focus',
            selector: '[aria-hidden="true"]:not(.navigation-menu__item > span[tabindex="0"])',
          },
        ],
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof NavigationMenu>

export const Default: Story = {
  render: () => (
    <NavigationMenu
      currentHref="/work"
      items={[
        { id: 'work', label: 'Work', href: '/work' },
        {
          id: 'writing',
          label: 'Writing',
          items: [
            { id: 'essays', label: 'Essays', href: '/writing/essays' },
            { id: 'notes', label: 'Notes', href: '/writing/notes' },
            { id: 'talks', label: 'Talks', href: '/writing/talks' },
          ],
        },
        { id: 'about', label: 'About', href: '/about' },
        { id: 'contact', label: 'Contact', href: '/contact' },
      ]}
    />
  ),
}

const items: NavItem[] = [
  { id: 'work', label: 'Work', href: '/work', icon: <BriefcaseIcon size={16} /> },
  {
    id: 'writing',
    label: 'Writing',
    icon: <BookOpenIcon size={16} />,
    items: [
      { id: 'essays', label: 'Essays', href: '/writing/essays' },
      { id: 'notes', label: 'Notes', href: '/writing/notes' },
      { id: 'talks', label: 'Talks', href: '/writing/talks' },
    ],
  },
  { id: 'about', label: 'About', href: '/about', icon: <UserIcon size={16} /> },
  { id: 'contact', label: 'Contact', href: '/contact', icon: <EnvelopeSimpleIcon size={16} /> },
]

// The menu only exists from breakpoint.desktop up. Storybook's test runner
// uses a narrow viewport, where there's nothing to open; Chromatic snapshots
// at 1280px (see meta), where the group is opened.
const openWriting: Story['play'] = async ({ canvasElement }) => {
  if (!window.matchMedia(mediaQuery('desktop')).matches) return
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Writing' }))
  await expect(within(canvasElement).getByRole('link', { name: 'Notes' })).toBeVisible()
}

export const Open: Story = {
  name: 'Group open, current link inside it',
  render: () => <NavigationMenu items={items} currentHref="/writing/notes" />,
  play: openWriting,
}

export const WithIcons: Story = {
  name: 'With icons',
  render: () => <NavigationMenu items={items} currentHref="/about" />,
}

export const NoCurrentPage: Story = {
  name: 'No current page',
  render: () => <NavigationMenu items={items} />,
}

export const DarkMode: Story = {
  ...Open,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
