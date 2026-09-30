import { Controller, Get, Query } from '@nestjs/common'
import { ListRecipientsUseCase } from '@/domain/use-cases/list-recipients-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { RecipientPresenter } from '@/infra/http/presenters/recipient-presenter.js'
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '@/infra/http/schemas/pagination-query.schema.js'

@Controller('/recipients')
@Roles('ADMIN')
export class ListRecipientsController {
  constructor(private readonly listRecipients: ListRecipientsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery
  ) {
    const { page, perPage } = query

    const result = await this.listRecipients.execute({
      page,
      perPage,
    })

    if (result.isRight() && result.value.recipients.length > 0) {
      return {
        recipients: result.value.recipients.map((recipient) =>
          RecipientPresenter.toHTTP(recipient)
        ),
      }
    }

    return {
      recipients: [],
    }
  }
}
