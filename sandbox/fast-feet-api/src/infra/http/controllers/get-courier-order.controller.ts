import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { GetCourierOrderUseCase } from '@/domain/use-cases/get-courier-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { NotOrderCourierError } from '@/domain/errors/not-order-courier-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

@Controller('/orders/me')
@Roles('COURIER')
export class GetCourierOrderController {
  constructor(private readonly getCourierOrder: GetCourierOrderUseCase) {}

  @Get('/:id')
  async handle(
    @Param('id', new ParseUUIDPipe()) orderId: string,
    @CurrentUser() currentUser: TokenPayload
  ) {
    const result = await this.getCourierOrder.execute({
      orderId,
      courierId: currentUser.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotOrderCourierError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      order: OrderPresenter.toHTTPWithRecipientAndAttachments(result.value.order),
    }
  }
}
