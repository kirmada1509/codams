import { UseCaseError } from './use-case-error.js'

export class InvalidCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Invalid credentials')
  }
}
