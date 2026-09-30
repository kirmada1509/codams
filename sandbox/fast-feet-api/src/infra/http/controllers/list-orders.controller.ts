import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListOrdersUseCase } from '@/domain/use-cases/list-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'
import { paginationQuerySchema } from '@/infra/http/schemas/pagination-query.schema.js'

const listOrdersQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(['PENDING', 'WAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED'])
    .optional(),
  search: z.string().trim().min(1).optional(),
  showDeleted: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
})

type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>

@Controller('/orders')
@Roles('ADMIN')
export class ListOrdersController {
  constructor(private readonly listOrders: ListOrdersUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(listOrdersQuerySchema)) query: ListOrdersQuery
  ) {
    const { page, perPage, status, search, showDeleted } = query

    const result = await this.listOrders.execute({
      page,
      perPage,
      status,
      search,
      showDeleted,
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
