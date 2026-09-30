import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { RefreshTokensRepository } from '@/domain/repositories/refresh-tokens-repository.js'

interface RevokeUserSessionsUseCaseRequest {
  userId: string
}

type RevokeUserSessionsUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class RevokeUserSessionsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository
  ) {}

  async execute({
    userId,
  }: RevokeUserSessionsUseCaseRequest): Promise<RevokeUserSessionsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError(userId))
    }

    await this.refreshTokensRepository.revokeAllByUserId(userId)

    return right(null)
  }
}
