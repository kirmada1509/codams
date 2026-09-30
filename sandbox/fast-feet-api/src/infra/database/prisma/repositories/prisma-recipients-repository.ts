import { Injectable } from '@nestjs/common'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import type { CreateRecipientData } from '@/domain/entities/recipient.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import type { Recipient } from '@/domain/entities/recipient.js'

@Injectable()
export class PrismaRecipientsRepository implements RecipientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRecipientData) {
    await this.prisma.recipient.create({ data })
  }

  async findByEmail(email: string) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { email },
    })
    return recipient
  }

  async findById(id: string) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    })
    return recipient
  }

  async findMany({ page, perPage }: { page: number; perPage: number }) {
    const skip = (page - 1) * perPage
    const recipients = await this.prisma.recipient.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    })
    return recipients
  }

  async save(recipient: Recipient) {
    await this.prisma.recipient.update({
      where: { id: recipient.id },
      data: {
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
      },
    })
  }

  async delete(id: string) {
    await this.prisma.recipient.delete({ where: { id } })
  }
}
