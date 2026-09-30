import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeCourier,
  makeAccessToken,
  makeRecipient,
  makeOrder,
  makeAttachment,
} from '@/test/factories/index.js'

describe('Get Courier Order (E2E)', () => {
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

  test('[GET] /orders/me/:id - courier can get WAITING order', async () => {
    const courier = await makeCourier(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient-1@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/me/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      order: {
        id: order.id,
        status: 'WAITING',
      },
    })
  })

  test('[GET] /orders/me/:id - courier can get own assigned order with attachments', async () => {
    const courier = await makeCourier(prisma, { cpf: '38937165471' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient-2@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier.id,
    })

    const attachment = await makeAttachment(prisma, {
      orderId: order.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/me/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      order: {
        id: order.id,
        status: 'WITHDRAWN',
        courierId: courier.id,
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

  test('[GET] /orders/me/:id - 403 for another courier non-WAITING order', async () => {
    const courier1 = await makeCourier(prisma, { cpf: '48937165472' })
    const courier2 = await makeCourier(prisma, { cpf: '58937165473' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient-3@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier1.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier2.id,
      role: courier2.role,
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/me/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })

  test('[GET] /orders/me/:id - 404 for non-existent order', async () => {
    const courier = await makeCourier(prisma, { cpf: '68937165474' })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/me/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(404)
  })
})
