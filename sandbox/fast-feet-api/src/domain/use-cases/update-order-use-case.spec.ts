import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { makeOrderData } from '@/test/factories/index.js'
import { UpdateOrderUseCase } from './update-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('update order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: UpdateOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new UpdateOrderUseCase(ordersRepository)
  })

  it('should update an order', async () => {
    await ordersRepository.create(
      makeOrderData({
        id: 'order-1',
        complement: 'Apto 101',
        city: 'São Paulo',
        neighborhood: 'Centro',
        state: 'SP',
      })
    )

    const result = await sut.execute({
      orderId: 'order-1',
      street: 'Rua Augusta',
      number: '2000',
      complement: 'Casa',
    })

    expect(result.isRight()).toBe(true)

    const updatedOrder = await ordersRepository.findById('order-1')
    expect(updatedOrder).toMatchObject({
      street: 'Rua Augusta',
      number: '2000',
      complement: 'Casa',
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP',
    })
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
      street: 'Rua Augusta',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
