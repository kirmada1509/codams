import { Injectable } from '@nestjs/common'
import { RefreshTokensRepository } from '@/domain/repositories/refresh-tokens-repository.js'
import type {
  RefreshToken,
  CreateRefreshTokenData,
} from '@/domain/entities/refresh-token.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenData): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        familyId: data.familyId,
        expiresAt: data.expiresAt,
      },
    })
  }

  async findByToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    })
  }

  async revokeByToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token: tokenHash },
      data: { revoked: true },
    })
  }

  async revokeByFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revoked: true },
    })
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    })
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  }
}
