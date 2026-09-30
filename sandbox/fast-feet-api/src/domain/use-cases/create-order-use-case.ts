import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

interface CreateOrderUseCaseRequest {
  recipientId: string
  title: string
  description?: string
  latitude?: number
  longitude?: number
  street: string
  number: string
  city: string
  neighborhood: string
  state: string
  zip: string
  country: string
  complement?: string
}

type CreateOrderUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository
  ) {}

  async execute({
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
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(recipientId))
    }

    await this.ordersRepository.create({
      status: 'PENDING',
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

    return right(null)
  }
}
