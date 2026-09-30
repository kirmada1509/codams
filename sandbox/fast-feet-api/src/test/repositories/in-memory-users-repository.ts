import { UsersRepository } from '@/domain/repositories/users-repository.js'
import type { CreateUserData } from '@/domain/entities/user.js'
import type { User } from '@/domain/entities/user.js'
import { Role } from '@/domain/entities/role.js'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async create(data: CreateUserData): Promise<void> {
    const user: User = {
      id: data.id ?? randomUUID(),
      name: data.name,
      cpf: data.cpf,
      passwordHash: data.passwordHash,
      role: data.role ?? Role.COURIER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(user)

    return Promise.resolve()
  }

  findByCpf(cpf: string): Promise<User | null> {
    const user = this.items.find((item) => item.cpf === cpf)

    if (!user) {
      return Promise.resolve(null)
    }

    return Promise.resolve(user)
  }

  findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return Promise.resolve(null)
    }

    return Promise.resolve(user)
  }

  findManyByRole({
    role,
    page,
    perPage,
  }: {
    role: Role
    page: number
    perPage: number
  }): Promise<User[]> {
    const start = (page - 1) * perPage
    const users = this.items
      .filter((item) => item.role === role)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return Promise.resolve(users.slice(start, start + perPage))
  }

  save(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id)

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...user,
        updatedAt: new Date(),
      }
    }

    return Promise.resolve()
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
    return Promise.resolve()
  }
}
