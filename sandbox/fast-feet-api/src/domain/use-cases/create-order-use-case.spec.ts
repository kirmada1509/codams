import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { makeRecipientData } from '@/test/factories/index.js'
import { CreateOrderUseCase } from './create-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('create order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let sut: CreateOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    sut = new CreateOrderUseCase(ordersRepository, recipientsRepository)
  })

  it('should create an order when recipient exists', async () => {
    await recipientsRepository.create(makeRecipientData({ id: 'recipient-1' }))

    const result = await sut.execute({
      recipientId: 'recipient-1',
      title: 'Pacote frágil',
      description: 'Cuidado ao manusear',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
      complement: 'Apto 101',
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(1)
    expect(ordersRepository.items[0]).toMatchObject({
      status: 'PENDING',
      recipientId: 'recipient-1',
      title: 'Pacote frágil',
      description: 'Cuidado ao manusear',
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
      complement: 'Apto 101',
      courierId: null,
    })
  })

  it('should create an order without latitude and longitude coordinates', async () => {
    await recipientsRepository.create(makeRecipientData({ id: 'recipient-1' }))

    const result = await sut.execute({
      recipientId: 'recipient-1',
      title: 'Pacote sem coordenadas',
      description: 'Cuidado ao manusear',
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
      complement: 'Apto 101',
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items).toHaveLength(1)
    expect(ordersRepository.items[0]).toMatchObject({
      status: 'PENDING',
      recipientId: 'recipient-1',
      title: 'Pacote sem coordenadas',
      description: 'Cuidado ao manusear',
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
      complement: 'Apto 101',
      latitude: null,
      longitude: null,
      courierId: null,
    })
  })

  it('should not create an order when recipient does not exist', async () => {
    const result = await sut.execute({
      recipientId: 'non-existent-recipient',
      title: 'Pacote',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(ordersRepository.items).toHaveLength(0)
  })
})
