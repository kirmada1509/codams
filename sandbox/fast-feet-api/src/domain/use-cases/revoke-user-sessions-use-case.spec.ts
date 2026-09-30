import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { InMemoryRefreshTokensRepository } from '@/test/repositories/in-memory-refresh-tokens-repository.js'
import { RevokeUserSessionsUseCase } from './revoke-user-sessions-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { makeUserData } from '@/test/factories/index.js'

describe('revoke user sessions use case', () => {
  let usersRepository: InMemoryUsersRepository
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let sut: RevokeUserSessionsUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new RevokeUserSessionsUseCase(usersRepository, refreshTokensRepository)
  })

  it('should revoke all sessions for a user', async () => {
    await usersRepository.create(makeUserData({ id: 'user-1' }))

    await refreshTokensRepository.create({
      token: 'token-1',
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 1000),
    })

    await refreshTokensRepository.create({
      token: 'token-2',
      userId: 'user-1',
      familyId: 'family-2',
      expiresAt: new Date(Date.now() + 1000),
    })

    const result = await sut.execute({ userId: 'user-1' })

    expect(result.isRight()).toBe(true)
    expect(refreshTokensRepository.items.every((t) => t.revoked)).toBe(true)
  })

  it('should not revoke tokens of other users', async () => {
    await usersRepository.create(makeUserData({ id: 'user-1' }))

    await refreshTokensRepository.create({
      token: 'token-user1',
      userId: 'user-1',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 1000),
    })

    await refreshTokensRepository.create({
      token: 'token-other',
      userId: 'other-user',
      familyId: 'family-2',
      expiresAt: new Date(Date.now() + 1000),
    })

    await sut.execute({ userId: 'user-1' })

    const otherToken = refreshTokensRepository.items.find(
      (t) => t.userId === 'other-user'
    )
    expect(otherToken?.revoked).toBe(false)
  })

  it('should return error for non-existent user', async () => {
    const result = await sut.execute({ userId: 'non-existent' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
