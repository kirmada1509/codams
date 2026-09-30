import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { DeleteCourierUseCase } from '@/domain/use-cases/delete-courier-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

@Controller('/couriers')
@Roles('ADMIN')
export class DeleteCourierController {
  constructor(private readonly deleteCourier: DeleteCourierUseCase) {}

  @Delete('/:id')
  @HttpCode(204)
  async handle(@Param('id', new ParseUUIDPipe()) courierId: string) {
    const result = await this.deleteCourier.execute({ courierId })

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
