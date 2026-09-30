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
  makeCourier,
} from '@/test/factories/index.js'

describe('Mark Order as Waiting (E2E)', () => {
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

  test('[PATCH] /orders/:orderId/waiting - should mark pending order as waiting', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'PENDING',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/waiting`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: { id: order.id },
    })

    expect(orderOnDatabase).toBeTruthy()
    expect(orderOnDatabase?.status).toBe('WAITING')
  })

  test('[PATCH] /orders/:orderId/waiting - should return 404 when order does not exist', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165471' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch('/orders/550e8400-e29b-41d4-a716-446655440000/waiting')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(404)
  })

  test('[PATCH] /orders/:orderId/waiting - should return 400 when order is not pending', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165472' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient2@example.com',
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
      .patch(`/orders/${order.id}/waiting`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400)
  })

  test('[PATCH] /orders/:orderId/waiting - should return 401 when user is not authenticated', async () => {
    const recipient = await makeRecipient(prisma, {
      email: 'recipient3@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'PENDING',
    })

    const response = await request(app.getHttpServer()).patch(
      `/orders/${order.id}/waiting`
    )

    expect(response.statusCode).toBe(401)
  })

  test('[PATCH] /orders/:orderId/waiting - should return 403 when user is not an admin', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '28937165473' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient4@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'PENDING',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/waiting`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
