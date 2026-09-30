import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { GetCourierUseCase } from '@/domain/use-cases/get-courier-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CourierPresenter } from '@/infra/http/presenters/courier-presenter.js'

@Controller('/couriers')
@Roles('ADMIN')
export class GetCourierController {
  constructor(private readonly getCourier: GetCourierUseCase) {}

  @Get('/:id')
  async handle(@Param('id', new ParseUUIDPipe()) courierId: string) {
    const result = await this.getCourier.execute({ courierId })

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
      courier: CourierPresenter.toHTTP(result.value.courier),
    }
  }
}
