import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { DeleteCourierUseCase } from './delete-courier-use-case.js'
import { Role } from '@/domain/entities/role.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { makeUserData } from '@/test/factories/index.js'

describe('delete courier use case', () => {
  let usersRepository: InMemoryUsersRepository
  let sut: DeleteCourierUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteCourierUseCase(usersRepository)
  })

  it('should delete a courier when it exists', async () => {
    await usersRepository.create(makeUserData({ role: Role.COURIER }))

    const courierId = usersRepository.items[0].id

    const result = await sut.execute({ courierId })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(0)
  })

  it('should return not found when user is not a courier', async () => {
    await usersRepository.create(makeUserData({ role: Role.ADMIN }))

    const adminId = usersRepository.items[0].id

    const result = await sut.execute({ courierId: adminId })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
