import { Injectable } from '@nestjs/common'
import type {
  Notification,
  CreateNotificationData,
} from '@/domain/entities/notification.js'

@Injectable()
export abstract class NotificationsRepository {
  abstract create(data: CreateNotificationData): Promise<void>
  abstract findManyByRecipientId(recipientId: string): Promise<Notification[]>
  abstract markAsRead(id: string): Promise<void>
}
