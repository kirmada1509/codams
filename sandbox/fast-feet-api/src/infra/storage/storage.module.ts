import { Uploader } from '@/domain/storage/uploader.js'
import { Module } from '@nestjs/common'
import { R2Storage } from './r2-storage.js'
import { EnvModule } from '../env/env.module.js'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: R2Storage,
    },
  ],
  exports: [Uploader],
})
export class StorageModule {}
