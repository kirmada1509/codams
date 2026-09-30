import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { EnvModule } from '@/infra/env/env.module.js'
import { UsersRepository } from '@/domain/repositories/users-repository.js'
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { PrismaRecipientsRepository } from '@/infra/database/prisma/repositories/prisma-recipients-repository.js'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { PrismaOrdersRepository } from '@/infra/database/prisma/repositories/prisma-orders-repository.js'
import { AttachmentsRepository } from '@/domain/repositories/attachments-repository.js'
import { PrismaAttachmentsRepository } from '@/infra/database/prisma/repositories/prisma-attachments-repository.js'
import { NotificationsRepository } from '@/domain/repositories/notifications-repository.js'
import { PrismaNotificationsRepository } from '@/infra/database/prisma/repositories/prisma-notifications-repository.js'
import { RefreshTokensRepository } from '@/domain/repositories/refresh-tokens-repository.js'
import { PrismaRefreshTokensRepository } from '@/infra/database/prisma/repositories/prisma-refresh-tokens-repository.js'

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RecipientsRepository,
      useClass: PrismaRecipientsRepository,
    },
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
    {
      provide: RefreshTokensRepository,
      useClass: PrismaRefreshTokensRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    RecipientsRepository,
    OrdersRepository,
    AttachmentsRepository,
    NotificationsRepository,
    RefreshTokensRepository,
  ],
})
export class DatabaseModule {}
