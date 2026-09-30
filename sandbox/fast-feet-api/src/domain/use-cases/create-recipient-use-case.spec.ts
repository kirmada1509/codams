import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { makeRecipientData } from '@/test/factories/index.js'
import { CreateRecipientUseCase } from './create-recipient-use-case.js'
import { RecipientAlreadyExistsError } from '../errors/recipient-already-exists-errors.js'

describe('create recipient use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let sut: CreateRecipientUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    sut = new CreateRecipientUseCase(recipientsRepository)
  })

  it('should create a recipient when email is unique', async () => {
    const result = await sut.execute({
      name: 'Recipient One',
      email: 'recipient@example.com',
      phone: '11999999999',
    })

    expect(result.isRight()).toBe(true)
    expect(recipientsRepository.items).toHaveLength(1)
  })

  it('should not create a recipient when email already exists', async () => {
    await recipientsRepository.create(
      makeRecipientData({ email: 'recipient@example.com' })
    )

    const result = await sut.execute({
      name: 'Recipient Two',
      email: 'recipient@example.com',
      phone: '11988888888',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(RecipientAlreadyExistsError)
  })
})
