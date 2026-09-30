export interface RefreshToken {
  id: string
  token: string
  userId: string
  familyId: string
  revoked: boolean
  expiresAt: Date
  createdAt: Date
}

export interface CreateRefreshTokenData {
  token: string
  userId: string
  familyId: string
  expiresAt: Date
}
