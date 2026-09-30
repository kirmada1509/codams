import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { GetProfileUseCase } from './get-profile-use-case.js'
import { Role } from '@/domain/entities/role.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { makeUserData } from '@/test/factories/index.js'

describe('get profile use case', () => {
  let usersRepository: InMemoryUsersRepository
  let sut: GetProfileUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetProfileUseCase(usersRepository)
  })

  it('should return a profile for a courier', async () => {
    await usersRepository.create(makeUserData({ role: Role.COURIER }))

    const userId = usersRepository.items[0].id

    const result = await sut.execute({ userId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user.id).toBe(userId)
      expect(result.value.user.role).toBe(Role.COURIER)
    }
  })

  it('should return a profile for an admin', async () => {
    await usersRepository.create(makeUserData({ role: Role.ADMIN }))

    const userId = usersRepository.items[0].id

    const result = await sut.execute({ userId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user.id).toBe(userId)
      expect(result.value.user.role).toBe(Role.ADMIN)
    }
  })

  it('should return not found when user does not exist', async () => {
    const result = await sut.execute({ userId: 'non-existent-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
