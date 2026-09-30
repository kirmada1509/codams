import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/domain/errors/either.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import type { User } from '@/domain/entities/user.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

interface GetProfileUseCaseRequest {
  userId: string
}

type GetProfileUseCaseResponse = Either<ResourceNotFoundError, { user: User }>

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetProfileUseCaseRequest): Promise<GetProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError(userId))
    }

    return right({ user })
  }
}
