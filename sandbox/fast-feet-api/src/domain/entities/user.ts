import type { Role } from './role.js'

export interface User {
  id: string
  name: string
  cpf: string
  passwordHash: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  id?: string
  name: string
  cpf: string
  passwordHash: string
  role?: Role
}
