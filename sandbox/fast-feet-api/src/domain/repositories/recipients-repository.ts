import { Injectable } from '@nestjs/common'
import type {
  Recipient,
  CreateRecipientData,
} from '@/domain/entities/recipient.js'

@Injectable()
export abstract class RecipientsRepository {
  abstract create(data: CreateRecipientData): Promise<void>
  abstract findByEmail(email: string): Promise<Recipient | null>
  abstract findById(id: string): Promise<Recipient | null>
  abstract findMany(params: {
    page: number
    perPage: number
  }): Promise<Recipient[]>
  abstract save(recipient: Recipient): Promise<void>
  abstract delete(id: string): Promise<void>
}
