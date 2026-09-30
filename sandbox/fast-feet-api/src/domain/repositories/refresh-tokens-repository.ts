import { Injectable } from '@nestjs/common'
import type {
  RefreshToken,
  CreateRefreshTokenData,
} from '@/domain/entities/refresh-token.js'

@Injectable()
export abstract class RefreshTokensRepository {
  abstract create(data: CreateRefreshTokenData): Promise<void>
  abstract findByToken(tokenHash: string): Promise<RefreshToken | null>
  abstract revokeByToken(tokenHash: string): Promise<void>
  abstract revokeByFamily(familyId: string): Promise<void>
  abstract revokeAllByUserId(userId: string): Promise<void>
  abstract deleteExpired(): Promise<void>
}
