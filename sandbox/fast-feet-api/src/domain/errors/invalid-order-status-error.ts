import { UseCaseError } from './use-case-error.js'

export class InvalidOrderStatusError extends Error implements UseCaseError {
  constructor(currentStatus: string, expectedStatus: string) {
    super(
      `Order status is "${currentStatus}". Expected "${expectedStatus}" to perform this action.`
    )
  }
}
