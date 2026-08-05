'use client'

import { CheckCircleIcon, WarningIcon, XCircleIcon, InfoIcon } from '@phosphor-icons/react'

export type FeedbackVariant = 'success' | 'warning' | 'error' | 'info'

export const feedbackIcons: Record<FeedbackVariant, React.ReactNode> = {
  success: <CheckCircleIcon size={20} weight="fill" aria-hidden="true" />,
  warning: <WarningIcon     size={20} weight="fill" aria-hidden="true" />,
  error:   <XCircleIcon     size={20} weight="fill" aria-hidden="true" />,
  info:    <InfoIcon        size={20} weight="fill" aria-hidden="true" />,
}
