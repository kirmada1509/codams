import {
  Controller,
  Post,
  Body,
  UsePipes,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { AuthenticateUserUseCase } from '@/domain/use-cases/authenticate-user-use-case.js'
import { InvalidCredentialsError } from '@/domain/errors/invalid-credentials-errors.js'
import { Public } from '@/infra/auth/public.decorator.js'
import { UserPresenter } from '@/infra/http/presenters/user-presenter.js'
import { cpfSchema } from '@/infra/http/validators/cpf.schema.js'
import { EnvService } from '@/infra/env/env.service.js'

const authenticateBodySchema = z.object({
  cpf: cpfSchema,
  password: z.string().min(6),
})

type AuthenticateBody = z.infer<typeof authenticateBodySchema>

@Controller('sessions')
export class AuthenticateController {
  constructor(
    private authenticateUser: AuthenticateUserUseCase,
    private envService: EnvService
  ) {}

  @Public()
  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBody) {
    const { cpf, password } = body

    const refreshTokenExpiresInMs =
      this.envService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') * 1000

    const result = await this.authenticateUser.execute({
      cpf,
      password,
      refreshTokenExpiresInMs,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken, refreshToken, user } = result.value

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: UserPresenter.toHTTP(user),
    }
  }
}
