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
import { MarkOrderAsWaitingUseCase } from '@/domain/use-cases/mark-order-as-waiting-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'

@Controller('/orders')
@Roles('ADMIN')
export class MarkOrderAsWaitingController {
  constructor(private readonly markOrderAsWaiting: MarkOrderAsWaitingUseCase) {}

  @Patch(':orderId/waiting')
  @HttpCode(204)
  async handle(@Param('orderId', new ParseUUIDPipe()) orderId: string) {
    const result = await this.markOrderAsWaiting.execute({ orderId })

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
