import {
  Controller,
  Patch,
  Body,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { RefreshTokenUseCase } from '@/domain/use-cases/refresh-token-use-case.js'
import { Public } from '@/infra/auth/public.decorator.js'
import { EnvService } from '@/infra/env/env.service.js'

const refreshBodySchema = z.object({
  refresh_token: z.string().uuid(),
})

type RefreshBody = z.infer<typeof refreshBodySchema>

@Controller('sessions')
export class RefreshTokenController {
  constructor(
    private refreshTokenUseCase: RefreshTokenUseCase,
    private envService: EnvService
  ) {}

  @Public()
  @Patch('refresh')
  @UsePipes(new ZodValidationPipe(refreshBodySchema))
  async handle(@Body() body: RefreshBody) {
    const refreshTokenExpiresInMs =
      this.envService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') * 1000

    const result = await this.refreshTokenUseCase.execute({
      refreshToken: body.refresh_token,
      refreshTokenExpiresInMs,
    })

    if (result.isLeft()) {
      throw new UnauthorizedException(result.value.message)
    }

    const { accessToken, refreshToken } = result.value

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}
