export interface SendMailData {
  to: string
  subject: string
  body: string
}

export abstract class Mailer {
  abstract send(data: SendMailData): Promise<void>
}
