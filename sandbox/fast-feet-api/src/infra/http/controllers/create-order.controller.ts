import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { CreateOrderUseCase } from '@/domain/use-cases/create-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const createOrderBodySchema = z.object({
  recipientId: z.uuid(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  street: z.string().trim().min(1),
  number: z.string().trim().min(1),
  city: z.string().trim().min(1),
  neighborhood: z.string().trim().min(1),
  state: z.string().trim().min(2).max(2),
  zip: z.string().trim().min(8).max(9),
  country: z.string().trim().min(1).default('Brasil'),
  complement: z.string().trim().optional(),
})

type CreateOrderBody = z.infer<typeof createOrderBodySchema>

@Controller('/orders')
@Roles('ADMIN')
export class CreateOrderController {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createOrderBodySchema))
    body: CreateOrderBody
  ) {
    const {
      recipientId,
      title,
      description,
      latitude,
      longitude,
      street,
      number,
      city,
      neighborhood,
      state,
      zip,
      country,
      complement,
    } = body

    const result = await this.createOrder.execute({
      recipientId,
      title,
      description,
      latitude,
      longitude,
      street,
      number,
      city,
      neighborhood,
      state,
      zip,
      country,
      complement,
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
