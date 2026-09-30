import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, right } from '@/domain/errors/either.js'
import type { Order } from '@/domain/entities/order.js'

interface ListAvailableOrdersUseCaseRequest {
  page: number
  perPage: number
  search?: string
}

type ListAvailableOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
    total: number
  }
>

@Injectable()
export class ListAvailableOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    page,
    perPage,
    search,
  }: ListAvailableOrdersUseCaseRequest): Promise<ListAvailableOrdersUseCaseResponse> {
    const { orders, total } = await this.ordersRepository.findManyAvailable({
      page,
      perPage,
      search,
    })

    return right({ orders, total })
  }
}
