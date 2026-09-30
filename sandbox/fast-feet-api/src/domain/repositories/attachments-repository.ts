import { Injectable } from '@nestjs/common'
import type {
  Attachment,
  CreateAttachmentData,
} from '@/domain/entities/attachment.js'

@Injectable()
export abstract class AttachmentsRepository {
  abstract create(data: CreateAttachmentData): Promise<Attachment>
  abstract findByOrderId(orderId: string): Promise<Attachment[]>
}
