import { Injectable } from '@nestjs/common'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import type { CreateUserData } from '@/domain/entities/user.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import type { User } from '@/domain/entities/user.js'
import type { Role } from '@/domain/entities/role.js'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    await this.prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        cpf: data.cpf,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    })
  }

  async findByCpf(cpf: string) {
    const user = await this.prisma.user.findUnique({ where: { cpf } })
    return user
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return user
  }

  async findManyByRole({
    role,
    page,
    perPage,
  }: {
    role: Role
    page: number
    perPage: number
  }) {
    const skip = (page - 1) * perPage
    const users = await this.prisma.user.findMany({
      where: { role },
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    })
    return users
  }

  async save(user: User) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        cpf: user.cpf,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    })
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } })
  }
}
