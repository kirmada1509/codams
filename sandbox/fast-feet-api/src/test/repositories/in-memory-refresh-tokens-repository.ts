import { RefreshTokensRepository } from '@/domain/repositories/refresh-tokens-repository.js'
import type {
  RefreshToken,
  CreateRefreshTokenData,
} from '@/domain/entities/refresh-token.js'
import { randomUUID } from 'node:crypto'

export class InMemoryRefreshTokensRepository implements RefreshTokensRepository {
  public items: RefreshToken[] = []

  async create(data: CreateRefreshTokenData): Promise<void> {
    this.items.push({
      id: randomUUID(),
      token: data.token,
      userId: data.userId,
      familyId: data.familyId,
      revoked: false,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    })
  }

  async findByToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.items.find((item) => item.token === tokenHash) ?? null
  }

  async revokeByToken(tokenHash: string): Promise<void> {
    const item = this.items.find((item) => item.token === tokenHash)
    if (item) {
      item.revoked = true
    }
  }

  async revokeByFamily(familyId: string): Promise<void> {
    this.items
      .filter((item) => item.familyId === familyId)
      .forEach((item) => {
        item.revoked = true
      })
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    this.items
      .filter((item) => item.userId === userId)
      .forEach((item) => {
        item.revoked = true
      })
  }

  async deleteExpired(): Promise<void> {
    const now = new Date()
    this.items = this.items.filter((item) => item.expiresAt > now)
  }
}
