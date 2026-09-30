import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { AttachmentsRepository } from '@/domain/repositories/attachments-repository.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { SendNotificationUseCase } from '@/domain/use-cases/send-notification-use-case.js'
import { Uploader } from '@/domain/storage/uploader.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '@/domain/errors/not-order-courier-error.js'
import { AttachmentRequiredError } from '@/domain/errors/attachment-required-error.js'

interface DeliverOrderUseCaseRequest {
  orderId: string
  courierId: string
  fileName: string
  fileType: string
  body: Buffer
}

type DeliverOrderUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidOrderStatusError
  | NotOrderCourierError
  | AttachmentRequiredError,
  { attachmentUrl: string }
>

@Injectable()
export class DeliverOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly sendNotification: SendNotificationUseCase,
    private readonly uploader: Uploader
  ) {}

  async execute({
    orderId,
    courierId,
    fileName,
    fileType,
    body,
  }: DeliverOrderUseCaseRequest): Promise<DeliverOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    if (order.status !== 'WITHDRAWN') {
      return left(new InvalidOrderStatusError(order.status, 'WITHDRAWN'))
    }

    if (order.courierId !== courierId) {
      return left(new NotOrderCourierError())
    }

    if (!body || body.length === 0) {
      return left(new AttachmentRequiredError())
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    await this.attachmentsRepository.create({ title: fileName, url, orderId })

    await this.ordersRepository.deliver(orderId, new Date())

    try {
      const recipient = await this.recipientsRepository.findById(
        order.recipientId
      )
      if (recipient) {
        await this.sendNotification.execute({
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          title: 'Pedido entregue',
          content: 'Seu pedido foi entregue com sucesso.',
        })
      }
    } catch (error) {
      console.error('Failed to send notification for order', orderId, error)
    }

    return right({ attachmentUrl: url })
  }
}
