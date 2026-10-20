import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileIcon, FileTsxIcon, FolderIcon, FileCssIcon, FileTextIcon } from '@phosphor-icons/react'
import { TreeView, type TreeNode } from './TreeView'
import { darkModeDecorator } from '@/lib/storybook'

const files: TreeNode[] = [
  {
    id: 'components',
    label: 'components',
    icon: <FolderIcon />,
    children: [
      {
        id: 'primitives',
        label: 'primitives',
        icon: <FolderIcon />,
        children: [
          { id: 'button', label: 'Button', icon: <FolderIcon />, children: [
            { id: 'button-tsx', label: 'Button.tsx', icon: <FileTsxIcon /> },
            { id: 'button-css', label: 'Button.css', icon: <FileCssIcon /> },
          ] },
          { id: 'input', label: 'Input', icon: <FolderIcon />, children: [
            { id: 'input-tsx', label: 'Input.tsx', icon: <FileTsxIcon /> },
          ] },
        ],
      },
      { id: 'patterns', label: 'patterns', icon: <FolderIcon />, children: [] },
    ],
  },
  { id: 'tokens', label: 'tokens', icon: <FolderIcon />, children: [
    { id: 'global', label: 'global.json', icon: <FileIcon /> },
    { id: 'lock', label: 'changelog.json (generated)', icon: <FileIcon />, disabled: true },
  ] },
  { id: 'readme', label: 'README.md', icon: <FileTextIcon /> },
]

const meta: Meta<typeof TreeView> = {
  title: 'Components/TreeView',
  component: TreeView,
  args: {
    'aria-label': 'Files',
    items: files,
    defaultExpanded: ['components', 'primitives', 'button'],
  },
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
  },
  decorators: [Story => <div style={{ maxWidth: '20rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof TreeView>

export const Default: Story = {}

export const SingleSelection: Story = {
  name: 'Single selection',
  args: { selectionMode: 'single', defaultSelected: ['button-tsx'] },
}

export const MultipleSelection: Story = {
  name: 'Multiple selection',
  args: { selectionMode: 'multiple', defaultSelected: ['button-tsx', 'input-tsx'], defaultExpanded: ['components', 'primitives', 'button', 'input'] },
}

export const WithoutIcons: Story = {
  name: 'Without icons (an outline)',
  args: {
    items: [
      { id: 'a', label: 'Foundations', children: [{ id: 'a1', label: 'Colour' }, { id: 'a2', label: 'Spacing' }, { id: 'a3', label: 'Typography' }] },
      { id: 'b', label: 'Components', children: [{ id: 'b1', label: 'Primitives' }, { id: 'b2', label: 'Patterns' }] },
      { id: 'c', label: 'Themes' },
    ],
    defaultExpanded: ['a'],
    selectionMode: 'single',
    defaultSelected: ['a2'],
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  args: { selectionMode: 'single', defaultSelected: ['button-tsx'] },
  decorators: [darkModeDecorator],
}
