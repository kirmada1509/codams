import { UseCaseError } from './use-case-error.js'

export class RecipientAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Recipient "${identifier}" already exists.`)
  }
}
