import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeMailer } from '@/test/messaging/fake-mailer.js'
import { FakeUploader } from '@/test/storage/fake-uploader.js'
import { makeOrderData, makeRecipientData } from '@/test/factories/index.js'
import { DeliverOrderUseCase } from './deliver-order-use-case.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'
import { AttachmentRequiredError } from '../errors/attachment-required-error.js'

describe('deliver order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let attachmentsRepository: InMemoryAttachmentsRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let mailer: FakeMailer
  let sendNotification: SendNotificationUseCase
  let uploader: FakeUploader
  let sut: DeliverOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    attachmentsRepository = new InMemoryAttachmentsRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    mailer = new FakeMailer()
    sendNotification = new SendNotificationUseCase(
      notificationsRepository,
      mailer
    )
    uploader = new FakeUploader()
    sut = new DeliverOrderUseCase(
      ordersRepository,
      attachmentsRepository,
      recipientsRepository,
      sendNotification,
      uploader
    )
  })

  it('should be able to deliver an order with photo', async () => {
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
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.attachmentUrl).toBeTruthy()
    }
    expect(ordersRepository.items[0].status).toBe('DELIVERED')
    expect(ordersRepository.items[0].deliveryDate).toBeInstanceOf(Date)
    expect(attachmentsRepository.items).toHaveLength(1)
    expect(attachmentsRepository.items[0].orderId).toBe('order-1')
    expect(uploader.uploads).toHaveLength(1)

    await vi.waitFor(() => {
      expect(notificationsRepository.items).toHaveLength(1)
    })
    expect(notificationsRepository.items[0]).toMatchObject({
      recipientId: 'recipient-1',
      title: 'Pedido entregue',
      content: 'Seu pedido foi entregue com sucesso.',
    })
    expect(mailer.emails).toHaveLength(1)
    expect(mailer.emails[0]).toMatchObject({
      to: 'john@example.com',
      subject: 'Pedido entregue',
      body: 'Seu pedido foi entregue com sucesso.',
    })
  })

  it('should not deliver order if courier is not the owner', async () => {
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
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotOrderCourierError)
  })

  it('should not deliver order that is not withdrawn', async () => {
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
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
  })

  it('should not deliver non-existent order', async () => {
    const result = await sut.execute({
      orderId: 'non-existent',
      courierId: 'courier-1',
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not deliver order without file', async () => {
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
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(AttachmentRequiredError)
  })
})
