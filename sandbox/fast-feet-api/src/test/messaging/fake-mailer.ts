import { Mailer, SendMailData } from '@/domain/messaging/mailer.js'

export class FakeMailer implements Mailer {
  public emails: SendMailData[] = []

  async send(data: SendMailData): Promise<void> {
    this.emails.push(data)
  }
}
