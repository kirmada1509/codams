import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/domain/errors/either.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { Role } from '@/domain/entities/role.js'

interface DeleteCourierUseCaseRequest {
  courierId: string
}

type DeleteCourierUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteCourierUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    courierId,
  }: DeleteCourierUseCaseRequest): Promise<DeleteCourierUseCaseResponse> {
    const courier = await this.usersRepository.findById(courierId)

    if (!courier || courier.role !== Role.COURIER) {
      return left(new ResourceNotFoundError(courierId))
    }

    await this.usersRepository.delete(courierId)

    return right(null)
  }
}
