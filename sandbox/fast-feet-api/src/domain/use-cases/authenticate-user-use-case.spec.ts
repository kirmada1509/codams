import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { InMemoryRefreshTokensRepository } from '@/test/repositories/in-memory-refresh-tokens-repository.js'
import { AuthenticateUserUseCase } from './authenticate-user-use-case.js'
import { FakeHashGenerator } from '@/test/cryptography/fake-hash-generator.js'
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter.js'
import { FakeHashComparer } from '@/test/cryptography/fake-hash-comparer.js'
import { FakeTokenHasher } from '@/test/cryptography/fake-token-hasher.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-errors.js'
import { makeUserData } from '@/test/factories/index.js'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

describe('authenticate user use case', () => {
  let usersRepository: InMemoryUsersRepository
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let fakeHashGenerator: FakeHashGenerator
  let fakeHashComparer: FakeHashComparer
  let encrypter: FakeEncrypter
  let tokenHasher: FakeTokenHasher
  let sut: AuthenticateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    fakeHashGenerator = new FakeHashGenerator()
    encrypter = new FakeEncrypter()
    fakeHashComparer = new FakeHashComparer()
    tokenHasher = new FakeTokenHasher()
    sut = new AuthenticateUserUseCase(
      usersRepository,
      fakeHashComparer,
      encrypter,
      refreshTokensRepository,
      tokenHasher
    )
  })

  it('should be able to authenticate a user', async () => {
    await usersRepository.create(
      makeUserData({
        name: 'John Doe',
        cpf: '12345678909',
        passwordHash: await fakeHashGenerator.hash('123456'),
      })
    )

    const result = await sut.execute({
      cpf: '12345678909',
      password: '123456',
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.accessToken).toEqual(expect.any(String))
      expect(result.value.refreshToken).toEqual(expect.any(String))
      expect(result.value.user).toEqual(
        expect.objectContaining({
          cpf: '12345678909',
          name: 'John Doe',
          role: 'COURIER',
        })
      )
    }
  })

  it('should persist refresh token on successful authentication', async () => {
    await usersRepository.create(
      makeUserData({
        name: 'John Doe',
        cpf: '12345678909',
        passwordHash: await fakeHashGenerator.hash('123456'),
      })
    )

    await sut.execute({
      cpf: '12345678909',
      password: '123456',
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(refreshTokensRepository.items).toHaveLength(1)
    expect(refreshTokensRepository.items[0].revoked).toBe(false)
  })

  it('should not be able to authenticate a user with wrong credentials', async () => {
    await usersRepository.create(
      makeUserData({
        name: 'John Doe',
        cpf: '12345678909',
        passwordHash: await fakeHashGenerator.hash('123456'),
      })
    )

    const result = await sut.execute({
      cpf: '12345678909',
      password: 'wrong-password',
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
