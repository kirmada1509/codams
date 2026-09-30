import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { EnvService } from '@/infra/env/env.service.js'
import { EnvModule } from '@/infra/env/env.module.js'
import { JwtStrategy } from '@/infra/auth/jwt.strategy.js'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard.js'
import { RolesGuard } from '@/infra/auth/roles.guard.js'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      global: true,
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        const secret = envService.get('JWT_SECRET')
        const accessTokenExpiresIn = envService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')
        return {
          secret,
          signOptions: {
            algorithm: 'HS256',
            expiresIn: accessTokenExpiresIn,
          },
        }
      },
    }),
    EnvModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
