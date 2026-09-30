import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { makeOrderData } from '@/test/factories/index.js'
import { ListAvailableOrdersUseCase } from './list-available-orders-use-case.js'

let ordersRepository: InMemoryOrdersRepository
let sut: ListAvailableOrdersUseCase

describe('list available orders use case', () => {
  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new ListAvailableOrdersUseCase(ordersRepository)
  })

  it('should list only WAITING orders without a courier', async () => {
    await ordersRepository.create(
      makeOrderData({ id: 'order-1', status: 'WAITING', courierId: undefined })
    )
    await ordersRepository.create(
      makeOrderData({
        id: 'order-2',
        status: 'WAITING',
        courierId: 'courier-1',
      })
    )
    await ordersRepository.create(
      makeOrderData({ id: 'order-3', status: 'WITHDRAWN' })
    )
    await ordersRepository.create(
      makeOrderData({ id: 'order-4', status: 'WAITING', courierId: undefined })
    )

    const result = await sut.execute({ page: 1, perPage: 20 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(2)
    }
  })

  it('should filter by search term', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WAITING',
        city: 'São Paulo',
        neighborhood: 'Bela Vista',
      })
    )
    await ordersRepository.create(
      makeOrderData({
        id: 'order-2',
        status: 'WAITING',
        city: 'Campinas',
        neighborhood: 'Cambuí',
      })
    )

    const result = await sut.execute({
      page: 1,
      perPage: 20,
      search: 'Campinas',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].city).toBe('Campinas')
    }
  })

  it('should search by neighborhood', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WAITING',
        neighborhood: 'Cambuí',
      })
    )
    await ordersRepository.create(
      makeOrderData({
        id: 'order-2',
        status: 'WAITING',
        neighborhood: 'Centro',
      })
    )

    const result = await sut.execute({
      page: 1,
      perPage: 20,
      search: 'Cambuí',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
    }
  })

  it('should search by zip code', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        status: 'WAITING',
        zip: '13010100',
      })
    )
    await ordersRepository.create(
      makeOrderData({
        id: 'order-2',
        status: 'WAITING',
        zip: '01310100',
      })
    )

    const result = await sut.execute({
      page: 1,
      perPage: 20,
      search: '13010',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
    }
  })

  it('should paginate results', async () => {
    for (let i = 0; i < 25; i++) {
      await ordersRepository.create(
        makeOrderData({ id: `order-${i}`, status: 'WAITING' })
      )
    }

    const result = await sut.execute({ page: 2, perPage: 20 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(5)
    }
  })
})
