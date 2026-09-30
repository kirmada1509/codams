import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { CreateCourierUseCase } from '@/domain/use-cases/create-courier-use-case.js'
import { UserAlreadyExistsError } from '@/domain/errors/user-already-exists-errors.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { cpfSchema } from '@/infra/http/validators/cpf.schema.js'

const createCourierBodySchema = z.object({
  name: z.string().trim().min(3),
  cpf: cpfSchema,
  password: z.string().min(6),
})

type CreateCourierBody = z.infer<typeof createCourierBodySchema>

@Controller('/couriers')
@Roles('ADMIN')
export class CreateCourierController {
  constructor(private readonly createCourier: CreateCourierUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createCourierBodySchema))
  async handle(@Body() body: CreateCourierBody) {
    const { name, cpf, password } = body

    const result = await this.createCourier.execute({
      name,
      cpf,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
