import { UseCaseError } from './use-case-error.js'

export class InvalidRefreshTokenError extends Error implements UseCaseError {
  constructor() {
    super('Invalid or expired refresh token')
  }
}
