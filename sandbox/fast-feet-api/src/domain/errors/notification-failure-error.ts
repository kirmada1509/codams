import { UseCaseError } from './use-case-error.js'

export class NotificationFailureError extends Error implements UseCaseError {
  constructor(message: string = 'Failed to send notification.') {
    super(message)
  }
}
