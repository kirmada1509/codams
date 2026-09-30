import { AttachmentsRepository } from '@/domain/repositories/attachments-repository.js'
import type { CreateAttachmentData } from '@/domain/entities/attachment.js'
import type { Attachment } from '@/domain/entities/attachment.js'
import { randomUUID } from 'node:crypto'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  async create(data: CreateAttachmentData): Promise<Attachment> {
    const attachment: Attachment = {
      id: data.id ?? randomUUID(),
      title: data.title,
      url: data.url,
      orderId: data.orderId,
      createdAt: new Date(),
    }

    this.items.push(attachment)

    return attachment
  }

  async findByOrderId(orderId: string): Promise<Attachment[]> {
    return this.items.filter((item) => item.orderId === orderId)
  }
}
