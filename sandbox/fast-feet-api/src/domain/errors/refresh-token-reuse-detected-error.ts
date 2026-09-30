import { UseCaseError } from './use-case-error.js'

export class RefreshTokenReuseDetectedError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Refresh token reuse detected, all sessions revoked')
  }
}
