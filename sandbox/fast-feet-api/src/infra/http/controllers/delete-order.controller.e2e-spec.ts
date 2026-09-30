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
} from '@/test/factories/index.js'

describe('Delete Order (E2E)', () => {
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

  test('[DELETE] /orders/:id - physical delete for WAITING order', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .delete(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    })

    expect(orderOnDatabase).toBeNull()
  })

  test('[DELETE] /orders/:id - soft delete for DELIVERED order', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165471' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient2@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'DELIVERED',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .delete(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    })

    expect(orderOnDatabase).not.toBeNull()
    expect(orderOnDatabase?.deletedAt).not.toBeNull()
    expect(orderOnDatabase?.deletedAt).toBeInstanceOf(Date)

    // A subsequent standard GET should return 404
    const getResponse = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(getResponse.statusCode).toBe(404)
  })
})
