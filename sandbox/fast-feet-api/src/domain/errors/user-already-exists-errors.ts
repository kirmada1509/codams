import { UseCaseError } from './use-case-error.js'

export class UserAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`)
  }
}
