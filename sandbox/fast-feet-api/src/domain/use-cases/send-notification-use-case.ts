import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/domain/errors/either.js'
import { NotificationsRepository } from '@/domain/repositories/notifications-repository.js'
import { NotificationStatus } from '@/domain/entities/notification.js'
import { Mailer } from '@/domain/messaging/mailer.js'
import { NotificationFailureError } from '@/domain/errors/notification-failure-error.js'

interface SendNotificationUseCaseRequest {
  recipientId: string
  recipientEmail: string
  title: string
  content: string
}

type SendNotificationUseCaseResponse = Either<NotificationFailureError, null>

@Injectable()
export class SendNotificationUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly mailer: Mailer
  ) {}

  async execute({
    recipientId,
    recipientEmail,
    title,
    content,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    let status: NotificationStatus = 'SENT'
    let sendErrorMessage: string | null = null

    try {
      await this.mailer.send({
        to: recipientEmail,
        subject: title,
        body: content,
      })
    } catch (error) {
      status = 'FAILED'
      sendErrorMessage =
        error instanceof Error ? error.message : 'Failed to send notification'
      console.error(
        'Failed to send email notification',
        { recipientId, recipientEmail },
        error
      )
    }

    try {
      await this.notificationsRepository.create({
        recipientId,
        title,
        content,
        status,
      })
    } catch (error) {
      console.error('Failed to store notification', { recipientId }, error)
      return left(
        new NotificationFailureError(
          error instanceof Error ? error.message : 'Failed to store notification'
        )
      )
    }

    if (status === 'FAILED') {
      return left(
        new NotificationFailureError(
          sendErrorMessage ?? 'Failed to send notification'
        )
      )
    }

    return right(null)
  }
}
