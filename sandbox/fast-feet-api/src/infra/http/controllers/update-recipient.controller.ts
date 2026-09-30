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
import { UpdateRecipientUseCase } from '@/domain/use-cases/update-recipient-use-case.js'
import { RecipientAlreadyExistsError } from '@/domain/errors/recipient-already-exists-errors.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const updateRecipientBodySchema = z
  .object({
    name: z.string().trim().min(3).optional(),
    email: z.email().trim().optional(),
    phone: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.name || data.email || data.phone, {
    message: 'At least one field must be provided',
  })

type UpdateRecipientBody = z.infer<typeof updateRecipientBodySchema>

@Controller('/recipients')
@Roles('ADMIN')
export class UpdateRecipientController {
  constructor(private readonly updateRecipient: UpdateRecipientUseCase) {}

  @Patch('/:id')
  async handle(
    @Param('id', new ParseUUIDPipe()) recipientId: string,
    @Body(new ZodValidationPipe(updateRecipientBodySchema))
    body: UpdateRecipientBody
  ) {
    const result = await this.updateRecipient.execute({
      recipientId,
      name: body.name,
      email: body.email,
      phone: body.phone,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case RecipientAlreadyExistsError:
          throw new ConflictException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
