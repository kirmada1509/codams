import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { makeOrderData } from '@/test/factories/index.js'
import { CountCourierOrdersUseCase } from './count-courier-orders-use-case.js'

describe('count courier orders use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: CountCourierOrdersUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new CountCourierOrdersUseCase(ordersRepository)
  })

  it('should return correct counts for each status', async () => {
    const courierId = 'courier-1'

    // Available orders (WAITING, no courier)
    await ordersRepository.create(makeOrderData({ status: 'WAITING' }))
    await ordersRepository.create(makeOrderData({ status: 'WAITING' }))

    // Withdrawn orders for this courier
    await ordersRepository.create(
      makeOrderData({ status: 'WITHDRAWN', courierId })
    )
    await ordersRepository.create(
      makeOrderData({ status: 'WITHDRAWN', courierId })
    )
    await ordersRepository.create(
      makeOrderData({ status: 'WITHDRAWN', courierId })
    )

    // Delivered orders for this courier
    await ordersRepository.create(
      makeOrderData({ status: 'DELIVERED', courierId })
    )

    const result = await sut.execute({ courierId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({
        available: 2,
        withdrawn: 3,
        delivered: 1,
      })
    }
  })

  it('should return zeros when courier has no orders', async () => {
    const result = await sut.execute({ courierId: 'courier-with-no-orders' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({
        available: 0,
        withdrawn: 0,
        delivered: 0,
      })
    }
  })

  it('should not count other couriers withdrawn and delivered orders', async () => {
    const courierId = 'courier-1'

    // Orders for courier-1
    await ordersRepository.create(
      makeOrderData({ status: 'WITHDRAWN', courierId })
    )
    await ordersRepository.create(
      makeOrderData({ status: 'DELIVERED', courierId })
    )

    // Orders for courier-2 (should not be counted)
    await ordersRepository.create(
      makeOrderData({ status: 'WITHDRAWN', courierId: 'courier-2' })
    )
    await ordersRepository.create(
      makeOrderData({ status: 'DELIVERED', courierId: 'courier-2' })
    )

    const result = await sut.execute({ courierId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.withdrawn).toBe(1)
      expect(result.value.delivered).toBe(1)
    }
  })

  it('should count all available orders regardless of courier', async () => {
    const courierId = 'courier-1'

    // Available orders (no courier assigned)
    await ordersRepository.create(makeOrderData({ status: 'WAITING' }))
    await ordersRepository.create(makeOrderData({ status: 'WAITING' }))
    await ordersRepository.create(makeOrderData({ status: 'WAITING' }))

    // WAITING but assigned to a courier (not available)
    await ordersRepository.create(
      makeOrderData({ status: 'WAITING', courierId: 'courier-2' })
    )

    const result = await sut.execute({ courierId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.available).toBe(3)
    }
  })
})
