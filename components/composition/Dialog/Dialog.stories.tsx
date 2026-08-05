import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dialog } from './Dialog'
import { Button } from '@/components/primitives/Button/Button'
import { Input } from '@/components/primitives/Input/Input'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    scrollable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => (
    <Dialog
      trigger={<Button>Open dialog</Button>}
      title="Confirm action"
      description="This action cannot be undone. Are you sure you want to continue?"
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
        Proceeding will permanently delete the selected items from your account.
      </p>
    </Dialog>
  ),
}

export const Small: Story = {
  name: 'Small (sm)',
  render: () => (
    <Dialog
      trigger={<Button variant="secondary">Small dialog</Button>}
      title="Quick confirm"
      size="sm"
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">OK</Button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
        Compact layout for simple confirmations.
      </p>
    </Dialog>
  ),
}

export const Large: Story = {
  name: 'Large (lg)',
  render: () => (
    <Dialog
      trigger={<Button variant="secondary">Large dialog</Button>}
      title="Edit content"
      description="Make changes to the content below."
      size="lg"
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </>
      }
    >
      <Input id="lg-title" label="Title" defaultValue="My article title" />
      <Input id="lg-slug" label="Slug" defaultValue="my-article-title" />
      <Input id="lg-author" label="Author" defaultValue="amézquita" />
    </Dialog>
  ),
}

export const Scrollable: Story = {
  name: 'Scrollable body',
  render: () => (
    <Dialog
      trigger={<Button>Open scrollable</Button>}
      title="Terms and conditions"
      description="Please read the following carefully before proceeding."
      scrollable
      footer={
        <>
          <Button variant="ghost">Decline</Button>
          <Button variant="primary">Accept</Button>
        </>
      }
    >
      {Array.from({ length: 12 }, (_, i) => (
        <p key={i} style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
          Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      ))}
    </Dialog>
  ),
}

export const WithForm: Story = {
  name: 'With form',
  render: () => (
    <Dialog
      trigger={<Button>Edit profile</Button>}
      title="Edit profile"
      description="Update your display name and email address."
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary" type="submit">Save changes</Button>
        </>
      }
    >
      <Input id="dialog-name" label="Display name" defaultValue="amézquita" />
      <Input id="dialog-email" label="Email address" defaultValue="hello@amezquita.dk" type="email" />
    </Dialog>
  ),
}

export const NoDescription: Story = {
  name: 'No description',
  render: () => (
    <Dialog
      trigger={<Button variant="secondary">Open</Button>}
      title="Quick note"
      footer={<Button variant="primary">Done</Button>}
    >
      <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
        A dialog without a description — title and body only.
      </p>
    </Dialog>
  ),
}

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Dialog
          key={size}
          trigger={<Button variant="secondary">{size.toUpperCase()}</Button>}
          title={`${size.toUpperCase()} dialog`}
          description={`max-width: var(--dialog-max-width${size !== 'md' ? `-${size}` : ''})`}
          size={size}
          footer={<Button variant="primary">Close</Button>}
        >
          <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
            Dialog body content.
          </p>
        </Dialog>
      ))}
    </div>
  ),
}

export const DarkMode: Story = {
  ...Default,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
