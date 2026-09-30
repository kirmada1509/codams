import { Injectable } from '@nestjs/common'
import { Either, right } from '@/domain/errors/either.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import type { Recipient } from '@/domain/entities/recipient.js'

interface ListRecipientsUseCaseRequest {
  page: number
  perPage: number
}

type ListRecipientsUseCaseResponse = Either<null, { recipients: Recipient[] }>

@Injectable()
export class ListRecipientsUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    page,
    perPage,
  }: ListRecipientsUseCaseRequest): Promise<ListRecipientsUseCaseResponse> {
    const recipients = await this.recipientsRepository.findMany({
      page,
      perPage,
    })

    return right({ recipients })
  }
}
