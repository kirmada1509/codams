import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/domain/errors/either.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { Role } from '@/domain/entities/role.js'
import type { User } from '@/domain/entities/user.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

interface GetCourierUseCaseRequest {
  courierId: string
}

type GetCourierUseCaseResponse = Either<ResourceNotFoundError, { courier: User }>

@Injectable()
export class GetCourierUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    courierId,
  }: GetCourierUseCaseRequest): Promise<GetCourierUseCaseResponse> {
    const courier = await this.usersRepository.findById(courierId)

    if (!courier || courier.role !== Role.COURIER) {
      return left(new ResourceNotFoundError(courierId))
    }

    return right({ courier })
  }
}
