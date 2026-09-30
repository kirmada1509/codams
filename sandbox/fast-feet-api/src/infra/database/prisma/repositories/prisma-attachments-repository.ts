import { Injectable } from '@nestjs/common'
import { AttachmentsRepository } from '@/domain/repositories/attachments-repository.js'
import type { CreateAttachmentData } from '@/domain/entities/attachment.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAttachmentData) {
    const attachment = await this.prisma.attachment.create({
      data: {
        id: data.id,
        title: data.title,
        url: data.url,
        orderId: data.orderId,
      },
    })
    return attachment
  }

  async findByOrderId(orderId: string) {
    return this.prisma.attachment.findMany({
      where: { orderId },
    })
  }
}
