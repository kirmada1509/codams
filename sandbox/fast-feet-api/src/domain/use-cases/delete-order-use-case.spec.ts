import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { makeOrderData } from '@/test/factories/index.js'
import { DeleteOrderUseCase } from './delete-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('delete order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: DeleteOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new DeleteOrderUseCase(ordersRepository)
  })

  it('should hard delete an order when status is WAITING', async () => {
    await ordersRepository.create(
      makeOrderData({ id: 'order-1', status: 'WAITING' })
    )

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(0)
  })

  it('should hard delete an order when status is PENDING', async () => {
    await ordersRepository.create(
      makeOrderData({ id: 'order-1', status: 'PENDING' })
    )

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(0)
  })

  it('should soft delete an order when status is WITHDRAWN', async () => {
    await ordersRepository.create(
      makeOrderData({ id: 'order-1', status: 'WITHDRAWN' })
    )

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(1)
    expect(ordersRepository.items[0].deletedAt).toBeInstanceOf(Date)
  })

  it('should soft delete an order when status is DELIVERED', async () => {
    await ordersRepository.create(
      makeOrderData({ id: 'order-1', status: 'DELIVERED' })
    )

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(1)
    expect(ordersRepository.items[0].deletedAt).toBeInstanceOf(Date)
  })

  it('should soft delete an order when status is RETURNED', async () => {
    await ordersRepository.create(
      makeOrderData({ id: 'order-1', status: 'RETURNED' })
    )

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(1)
    expect(ordersRepository.items[0].deletedAt).toBeInstanceOf(Date)
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({ orderId: 'non-existent-order' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
