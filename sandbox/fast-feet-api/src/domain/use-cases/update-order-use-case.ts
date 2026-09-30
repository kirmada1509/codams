import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

interface UpdateOrderUseCaseRequest {
  orderId: string
  title?: string
  description?: string
  latitude?: number
  longitude?: number
  street?: string
  number?: string
  city?: string
  neighborhood?: string
  state?: string
  zip?: string
  country?: string
  complement?: string
}

type UpdateOrderUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class UpdateOrderUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
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
  }: UpdateOrderUseCaseRequest): Promise<UpdateOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    await this.ordersRepository.save({
      id: orderId,
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
