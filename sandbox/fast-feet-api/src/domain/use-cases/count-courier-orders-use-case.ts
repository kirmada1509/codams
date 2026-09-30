import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { type Either, right } from '@/domain/errors/either.js'

interface CountCourierOrdersUseCaseRequest {
  courierId: string
}

type CountCourierOrdersUseCaseResponse = Either<
  null,
  { available: number; withdrawn: number; delivered: number }
>

@Injectable()
export class CountCourierOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    courierId,
  }: CountCourierOrdersUseCaseRequest): Promise<CountCourierOrdersUseCaseResponse> {
    const counts = await this.ordersRepository.countByCourierId(courierId)
    return right(counts)
  }
}
