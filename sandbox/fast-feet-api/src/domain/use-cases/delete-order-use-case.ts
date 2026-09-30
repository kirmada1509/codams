import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

interface DeleteOrderUseCaseRequest {
  orderId: string
}

type DeleteOrderUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteOrderUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
  }: DeleteOrderUseCaseRequest): Promise<DeleteOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    const shouldSoftDelete = ['WITHDRAWN', 'DELIVERED', 'RETURNED'].includes(
      order.status
    )

    if (shouldSoftDelete) {
      order.deletedAt = new Date()
      await this.ordersRepository.save({
        id: order.id,
        deletedAt: order.deletedAt,
      })
    } else {
      await this.ordersRepository.delete(orderId)
    }

    return right(null)
  }
}
