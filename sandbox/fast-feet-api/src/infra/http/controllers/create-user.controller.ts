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
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { CreateUserUseCase } from '@/domain/use-cases/create-user-use-case.js'
import { UserAlreadyExistsError } from '@/domain/errors/user-already-exists-errors.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { cpfSchema } from '@/infra/http/validators/cpf.schema.js'

const createUserBodySchema = z.object({
  name: z.string().trim().min(3),
  cpf: cpfSchema,
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'COURIER']).default('COURIER'),
})

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>

@Controller('/users')
@Roles('ADMIN')
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async handle(@Body() body: CreateUserBodySchema) {
    const { name, cpf, password, role } = body

    const result = await this.createUser.execute({
      name,
      cpf,
      password,
      role,
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
