import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common'
import { z } from 'zod'
import { UpdateOrderUseCase } from '@/domain/use-cases/update-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const updateOrderBodySchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  street: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  neighborhood: z.string().trim().min(1).optional(),
  state: z.string().trim().min(2).max(2).optional(),
  zip: z.string().trim().min(8).max(9).optional(),
  country: z.string().trim().min(1).optional(),
  complement: z.string().trim().optional(),
})

type UpdateOrderBody = z.infer<typeof updateOrderBodySchema>

@Controller('/orders')
@Roles('ADMIN')
export class UpdateOrderController {
  constructor(private readonly updateOrder: UpdateOrderUseCase) {}

  @Patch('/:id')
  async handle(
    @Param('id', new ParseUUIDPipe()) orderId: string,
    @Body(new ZodValidationPipe(updateOrderBodySchema))
    body: UpdateOrderBody
  ) {
    const {
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

    const result = await this.updateOrder.execute({
      orderId,
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
