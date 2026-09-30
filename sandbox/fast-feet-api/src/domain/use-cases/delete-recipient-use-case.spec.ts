import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { makeRecipientData } from '@/test/factories/index.js'
import { DeleteRecipientUseCase } from './delete-recipient-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

describe('delete recipient use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let sut: DeleteRecipientUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    sut = new DeleteRecipientUseCase(recipientsRepository)
  })

  it('should delete recipient when it exists', async () => {
    await recipientsRepository.create(makeRecipientData())

    const recipientId = recipientsRepository.items[0].id

    const result = await sut.execute({ recipientId })

    expect(result.isRight()).toBe(true)
    expect(recipientsRepository.items).toHaveLength(0)
  })

  it('should return not found when recipient does not exist', async () => {
    const result = await sut.execute({ recipientId: 'not-found-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
