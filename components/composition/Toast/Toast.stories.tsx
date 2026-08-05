import type { Meta, StoryObj } from '@storybook/react-vite'
import { useToast } from './Toast'

const meta: Meta = {
  title: 'Components/Toast',
}

export default meta
type Story = StoryObj

function ToastTrigger({ title, description, variant, label }: {
  title: string
  description?: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  label: string
}) {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() => toast({ title, description, variant })}
      style={{
        padding: '8px 16px',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--border-radius-component)',
        background: 'var(--color-surface-secondary)',
        color: 'var(--color-text-primary)',
        font: 'inherit',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export const Default: Story = {
  render: () => (
    <ToastTrigger
      title="Changes saved"
      description="Your settings have been updated."
      variant="neutral"
      label="Show toast"
    />
  ),
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <ToastTrigger
        title="Changes saved"
        description="Your profile has been updated successfully."
        variant="success"
        label="Success"
      />
      <ToastTrigger
        title="Storage almost full"
        description="You have used 90% of your available storage."
        variant="warning"
        label="Warning"
      />
      <ToastTrigger
        title="Upload failed"
        description="The file could not be uploaded. Check your connection and try again."
        variant="error"
        label="Error"
      />
      <ToastTrigger
        title="Maintenance window"
        description="Scheduled maintenance on Saturday 14:00–16:00 CET."
        variant="info"
        label="Info"
      />
      <ToastTrigger
        title="Keyboard shortcut saved"
        variant="neutral"
        label="Neutral"
      />
    </div>
  ),
}

export const TitleOnly: Story = {
  name: 'Title only',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <ToastTrigger title="Email copied to clipboard" variant="success" label="Copy (success)" />
      <ToastTrigger title="Session expiring soon" variant="warning" label="Session (warning)" />
      <ToastTrigger title="Connection lost" variant="error" label="Connection (error)" />
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '24px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <ToastTrigger
        title="Build complete"
        description="Deployed to production in 42 seconds."
        variant="success"
        label="Success"
      />
      <ToastTrigger
        title="Deployment failed"
        description="The build failed at step 3/5."
        variant="error"
        label="Error"
      />
      <ToastTrigger
        title="New integration available"
        variant="info"
        label="Info"
      />
    </div>
  ),
}
