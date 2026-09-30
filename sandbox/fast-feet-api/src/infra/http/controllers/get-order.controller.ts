import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { GetOrderUseCase } from '@/domain/use-cases/get-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

@Controller('/orders')
@Roles('ADMIN')
export class GetOrderController {
  constructor(private readonly getOrder: GetOrderUseCase) {}

  @Get('/:id')
  async handle(@Param('id', new ParseUUIDPipe()) orderId: string) {
    const result = await this.getOrder.execute({ orderId })

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
      order: OrderPresenter.toHTTPWithRecipientAndAttachments(result.value.order),
    }
  }
}
