import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeMailer } from '@/test/messaging/fake-mailer.js'
import { makeOrderData, makeRecipientData } from '@/test/factories/index.js'
import { WithdrawOrderUseCase } from './withdraw-order-use-case.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'

describe('withdraw order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let mailer: FakeMailer
  let sendNotification: SendNotificationUseCase
  let sut: WithdrawOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    mailer = new FakeMailer()
    sendNotification = new SendNotificationUseCase(
      notificationsRepository,
      mailer
    )
    sut = new WithdrawOrderUseCase(
      ordersRepository,
      recipientsRepository,
      sendNotification
    )
  })

  it('should be able to withdraw an order', async () => {
    await recipientsRepository.create(
      makeRecipientData({
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@example.com',
      })
    )

    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WAITING',
        recipientId: 'recipient-1',
      })
    )

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items[0].status).toBe('WITHDRAWN')
    expect(ordersRepository.items[0].courierId).toBe('courier-1')
    expect(ordersRepository.items[0].pickupDate).toBeInstanceOf(Date)

    await vi.waitFor(() => {
      expect(notificationsRepository.items).toHaveLength(1)
    })
    expect(notificationsRepository.items[0]).toMatchObject({
      recipientId: 'recipient-1',
      title: 'Pedido saiu para entrega',
      content: 'Seu pedido saiu para entrega e está a caminho!',
    })
    expect(mailer.emails).toHaveLength(1)
    expect(mailer.emails[0]).toMatchObject({
      to: 'john@example.com',
      subject: 'Pedido saiu para entrega',
      body: 'Seu pedido saiu para entrega e está a caminho!',
    })
  })

  it('should not be able to withdraw a non-existent order', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to withdraw an order that is not waiting', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'PENDING',
        recipientId: 'recipient-1',
      })
    )

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
  })
})
