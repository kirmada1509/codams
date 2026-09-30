import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common'
import { z } from 'zod'
import { UpdateUserPasswordUseCase } from '@/domain/use-cases/update-user-password-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const updateUserPasswordBodySchema = z.object({
  password: z.string().min(6),
})

type UpdateUserPasswordBody = z.infer<typeof updateUserPasswordBodySchema>

@Controller('/users')
@Roles('ADMIN')
export class UpdateUserPasswordController {
  constructor(private readonly updateUserPassword: UpdateUserPasswordUseCase) {}

  @Patch('/:id/password')
  @HttpCode(204)
  async handle(
    @Param('id', new ParseUUIDPipe()) userId: string,
    @Body(new ZodValidationPipe(updateUserPasswordBodySchema))
    body: UpdateUserPasswordBody
  ) {
    const result = await this.updateUserPassword.execute({
      userId,
      password: body.password,
    })

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
