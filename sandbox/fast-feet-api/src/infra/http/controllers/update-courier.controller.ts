import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common'
import { z } from 'zod'
import { UpdateCourierUseCase } from '@/domain/use-cases/update-courier-use-case.js'
import { UserAlreadyExistsError } from '@/domain/errors/user-already-exists-errors.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { cpfSchema } from '@/infra/http/validators/cpf.schema.js'

const updateCourierBodySchema = z
  .object({
    name: z.string().trim().min(3).optional(),
    cpf: cpfSchema.optional(),
  })
  .refine((data) => data.name || data.cpf, {
    message: 'At least one field must be provided',
  })

type UpdateCourierBody = z.infer<typeof updateCourierBodySchema>

@Controller('/couriers')
@Roles('ADMIN')
export class UpdateCourierController {
  constructor(private readonly updateCourier: UpdateCourierUseCase) {}

  @Patch('/:id')
  async handle(
    @Param('id', new ParseUUIDPipe()) courierId: string,
    @Body(new ZodValidationPipe(updateCourierBodySchema))
    body: UpdateCourierBody
  ) {
    const result = await this.updateCourier.execute({
      courierId,
      name: body.name,
      cpf: body.cpf,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
