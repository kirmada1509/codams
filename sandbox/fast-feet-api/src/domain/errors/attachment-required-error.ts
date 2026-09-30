import { UseCaseError } from './use-case-error.js'

export class AttachmentRequiredError extends Error implements UseCaseError {
  constructor() {
    super('A photo attachment is required to mark order as delivered.')
  }
}
