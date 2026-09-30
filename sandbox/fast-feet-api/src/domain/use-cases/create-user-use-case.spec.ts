import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { FakeHashGenerator } from '@/test/cryptography/fake-hash-generator.js'
import { CreateUserUseCase } from './create-user-use-case.js'
import { UserAlreadyExistsError } from '../errors/user-already-exists-errors.js'
import { makeUserData } from '@/test/factories/index.js'

describe('create user use case', () => {
  let usersRepository: InMemoryUsersRepository
  let hashGenerator: FakeHashGenerator
  let sut: CreateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hashGenerator = new FakeHashGenerator()
    sut = new CreateUserUseCase(usersRepository, hashGenerator)
  })
  it('should be able to create a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      cpf: '12345678909',
      password: '123456',
      role: 'COURIER',
    })

    expect(result.isRight()).toBe(true)
  })

  it('should not be able to create a new user with same cpf', async () => {
    await usersRepository.create(
      makeUserData({
        cpf: '12345678909',
        passwordHash: await hashGenerator.hash('123456'),
      })
    )

    const result = await sut.execute({
      name: 'John Doe',
      cpf: '12345678909',
      password: '123456',
      role: 'COURIER',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
