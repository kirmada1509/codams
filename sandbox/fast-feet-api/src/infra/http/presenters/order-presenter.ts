import type {
  Order,
  OrderWithRecipient,
  OrderWithRecipientAndAttachments,
} from '@/domain/entities/order.js'
import { RecipientPresenter } from './recipient-presenter.js'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id,
      title: order.title,
      description: order.description,
      status: order.status,
      latitude: order.latitude,
      longitude: order.longitude,
      street: order.street,
      number: order.number,
      city: order.city,
      neighborhood: order.neighborhood,
      state: order.state,
      zip: order.zip,
      country: order.country,
      complement: order.complement,
      pickupDate: order.pickupDate,
      deliveryDate: order.deliveryDate,
      recipientId: order.recipientId,
      courierId: order.courierId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }

  static toHTTPWithRecipient(order: OrderWithRecipient) {
    return {
      ...OrderPresenter.toHTTP(order),
      recipient: RecipientPresenter.toHTTP(order.recipient),
    }
  }

  static toHTTPWithRecipientAndAttachments(
    order: OrderWithRecipientAndAttachments
  ) {
    return {
      ...OrderPresenter.toHTTPWithRecipient(order),
      attachments: order.attachments.map((a) => ({
        id: a.id,
        title: a.title,
        url: a.url,
      })),
    }
  }
}
