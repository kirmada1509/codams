import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'
import type { CreateUserData } from '@/domain/entities/user.js'
import type { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import type { Role } from '@/domain/entities/role.js'

export function makeUserData(
  overrides?: Partial<CreateUserData>
): CreateUserData {
  return {
    name: faker.person.fullName(),
    cpf: faker.string.numeric(11),
    passwordHash: faker.internet.password(),
    role: 'COURIER',
    ...overrides,
  }
}

export interface MakeUserInput {
  id?: string
  name?: string
  cpf?: string
  password?: string
  passwordHash?: string
  role?: Role
}

export interface MakeUserOutput {
  id: string
  name: string
  cpf: string
  passwordHash: string
  role: Role
}

const hasher = new BcryptHasher()

// Counter for unique CPF generation
let cpfCounter = 0

function generateUniqueCpf(): string {
  cpfCounter++
  const base = String(cpfCounter).padStart(9, '0')
  // Simple checksum for valid CPF format
  return `${base}00`
}

export async function makeUser(
  prisma: PrismaService,
  input: MakeUserInput = {}
): Promise<MakeUserOutput> {
  const id = input.id ?? randomUUID()
  const name = input.name ?? 'Test User'
  const cpf = input.cpf ?? generateUniqueCpf()
  const role = input.role ?? 'COURIER'

  // If passwordHash provided, use it; otherwise hash the password
  const passwordHash =
    input.passwordHash ?? (await hasher.hash(input.password ?? '123456'))

  await prisma.user.create({
    data: {
      id,
      name,
      cpf,
      passwordHash,
      role,
    },
  })

  return { id, name, cpf, passwordHash, role }
}

export async function makeAdmin(
  prisma: PrismaService,
  input: Omit<MakeUserInput, 'role'> = {}
): Promise<MakeUserOutput> {
  return makeUser(prisma, { ...input, role: 'ADMIN' })
}

export async function makeCourier(
  prisma: PrismaService,
  input: Omit<MakeUserInput, 'role'> = {}
): Promise<MakeUserOutput> {
  return makeUser(prisma, { ...input, role: 'COURIER' })
}
