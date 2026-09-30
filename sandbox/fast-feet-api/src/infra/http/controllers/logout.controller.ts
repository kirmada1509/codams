import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { RevokeUserSessionsUseCase } from '@/domain/use-cases/revoke-user-sessions-use-case.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

@Controller('sessions')
export class LogoutController {
  constructor(private revokeUserSessionsUseCase: RevokeUserSessionsUseCase) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@CurrentUser() user: TokenPayload) {
    const result = await this.revokeUserSessionsUseCase.execute({
      userId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
    }
  }
}
