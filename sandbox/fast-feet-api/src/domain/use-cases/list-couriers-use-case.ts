import { Injectable } from '@nestjs/common'
import { Either, right } from '@/domain/errors/either.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { Role } from '@/domain/entities/role.js'
import type { User } from '@/domain/entities/user.js'

interface ListCouriersUseCaseRequest {
  page: number
  perPage: number
}

type ListCouriersUseCaseResponse = Either<null, { couriers: User[] }>

@Injectable()
export class ListCouriersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    page,
    perPage,
  }: ListCouriersUseCaseRequest): Promise<ListCouriersUseCaseResponse> {
    const couriers = await this.usersRepository.findManyByRole({
      role: Role.COURIER,
      page,
      perPage,
    })

    return right({ couriers })
  }
}
