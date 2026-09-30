import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { ListCouriersUseCase } from './list-couriers-use-case.js'
import { Role } from '@/domain/entities/role.js'
import { makeUserData } from '@/test/factories/index.js'

describe('list couriers use case', () => {
  let usersRepository: InMemoryUsersRepository
  let sut: ListCouriersUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ListCouriersUseCase(usersRepository)
  })

  it('should list couriers with pagination when requested', async () => {
    await usersRepository.create(makeUserData({ role: Role.ADMIN }))
    await usersRepository.create(makeUserData({ role: Role.COURIER }))
    await usersRepository.create(makeUserData({ role: Role.COURIER }))
    await usersRepository.create(makeUserData({ role: Role.COURIER }))

    const result = await sut.execute({ page: 1, perPage: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.couriers).toHaveLength(2)
      expect(
        result.value.couriers.every((user) => user.role === Role.COURIER)
      ).toBe(true)
    }
  })

  it('should return the next page of couriers when paginating', async () => {
    await usersRepository.create(makeUserData({ role: Role.COURIER }))
    await usersRepository.create(makeUserData({ role: Role.COURIER }))
    await usersRepository.create(makeUserData({ role: Role.COURIER }))

    const result = await sut.execute({ page: 2, perPage: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.couriers).toHaveLength(1)
    }
  })
})
