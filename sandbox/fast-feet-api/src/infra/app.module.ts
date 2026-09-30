import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from '@/infra/env/env.js'
import { EnvModule } from '@/infra/env/env.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module.js'
import { HttpModule } from '@/infra/http/http.module.js'
import { AuthModule } from '@/infra/auth/auth.module.js'
import { StorageModule } from '@/infra/storage/storage.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    DatabaseModule,
    CryptographyModule,
    HttpModule,
    AuthModule,
    StorageModule,
  ],
})
export class AppModule {}
