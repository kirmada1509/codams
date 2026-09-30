import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { DeleteOrderUseCase } from '@/domain/use-cases/delete-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

@Controller('/orders')
@Roles('ADMIN')
export class DeleteOrderController {
  constructor(private readonly deleteOrder: DeleteOrderUseCase) {}

  @Delete('/:id')
  @HttpCode(204)
  async handle(@Param('id', new ParseUUIDPipe()) orderId: string) {
    const result = await this.deleteOrder.execute({ orderId })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
