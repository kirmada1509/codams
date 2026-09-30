import { Injectable } from '@nestjs/common'
import { NotificationsRepository } from '@/domain/repositories/notifications-repository.js'
import type {
  CreateNotificationData,
  Notification,
} from '@/domain/entities/notification.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationData): Promise<void> {
    await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        title: data.title,
        content: data.content,
        status: data.status,
      },
    })
  }

  async findManyByRecipientId(recipientId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
    })

    return notifications
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }
}
