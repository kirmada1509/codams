import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { makeRecipientData } from '@/test/factories/index.js'
import { GetRecipientUseCase } from './get-recipient-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

describe('get recipient use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let sut: GetRecipientUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    sut = new GetRecipientUseCase(recipientsRepository)
  })

  it('should return recipient data when it exists', async () => {
    await recipientsRepository.create(makeRecipientData())

    const recipientId = recipientsRepository.items[0].id

    const result = await sut.execute({ recipientId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.recipient.id).toBe(recipientId)
    }
  })

  it('should return not found when recipient does not exist', async () => {
    const result = await sut.execute({ recipientId: 'not-found-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
