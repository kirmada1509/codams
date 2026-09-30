import { Injectable } from '@nestjs/common'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { RecipientAlreadyExistsError } from '@/domain/errors/recipient-already-exists-errors.js'

interface CreateRecipientUseCaseRequest {
  name: string
  email: string
  phone?: string
}

type CreateRecipientUseCaseResponse = Either<RecipientAlreadyExistsError, null>

@Injectable()
export class CreateRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    name,
    email,
    phone,
  }: CreateRecipientUseCaseRequest): Promise<CreateRecipientUseCaseResponse> {
    const recipientWithSameEmail =
      await this.recipientsRepository.findByEmail(email)

    if (recipientWithSameEmail) {
      return left(new RecipientAlreadyExistsError(email))
    }

    await this.recipientsRepository.create({
      name,
      email,
      phone,
    })

    return right(null)
  }
}
