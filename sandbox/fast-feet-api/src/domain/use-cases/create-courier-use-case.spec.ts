import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { FakeHashGenerator } from '@/test/cryptography/fake-hash-generator.js'
import { CreateCourierUseCase } from './create-courier-use-case.js'
import { UserAlreadyExistsError } from '../errors/user-already-exists-errors.js'
import { Role } from '@/domain/entities/role.js'
import { makeUserData } from '@/test/factories/index.js'

describe('create courier use case', () => {
  let usersRepository: InMemoryUsersRepository
  let hashGenerator: FakeHashGenerator
  let sut: CreateCourierUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hashGenerator = new FakeHashGenerator()
    sut = new CreateCourierUseCase(usersRepository, hashGenerator)
  })

  it('should create a courier when cpf is unique', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      cpf: '12345678909',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(1)
    expect(usersRepository.items[0].role).toBe(Role.COURIER)
    expect(usersRepository.items[0].passwordHash).toBe('123456-hashed')
  })

  it('should not create a courier when cpf already exists', async () => {
    await usersRepository.create(
      makeUserData({
        cpf: '12345678909',
        passwordHash: await hashGenerator.hash('123456'),
        role: Role.COURIER,
      })
    )

    const result = await sut.execute({
      name: 'John Doe',
      cpf: '12345678909',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
