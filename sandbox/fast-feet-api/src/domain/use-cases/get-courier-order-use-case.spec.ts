import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository.js'
import { FakeUploader } from '@/test/storage/fake-uploader.js'
import { makeOrderData, makeRecipientData } from '@/test/factories/index.js'
import { GetCourierOrderUseCase } from './get-courier-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'

describe('get courier order use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let ordersRepository: InMemoryOrdersRepository
  let attachmentsRepository: InMemoryAttachmentsRepository
  let uploader: FakeUploader
  let sut: GetCourierOrderUseCase

  beforeEach(async () => {
    recipientsRepository = new InMemoryRecipientsRepository()
    ordersRepository = new InMemoryOrdersRepository(recipientsRepository)
    attachmentsRepository = new InMemoryAttachmentsRepository()
    uploader = new FakeUploader()
    sut = new GetCourierOrderUseCase(
      ordersRepository,
      attachmentsRepository,
      uploader
    )

    await recipientsRepository.create(
      makeRecipientData({
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@example.com',
      })
    )
  })

  it('should return a WAITING order for any courier', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WAITING',
        recipientId: 'recipient-1',
      })
    )

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'any-courier',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id).toBe('order-1')
    }
  })

  it('should return own order regardless of status', async () => {
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
    if (result.isRight()) {
      expect(result.value.order.id).toBe('order-1')
      expect(result.value.order.status).toBe('WITHDRAWN')
    }
  })

  it('should return order with attachments', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'DELIVERED',
        recipientId: 'recipient-1',
        courierId: 'courier-1',
      })
    )

    await attachmentsRepository.create({
      title: 'photo.jpg',
      url: 'abc-photo.jpg',
      orderId: 'order-1',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.attachments).toHaveLength(1)
      expect(result.value.order.attachments[0].url).toBe(
        'http://fake-url.com/abc-photo.jpg'
      )
    }
  })

  it('should return error when courier tries to access another courier non-WAITING order', async () => {
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
      courierId: 'courier-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotOrderCourierError)
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'non-existent',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
