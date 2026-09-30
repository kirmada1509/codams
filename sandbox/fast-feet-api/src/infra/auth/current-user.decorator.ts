import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: TokenPayload }>()
    return request.user
  }
)
