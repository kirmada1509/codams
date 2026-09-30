import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'
import { EnvService } from '@/infra/env/env.service.js'

const tokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(['ADMIN', 'COURIER']),
})

export type TokenPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(envService: EnvService) {
    const secret = envService.get('JWT_SECRET')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      algorithms: ['HS256'],
    })
  }

  validate(payload: TokenPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}
