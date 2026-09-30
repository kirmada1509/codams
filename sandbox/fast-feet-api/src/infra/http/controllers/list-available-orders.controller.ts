import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListAvailableOrdersUseCase } from '@/domain/use-cases/list-available-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'
import { paginationQuerySchema } from '@/infra/http/schemas/pagination-query.schema.js'

const availableOrdersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
})

type AvailableOrdersQuery = z.infer<typeof availableOrdersQuerySchema>

@Controller('/orders/available')
@Roles('COURIER')
export class ListAvailableOrdersController {
  constructor(private readonly listAvailableOrders: ListAvailableOrdersUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(availableOrdersQuerySchema))
    query: AvailableOrdersQuery
  ) {
    const { page, perPage, search } = query

    const result = await this.listAvailableOrders.execute({
      page,
      perPage,
      search,
    })

    if (result.isRight()) {
      return {
        orders: result.value.orders.map((order) => OrderPresenter.toHTTP(order)),
        meta: { total: result.value.total, page, perPage },
      }
    }

    return { orders: [], meta: { total: 0, page, perPage } }
  }
}
