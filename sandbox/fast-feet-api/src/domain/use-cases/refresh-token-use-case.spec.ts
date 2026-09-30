import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { InMemoryRefreshTokensRepository } from '@/test/repositories/in-memory-refresh-tokens-repository.js'
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter.js'
import { FakeTokenHasher } from '@/test/cryptography/fake-token-hasher.js'
import { RefreshTokenUseCase } from './refresh-token-use-case.js'
import { InvalidRefreshTokenError } from '../errors/invalid-refresh-token-error.js'
import { RefreshTokenReuseDetectedError } from '../errors/refresh-token-reuse-detected-error.js'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

describe('refresh token use case', () => {
  let usersRepository: InMemoryUsersRepository
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let encrypter: FakeEncrypter
  let tokenHasher: FakeTokenHasher
  let sut: RefreshTokenUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    encrypter = new FakeEncrypter()
    tokenHasher = new FakeTokenHasher()
    sut = new RefreshTokenUseCase(
      refreshTokensRepository,
      usersRepository,
      encrypter,
      tokenHasher
    )
  })

  it('should rotate tokens successfully', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: 'hashed',
      role: 'COURIER',
    })

    const rawToken = 'original-token'
    await refreshTokensRepository.create({
      token: tokenHasher.hash(rawToken),
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
    })

    const result = await sut.execute({
      refreshToken: rawToken,
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.accessToken).toEqual(expect.any(String))
      expect(result.value.refreshToken).toEqual(expect.any(String))
      expect(result.value.refreshToken).not.toBe(rawToken)
    }
  })

  it('should revoke old token after rotation', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: 'hashed',
      role: 'COURIER',
    })

    const rawToken = 'original-token'
    await refreshTokensRepository.create({
      token: tokenHasher.hash(rawToken),
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
    })

    await sut.execute({
      refreshToken: rawToken,
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    const oldToken = refreshTokensRepository.items.find(
      (t) => t.token === tokenHasher.hash(rawToken)
    )
    expect(oldToken?.revoked).toBe(true)
    expect(refreshTokensRepository.items).toHaveLength(2)
  })

  it('should preserve family id across rotations', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: 'hashed',
      role: 'COURIER',
    })

    const rawToken = 'original-token'
    await refreshTokensRepository.create({
      token: tokenHasher.hash(rawToken),
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
    })

    await sut.execute({
      refreshToken: rawToken,
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    const newToken = refreshTokensRepository.items.find((t) => !t.revoked)
    expect(newToken?.familyId).toBe('family-1')
  })

  it('should reject non-existent token', async () => {
    const result = await sut.execute({
      refreshToken: 'non-existent',
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should detect reuse of revoked token and revoke entire family', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: 'hashed',
      role: 'COURIER',
    })

    const rawToken = 'stolen-token'
    await refreshTokensRepository.create({
      token: tokenHasher.hash(rawToken),
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
    })

    // Simulate: legitimate user already rotated this token
    await refreshTokensRepository.revokeByToken(tokenHasher.hash(rawToken))

    // Create a newer token in the same family (the legitimate rotation)
    await refreshTokensRepository.create({
      token: tokenHasher.hash('legitimate-new-token'),
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
    })

    // Attacker tries to reuse the stolen (revoked) token
    const result = await sut.execute({
      refreshToken: rawToken,
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(RefreshTokenReuseDetectedError)

    // All tokens in the family should be revoked
    const familyTokens = refreshTokensRepository.items.filter(
      (t) => t.familyId === 'family-1'
    )
    expect(familyTokens.every((t) => t.revoked)).toBe(true)
  })

  it('should reject expired token', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: 'hashed',
      role: 'COURIER',
    })

    const rawToken = 'expired-token'
    await refreshTokensRepository.create({
      token: tokenHasher.hash(rawToken),
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() - 1000), // already expired
    })

    const result = await sut.execute({
      refreshToken: rawToken,
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should reject token for deleted user', async () => {
    const rawToken = 'orphan-token'
    await refreshTokensRepository.create({
      token: tokenHasher.hash(rawToken),
      userId: 'deleted-user',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
    })

    const result = await sut.execute({
      refreshToken: rawToken,
      refreshTokenExpiresInMs: SEVEN_DAYS_MS,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })
})
