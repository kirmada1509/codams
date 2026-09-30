import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { ListCouriersUseCase } from '@/domain/use-cases/list-couriers-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { CourierPresenter } from '@/infra/http/presenters/courier-presenter.js'
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '@/infra/http/schemas/pagination-query.schema.js'

@Controller('/couriers')
@Roles('ADMIN')
export class ListCouriersController {
  constructor(private readonly listCouriers: ListCouriersUseCase) {}

  @Get()
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async handle(@Query() query: PaginationQuery) {
    const { page, perPage } = query

    const result = await this.listCouriers.execute({
      page,
      perPage,
    })

    if (result.isRight() && result.value.couriers.length > 0) {
      return {
        couriers: result.value.couriers.map((courier) =>
          CourierPresenter.toHTTP(courier)
        ),
      }
    }

    return {
      couriers: [],
    }
  }
}
