import { Module } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service.js'

@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
