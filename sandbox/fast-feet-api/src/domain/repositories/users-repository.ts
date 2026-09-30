import { Injectable } from '@nestjs/common'
import type { User, CreateUserData } from '@/domain/entities/user.js'
import type { Role } from '@/domain/entities/role.js'

@Injectable()
export abstract class UsersRepository {
  abstract create(data: CreateUserData): Promise<void>
  abstract findByCpf(cpf: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract findManyByRole(params: {
    role: Role
    page: number
    perPage: number
  }): Promise<User[]>
  abstract save(user: User): Promise<void>
  abstract delete(id: string): Promise<void>
}
