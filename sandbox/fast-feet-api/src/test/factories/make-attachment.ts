import { randomUUID } from 'node:crypto'
import type { PrismaService } from '@/infra/database/prisma/prisma.service.js'

export interface MakeAttachmentInput {
  id?: string
  title?: string
  url?: string
  orderId: string
}

export interface MakeAttachmentOutput {
  id: string
  title: string
  url: string
  orderId: string
}

export async function makeAttachment(
  prisma: PrismaService,
  input: MakeAttachmentInput
): Promise<MakeAttachmentOutput> {
  const id = input.id ?? randomUUID()
  const title = input.title ?? 'delivery-photo.jpg'
  const url = input.url ?? `${randomUUID()}-delivery-photo.jpg`

  await prisma.attachment.create({
    data: {
      id,
      title,
      url,
      orderId: input.orderId,
    },
  })

  return {
    id,
    title,
    url,
    orderId: input.orderId,
  }
}
