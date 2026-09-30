import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { AttachmentsRepository } from '@/domain/repositories/attachments-repository.js'
import { Uploader } from '@/domain/storage/uploader.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import type { OrderWithRecipientAndAttachments } from '@/domain/entities/order.js'

interface GetOrderUseCaseRequest {
  orderId: string
}

type GetOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: OrderWithRecipientAndAttachments
  }
>

@Injectable()
export class GetOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly uploader: Uploader
  ) {}

  async execute({
    orderId,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const order = await this.ordersRepository.findByIdWithRecipient(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    const rawAttachments = await this.attachmentsRepository.findByOrderId(orderId)

    const attachments = await Promise.all(
      rawAttachments.map(async (a) => ({
        ...a,
        url: await this.uploader.getFileUrl(a.url),
      }))
    )

    return right({ order: { ...order, attachments } })
  }
}
