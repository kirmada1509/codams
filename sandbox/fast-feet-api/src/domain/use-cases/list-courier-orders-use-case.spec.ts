import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { makeOrderData } from '@/test/factories/index.js'
import { ListCourierOrdersUseCase } from './list-courier-orders-use-case.js'

describe('list courier orders use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: ListCourierOrdersUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new ListCourierOrdersUseCase(ordersRepository)
  })

  it('should list only orders assigned to the courier', async () => {
    const courierId1 = 'courier-1'
    const courierId2 = 'courier-2'

    // Create orders for courier 1
    for (let i = 1; i <= 5; i++) {
      await ordersRepository.create(
        makeOrderData({
          id: `order-courier1-${i}`,
          status: 'WITHDRAWN',
          courierId: courierId1,
        })
      )
    }

    // Create orders for courier 2
    for (let i = 1; i <= 3; i++) {
      await ordersRepository.create(
        makeOrderData({
          id: `order-courier2-${i}`,
          status: 'WITHDRAWN',
          courierId: courierId2,
        })
      )
    }

    // Create order without courier
    await ordersRepository.create(
      makeOrderData({
        id: 'order-no-courier',
        status: 'WAITING',
      })
    )

    const result = await sut.execute({
      courierId: courierId1,
      page: 1,
      perPage: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(5)
      expect(
        result.value.orders.every((order) => order.courierId === courierId1)
      ).toBe(true)
    }
  })

  it('should list orders with pagination for courier', async () => {
    const courierId = 'courier-1'

    // Create 15 orders for courier
    for (let i = 1; i <= 15; i++) {
      await ordersRepository.create(
        makeOrderData({
          id: `order-${i}`,
          status: 'WITHDRAWN',
          courierId,
        })
      )
    }

    // Create 5 orders for another courier (should not appear)
    for (let i = 1; i <= 5; i++) {
      await ordersRepository.create(
        makeOrderData({
          id: `order-other-${i}`,
          status: 'WITHDRAWN',
          courierId: 'courier-2',
        })
      )
    }

    const resultPage1 = await sut.execute({
      courierId,
      page: 1,
      perPage: 10,
    })
    const resultPage2 = await sut.execute({
      courierId,
      page: 2,
      perPage: 10,
    })

    expect(resultPage1.isRight()).toBe(true)
    expect(resultPage2.isRight()).toBe(true)

    if (resultPage1.isRight()) {
      expect(resultPage1.value.orders).toHaveLength(10)
      expect(
        resultPage1.value.orders.every((order) => order.courierId === courierId)
      ).toBe(true)
    }

    if (resultPage2.isRight()) {
      expect(resultPage2.value.orders).toHaveLength(5)
      expect(
        resultPage2.value.orders.every((order) => order.courierId === courierId)
      ).toBe(true)
    }
  })

  it('should return empty array when courier has no orders', async () => {
    // Create orders for another courier
    await ordersRepository.create(
      makeOrderData({
        id: 'order-other',
        status: 'WITHDRAWN',
        courierId: 'courier-2',
      })
    )

    const result = await sut.execute({
      courierId: 'courier-with-no-orders',
      page: 1,
      perPage: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(0)
    }
  })

  it('should not return orders assigned to other couriers', async () => {
    const courierId = 'courier-1'

    // Create order for courier 1
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WITHDRAWN',
        courierId,
      })
    )

    // Create order for courier 2
    await ordersRepository.create(
      makeOrderData({
        id: 'order-2',
        status: 'WITHDRAWN',
        courierId: 'courier-2',
      })
    )

    const result = await sut.execute({
      courierId,
      page: 1,
      perPage: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].id).toBe('order-1')
      expect(result.value.orders[0].courierId).toBe(courierId)
    }
  })

  it('should not return orders without courier assigned', async () => {
    const courierId = 'courier-1'

    // Create order for courier
    await ordersRepository.create(
      makeOrderData({
        id: 'order-with-courier',
        status: 'WITHDRAWN',
        courierId,
      })
    )

    // Create order without courier
    await ordersRepository.create(
      makeOrderData({
        id: 'order-without-courier',
        status: 'WAITING',
      })
    )

    const result = await sut.execute({
      courierId,
      page: 1,
      perPage: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].id).toBe('order-with-courier')
    }
  })
})
