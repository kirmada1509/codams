import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, right } from '@/domain/errors/either.js'
import type { Order } from '@/domain/entities/order.js'
import type { OrderStatus } from '@/domain/entities/order-status.js'

interface ListCourierOrdersUseCaseRequest {
  courierId: string
  page: number
  perPage: number
  status?: OrderStatus
  search?: string
}

type ListCourierOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
    total: number
  }
>

@Injectable()
export class ListCourierOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    courierId,
    page,
    perPage,
    status,
    search,
  }: ListCourierOrdersUseCaseRequest): Promise<ListCourierOrdersUseCaseResponse> {
    const { orders, total } = await this.ordersRepository.findManyByCourierId({
      courierId,
      page,
      perPage,
      status,
      search,
    })

    return right({ orders, total })
  }
}
