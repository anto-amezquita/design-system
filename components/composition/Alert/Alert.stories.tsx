import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: { control: 'radio', options: ['success', 'warning', 'error', 'info'] },
    dismissible: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: () => (
    <Alert variant="info" title="New update available">
      A new version is ready. Refresh to get the latest changes.
    </Alert>
  ),
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
      <Alert variant="success" title="Changes saved">
        Your profile has been updated successfully.
      </Alert>
      <Alert variant="warning" title="Storage almost full">
        You have used 90% of your available storage. Consider removing old files.
      </Alert>
      <Alert variant="error" title="Upload failed">
        The file could not be uploaded. Check your connection and try again.
      </Alert>
      <Alert variant="info" title="Maintenance window">
        Scheduled maintenance on Saturday 14:00–16:00 CET. The service may be briefly unavailable.
      </Alert>
    </div>
  ),
}

export const Dismissible: Story = {
  name: 'Dismissible',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
      <Alert variant="success" title="Import complete" dismissible>
        46 records were imported without errors.
      </Alert>
      <Alert variant="warning" dismissible>
        Your session will expire in 5 minutes.
      </Alert>
      <Alert variant="error" title="Permission denied" dismissible>
        You do not have access to this resource. Contact your administrator.
      </Alert>
      <Alert variant="info" title="Beta feature" dismissible>
        This feature is in early access. Feedback is welcome.
      </Alert>
    </div>
  ),
}

export const NoTitle: Story = {
  name: 'No title (body only)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
      <Alert variant="success">All tests passed.</Alert>
      <Alert variant="error" dismissible>Failed to connect to the database.</Alert>
    </div>
  ),
}

export const NoIcon: Story = {
  name: 'No icon',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
      <Alert variant="info" title="Tip" icon={null}>
        You can use keyboard shortcuts to navigate between sections.
      </Alert>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
      <Alert variant="success" title="Build complete" dismissible>
        Deployed to production in 42 seconds.
      </Alert>
      <Alert variant="warning" title="Rate limit approaching">
        You are using 80% of your monthly API quota.
      </Alert>
      <Alert variant="error" title="Deployment failed" dismissible>
        The build failed at step 3/5. See logs for details.
      </Alert>
      <Alert variant="info" title="New integration available">
        Connect your Figma account to enable live token sync.
      </Alert>
    </div>
  ),
}
