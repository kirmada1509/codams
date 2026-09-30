import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { DeleteRecipientUseCase } from '@/domain/use-cases/delete-recipient-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

@Controller('/recipients')
@Roles('ADMIN')
export class DeleteRecipientController {
  constructor(private readonly deleteRecipient: DeleteRecipientUseCase) {}

  @Delete('/:id')
  @HttpCode(204)
  async handle(@Param('id', new ParseUUIDPipe()) recipientId: string) {
    const result = await this.deleteRecipient.execute({ recipientId })

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
