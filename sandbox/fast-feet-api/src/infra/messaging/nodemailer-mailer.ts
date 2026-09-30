import { Injectable } from '@nestjs/common'
import { Mailer, SendMailData } from '@/domain/messaging/mailer.js'
import { EnvService } from '@/infra/env/env.service.js'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

@Injectable()
export class NodemailerMailer implements Mailer {
  private transporter: Transporter

  constructor(private readonly env: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.env.get('MAIL_HOST'),
      port: this.env.get('MAIL_PORT'),
      auth: {
        user: this.env.get('MAIL_USER'),
        pass: this.env.get('MAIL_PASS'),
      },
    })
  }

  async send({ to, subject, body }: SendMailData): Promise<void> {
    const from = this.env.get('MAIL_FROM')
    console.log(
      `[Mailer] Sending email to=${to} subject="${subject}" from=${from}`
    )
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text: body,
      })
      console.log(`[Mailer] Email sent messageId=${info.messageId}`)
    } catch (error) {
      console.error('[Mailer] Failed to send email:', error)
      throw error
    }
  }
}
