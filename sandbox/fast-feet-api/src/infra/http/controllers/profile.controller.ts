import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common'
import { GetProfileUseCase } from '@/domain/use-cases/get-profile-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { UserPresenter } from '@/infra/http/presenters/user-presenter.js'

@Controller('/me')
export class ProfileController {
  constructor(private readonly getProfile: GetProfileUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: TokenPayload) {
    const result = await this.getProfile.execute({ userId: currentUser.sub })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      user: UserPresenter.toHTTP(result.value.user),
    }
  }
}
