import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeMailer } from '@/test/messaging/fake-mailer.js'
import { Mailer } from '@/domain/messaging/mailer.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'

describe('send notification use case', () => {
  let notificationsRepository: InMemoryNotificationsRepository
  let mailer: FakeMailer
  let sut: SendNotificationUseCase

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    mailer = new FakeMailer()
    sut = new SendNotificationUseCase(notificationsRepository, mailer)
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: 'recipient-1',
      recipientEmail: 'recipient@example.com',
      title: 'Pedido saiu para entrega',
      content: 'Seu pedido saiu para entrega e está a caminho!',
    })

    expect(result.isRight()).toBe(true)
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationsRepository.items[0].status).toBe('SENT')
    expect(notificationsRepository.items[0]).toEqual(
      expect.objectContaining({
        recipientId: 'recipient-1',
        title: 'Pedido saiu para entrega',
        content: 'Seu pedido saiu para entrega e está a caminho!',
      })
    )
  })

  it('should send an email when notification is sent', async () => {
    await sut.execute({
      recipientId: 'recipient-1',
      recipientEmail: 'recipient@example.com',
      title: 'Pedido saiu para entrega',
      content: 'Seu pedido saiu para entrega e está a caminho!',
    })

    expect(mailer.emails).toHaveLength(1)
    expect(mailer.emails[0]).toEqual({
      to: 'recipient@example.com',
      subject: 'Pedido saiu para entrega',
      body: 'Seu pedido saiu para entrega e está a caminho!',
    })
  })

  it('should store a failed notification when email sending fails', async () => {
    class FailingMailer implements Mailer {
      async send(): Promise<void> {
        throw new Error('SMTP unavailable')
      }
    }

    sut = new SendNotificationUseCase(
      notificationsRepository,
      new FailingMailer()
    )

    const result = await sut.execute({
      recipientId: 'recipient-1',
      recipientEmail: 'recipient@example.com',
      title: 'Pedido saiu para entrega',
      content: 'Falha ao enviar notificacao',
    })

    expect(result.isLeft()).toBe(true)
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationsRepository.items[0].status).toBe('FAILED')
  })
})
