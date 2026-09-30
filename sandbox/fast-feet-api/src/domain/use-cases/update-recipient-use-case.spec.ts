import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { makeRecipientData } from '@/test/factories/index.js'
import { UpdateRecipientUseCase } from './update-recipient-use-case.js'
import { RecipientAlreadyExistsError } from '../errors/recipient-already-exists-errors.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

describe('update recipient use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let sut: UpdateRecipientUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    sut = new UpdateRecipientUseCase(recipientsRepository)
  })

  it('should update recipient data when it exists', async () => {
    await recipientsRepository.create(makeRecipientData())

    const recipientId = recipientsRepository.items[0].id

    const result = await sut.execute({
      recipientId,
      name: 'Recipient Updated',
      email: 'recipient.updated@example.com',
      phone: '11888888888',
    })

    expect(result.isRight()).toBe(true)
    expect(recipientsRepository.items[0].name).toBe('Recipient Updated')
    expect(recipientsRepository.items[0].email).toBe(
      'recipient.updated@example.com'
    )
    expect(recipientsRepository.items[0].phone).toBe('11888888888')
  })

  it('should not update when email is already in use', async () => {
    await recipientsRepository.create(makeRecipientData())
    await recipientsRepository.create(
      makeRecipientData({ email: 'recipient.two@example.com' })
    )

    const recipientId = recipientsRepository.items[0].id

    const result = await sut.execute({
      recipientId,
      email: 'recipient.two@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(RecipientAlreadyExistsError)
  })

  it('should return not found when recipient does not exist', async () => {
    const result = await sut.execute({
      recipientId: 'not-found-id',
      name: 'Recipient Updated',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
