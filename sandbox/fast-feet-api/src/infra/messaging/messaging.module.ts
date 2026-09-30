import { Module } from '@nestjs/common'
import { Mailer } from '@/domain/messaging/mailer.js'
import { NodemailerMailer } from '@/infra/messaging/nodemailer-mailer.js'
import { EnvModule } from '@/infra/env/env.module.js'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Mailer,
      useClass: NodemailerMailer,
    },
  ],
  exports: [Mailer],
})
export class MessagingModule {}
