import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { Either, left, right } from '@/domain/errors/either.js'
import { InvalidCredentialsError } from '@/domain/errors/invalid-credentials-errors.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { RefreshTokensRepository } from '@/domain/repositories/refresh-tokens-repository.js'
import { HashComparer } from '@/domain/cryptography/hash-comparer.js'
import { Encrypter } from '@/domain/cryptography/encrypter.js'
import { TokenHasher } from '@/domain/cryptography/token-hasher.js'
import type { User } from '@/domain/entities/user.js'

interface AuthenticateUserUseCaseRequest {
  cpf: string
  password: string
  refreshTokenExpiresInMs: number
}

type AuthenticateUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string
    refreshToken: string
    user: User
  }
>

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly tokenHasher: TokenHasher
  ) {}

  async execute({
    cpf,
    password,
    refreshTokenExpiresInMs,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findByCpf(cpf)

    if (!user) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.passwordHash
    )

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    })

    const rawRefreshToken = this.tokenHasher.generate()
    const refreshTokenHash = this.tokenHasher.hash(rawRefreshToken)

    await this.refreshTokensRepository.create({
      token: refreshTokenHash,
      userId: user.id,
      familyId: randomUUID(),
      expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
    })

    return right({ accessToken, refreshToken: rawRefreshToken, user })
  }
}
