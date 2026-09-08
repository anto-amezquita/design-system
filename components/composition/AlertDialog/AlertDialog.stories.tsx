import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertDialog } from './AlertDialog'
import { Button } from '../../primitives/Button'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof AlertDialog>

/**
 * AlertDialog has no `trigger` prop of its own — it's always externally
 * controlled, since real usage (confirming a destructive setting change, a
 * risky state transition) tends to open it from application logic rather
 * than a direct click. This wrapper demonstrates the realistic shape:
 * consumer owns `open` state, a separate trigger button sets it.
 *
 * Cancel/Action render as `<Button>` — verified safe by
 * AlertDialog.slot.test.tsx (decisions/0006-add-layered-automated-testing.md).
 * This used to be a plain `<button>` on the reasoning that Button "does not
 * forward a ref"; that claim was never accurate (Button has always used
 * forwardRef + useImperativeHandle) — the real gap, found and fixed
 * separately, was that Button didn't spread unrecognised props onto the
 * rendered element, which is unrelated to ref forwarding but similarly
 * invisible to Chromatic. Kept as plain `<button>` in stories where the
 * demonstrated behavior isn't about Button specifically (WithBody,
 * NoDescription), to keep those stories focused on AlertDialog's own props.
 */
function Demo({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete item
      </button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this item?"
        description="This action cannot be undone."
        size={size}
        cancel={<Button variant="secondary">Cancel</Button>}
        action={<Button onClick={() => setOpen(false)}>Delete</Button>}
      />
    </>
  )
}

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Delete item
        </button>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete this item?"
          description="This action cannot be undone."
          cancel={<Button variant="secondary">Cancel</Button>}
          action={<Button onClick={() => setOpen(false)}>Delete</Button>}
        />
      </>
    )
  },
}

export const WithBody: Story = {
  name: 'With body content',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Review before continuing
        </button>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="2 gaps found before this goes live"
          cancel={<button type="button">Go back and fix</button>}
          action={<button type="button" onClick={() => setOpen(false)}>Proceed anyway</button>}
        >
          <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
            <li>Distributed, but PRO/MLC missing</li>
            <li>AI used without a paper trail on file</li>
          </ul>
        </AlertDialog>
      </>
    )
  },
}

export const NoDescription: Story = {
  name: 'No description',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Silence this law
        </button>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title='Silence "Earn the chorus"?'
          cancel={<button type="button">Cancel</button>}
          action={<button type="button" onClick={() => setOpen(false)}>Silence law</button>}
        >
          <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-body)' }}>
            This is a locked law. Turning it off stops future checks for this song — lines it
            already flagged stay marked, as a record you did this.
          </p>
        </AlertDialog>
      </>
    )
  },
}

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
}

export const DarkMode: Story = {
  ...Default,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
