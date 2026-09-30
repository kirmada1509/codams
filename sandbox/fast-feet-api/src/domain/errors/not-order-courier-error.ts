import { UseCaseError } from './use-case-error.js'

export class NotOrderCourierError extends Error implements UseCaseError {
  constructor() {
    super('Only the courier who withdrew this order can mark it as delivered.')
  }
}
