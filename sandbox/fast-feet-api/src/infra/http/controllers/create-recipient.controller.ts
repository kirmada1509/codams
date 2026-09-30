import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { CreateRecipientUseCase } from '@/domain/use-cases/create-recipient-use-case.js'
import { RecipientAlreadyExistsError } from '@/domain/errors/recipient-already-exists-errors.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const createRecipientBodySchema = z.object({
  name: z.string().trim().min(3),
  email: z.email().trim(),
  phone: z.string().trim().min(1).optional(),
})

type CreateRecipientBody = z.infer<typeof createRecipientBodySchema>

@Controller('/recipients')
@Roles('ADMIN')
export class CreateRecipientController {
  constructor(private readonly createRecipient: CreateRecipientUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createRecipientBodySchema))
    body: CreateRecipientBody
  ) {
    const { name, email, phone } = body

    const result = await this.createRecipient.execute({
      name,
      email,
      phone,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case RecipientAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
