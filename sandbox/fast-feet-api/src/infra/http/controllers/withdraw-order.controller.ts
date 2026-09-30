import {
  BadRequestException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { WithdrawOrderUseCase } from '@/domain/use-cases/withdraw-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'

@Controller('/orders')
@Roles('COURIER')
export class WithdrawOrderController {
  constructor(private readonly withdrawOrder: WithdrawOrderUseCase) {}

  @Patch(':orderId/withdraw')
  @HttpCode(204)
  async handle(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @CurrentUser() user: TokenPayload
  ) {
    const result = await this.withdrawOrder.execute({
      orderId,
      courierId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidOrderStatusError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
