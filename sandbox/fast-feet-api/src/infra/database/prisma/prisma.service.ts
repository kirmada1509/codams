import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { EnvService } from '@/infra/env/env.service.js'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private envService: EnvService) {
    const databaseUrl = envService.get('DATABASE_URL')
    const schema = envService.get('DATABASE_SCHEMA')

    const adapter = new PrismaPg(
      {
        connectionString: databaseUrl,
        connectionTimeoutMillis: 5_000,
        idleTimeoutMillis: 300_000,
      },
      schema ? { schema } : undefined
    )

    super({
      adapter,
      log: ['warn', 'error'],
    })
  }

  async onModuleInit() {
    await this.$connect()

    try {
      await this.$queryRawUnsafe('SELECT 1')
    } catch (error) {
      throw new Error(
        `Failed to connect to database: ${error instanceof Error ? error.message : error}`
      )
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
