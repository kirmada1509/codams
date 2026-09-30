import { Injectable } from '@nestjs/common'
import type { Role } from '@/domain/entities/role.js'
import { UserAlreadyExistsError } from '@/domain/errors/user-already-exists-errors.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { HashGenerator } from '@/domain/cryptography/hash-generator.js'

interface CreateUserUseCaseRequest {
  name: string
  cpf: string
  password: string
  role: Role
}

type CreateUserUseCaseResponse = Either<UserAlreadyExistsError, null>

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashGenerator: HashGenerator
  ) {}

  async execute({
    name,
    cpf,
    password,
    role,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf)

    if (userWithSameCpf) {
      return left(new UserAlreadyExistsError(cpf))
    }

    const passwordHash = await this.hashGenerator.hash(password)

    await this.usersRepository.create({
      name,
      cpf,
      passwordHash,
      role,
    })

    return right(null)
  }
}
