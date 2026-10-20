import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { PromptForm, type PromptQuestion } from './PromptForm'
import { ChatMessage } from '../ChatMessage'
import { Avatar } from '../../primitives/Avatar'
import { darkModeDecorator } from '@/lib/storybook'

const questions: PromptQuestion[] = [
  {
    id: 'framework',
    question: 'Which framework is the app in?',
    options: [
      { value: 'next', label: 'Next.js', description: 'App Router, React Server Components' },
      { value: 'vite', label: 'Vite', description: 'A single-page app' },
    ],
  },
  {
    id: 'brands',
    question: 'Which brands should it support?',
    multiple: true,
    allowOther: false,
    options: [
      { value: 'base', label: 'Base', description: 'Brand-neutral, what every project starts from' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'demo-warm', label: 'Demo warm' },
    ],
  },
]

const meta: Meta<typeof PromptForm> = {
  title: 'Components/PromptForm',
  component: PromptForm,
  args: {
    title: 'Two questions before I set it up',
    questions,
    onSubmit: () => {},
    onSkip: () => {},
  },
  decorators: [Story => <div style={{ maxWidth: '40rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof PromptForm>

export const Default: Story = {}

export const Unanswered: Story = {
  name: 'Sent with a question unanswered',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send answers' }))
    await expect(canvas.getByText('Choose an answer.')).toBeInTheDocument()
  },
}

export const Answered: Story = {
  name: 'Answered (summary)',
  args: { answers: { framework: ['next'], brands: ['base', 'demo-warm'] } },
}

export const Skipped: Story = {
  args: { answers: 'skipped' },
}

export const InConversation: Story = {
  name: 'In a conversation',
  render: args => (
    <ChatMessage role="assistant" author="Assistant" avatar={<Avatar alt="Assistant" fallback="AI" size="sm" />}>
      <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
        <p style={{ margin: 0 }}>I can set the theme up for you. Two things first:</p>
        <PromptForm {...args} />
      </div>
    </ChatMessage>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
