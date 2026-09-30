import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeAdmin,
  makeAccessToken,
  makeRecipient,
  makeOrder,
  makeAttachment,
} from '@/test/factories/index.js'

describe('Get Order (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const { AppModule } = await import('@/infra/app.module.js')

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /orders/:id', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      street: 'Av Paulista',
    })

    const attachment = await makeAttachment(prisma, {
      orderId: order.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      order: {
        id: order.id,
        status: 'WAITING',
        street: 'Av Paulista',
        recipientId: recipient.id,
        recipient: {
          id: recipient.id,
          name: recipient.name,
          email: 'recipient@example.com',
        },
        attachments: [
          {
            id: attachment.id,
            title: attachment.title,
            url: expect.stringContaining(attachment.url),
          },
        ],
      },
    })
  })
})
