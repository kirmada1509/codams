import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeMailer } from '@/test/messaging/fake-mailer.js'
import { makeOrderData, makeRecipientData } from '@/test/factories/index.js'
import { ReturnOrderUseCase } from './return-order-use-case.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'

describe('return order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let mailer: FakeMailer
  let sendNotification: SendNotificationUseCase
  let sut: ReturnOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    mailer = new FakeMailer()
    sendNotification = new SendNotificationUseCase(
      notificationsRepository,
      mailer
    )
    sut = new ReturnOrderUseCase(
      ordersRepository,
      recipientsRepository,
      sendNotification
    )
  })

  it('should be able to return an order', async () => {
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
        status: 'WITHDRAWN',
        recipientId: 'recipient-1',
        courierId: 'courier-1',
      })
    )

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items[0].status).toBe('RETURNED')
    expect(ordersRepository.items[0].returnDate).toBeInstanceOf(Date)

    await vi.waitFor(() => {
      expect(notificationsRepository.items).toHaveLength(1)
    })
    expect(notificationsRepository.items[0]).toMatchObject({
      recipientId: 'recipient-1',
      title: 'Pedido devolvido',
      content:
        'Infelizmente seu pedido foi devolvido. Entre em contato para mais informações.',
    })
    expect(mailer.emails).toHaveLength(1)
    expect(mailer.emails[0]).toMatchObject({
      to: 'john@example.com',
      subject: 'Pedido devolvido',
      body: 'Infelizmente seu pedido foi devolvido. Entre em contato para mais informações.',
    })
  })

  it('should not be able to return a non-existent order', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to return an order that is not withdrawn', async () => {
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

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
  })

  it('should not be able to return an order from a different courier', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WITHDRAWN',
        recipientId: 'recipient-1',
        courierId: 'courier-1',
      })
    )

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'different-courier',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotOrderCourierError)
  })
})
