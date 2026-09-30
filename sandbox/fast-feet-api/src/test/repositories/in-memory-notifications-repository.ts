import { NotificationsRepository } from '@/domain/repositories/notifications-repository.js'
import type {
  CreateNotificationData,
  Notification,
} from '@/domain/entities/notification.js'
import { randomUUID } from 'node:crypto'

export class InMemoryNotificationsRepository implements NotificationsRepository {
  public items: Notification[] = []

  async create(data: CreateNotificationData): Promise<void> {
    const notification: Notification = {
      id: randomUUID(),
      recipientId: data.recipientId,
      title: data.title,
      content: data.content,
      status: data.status,
      readAt: null,
      createdAt: new Date(),
    }

    this.items.push(notification)
  }

  async findManyByRecipientId(recipientId: string): Promise<Notification[]> {
    const notifications = this.items.filter(
      (item) => item.recipientId === recipientId
    )

    return notifications
  }

  async markAsRead(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id)

    if (itemIndex < 0) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    this.items[itemIndex].readAt = new Date()
  }
}
