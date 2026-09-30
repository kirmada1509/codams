import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { SendNotificationUseCase } from '@/domain/use-cases/send-notification-use-case.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'

interface MarkOrderAsWaitingUseCaseRequest {
  orderId: string
}

type MarkOrderAsWaitingUseCaseResponse = Either<
  ResourceNotFoundError | InvalidOrderStatusError,
  null
>

@Injectable()
export class MarkOrderAsWaitingUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly sendNotification: SendNotificationUseCase
  ) {}

  async execute({
    orderId,
  }: MarkOrderAsWaitingUseCaseRequest): Promise<MarkOrderAsWaitingUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    if (order.status !== 'PENDING' && order.status !== 'RETURNED') {
      return left(
        new InvalidOrderStatusError(order.status, 'PENDING or RETURNED')
      )
    }

    await this.ordersRepository.updateStatus(orderId, 'WAITING')

    try {
      const recipient = await this.recipientsRepository.findById(
        order.recipientId
      )
      if (recipient) {
        await this.sendNotification.execute({
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          title: 'Pedido disponível para retirada',
          content:
            'Seu pedido está pronto e aguardando retirada pelo entregador.',
        })
      }
    } catch (error) {
      console.error('Failed to send notification for order', orderId, error)
    }

    return right(null)
  }
}
