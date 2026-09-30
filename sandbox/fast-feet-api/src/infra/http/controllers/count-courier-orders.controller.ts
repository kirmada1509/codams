import { Controller, Get } from '@nestjs/common'
import { CountCourierOrdersUseCase } from '@/domain/use-cases/count-courier-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'

@Controller('/orders/me')
@Roles('COURIER')
export class CountCourierOrdersController {
  constructor(private readonly countCourierOrders: CountCourierOrdersUseCase) {}

  @Get('/counts')
  async handle(@CurrentUser() user: TokenPayload) {
    const result = await this.countCourierOrders.execute({
      courierId: user.sub,
    })

    if (result.isRight()) {
      return { counts: result.value }
    }

    return { counts: { available: 0, withdrawn: 0, delivered: 0 } }
  }
}
