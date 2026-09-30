import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { SendNotificationUseCase } from '@/domain/use-cases/send-notification-use-case.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'

interface WithdrawOrderUseCaseRequest {
  orderId: string
  courierId: string
}

type WithdrawOrderUseCaseResponse = Either<
  ResourceNotFoundError | InvalidOrderStatusError,
  null
>

@Injectable()
export class WithdrawOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly sendNotification: SendNotificationUseCase
  ) {}

  async execute({
    orderId,
    courierId,
  }: WithdrawOrderUseCaseRequest): Promise<WithdrawOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    if (order.status !== 'WAITING') {
      return left(new InvalidOrderStatusError(order.status, 'WAITING'))
    }

    await this.ordersRepository.withdraw(orderId, courierId, new Date())

    try {
      const recipient = await this.recipientsRepository.findById(
        order.recipientId
      )
      if (recipient) {
        await this.sendNotification.execute({
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          title: 'Pedido saiu para entrega',
          content: 'Seu pedido saiu para entrega e está a caminho!',
        })
      }
    } catch (error) {
      console.error('Failed to send notification for order', orderId, error)
    }

    return right(null)
  }
}
