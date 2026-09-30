import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeAccessToken,
  makeRecipient,
  makeOrder,
  makeCourier,
} from '@/test/factories/index.js'

describe('Return Order (E2E)', () => {
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

  test('[PATCH] /orders/:orderId/return - should return an order', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '12345678901' })
    const recipient = await makeRecipient(prisma, {
      email: 'return-test@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courierUser.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/return`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: { id: order.id },
    })

    expect(orderOnDatabase).toBeTruthy()
    expect(orderOnDatabase?.status).toBe('RETURNED')
    expect(orderOnDatabase?.returnDate).toBeTruthy()
  })

  test('[PATCH] /orders/:orderId/return - should return 400 when order is not withdrawn', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '12345678902' })
    const recipient = await makeRecipient(prisma, {
      email: 'return-test2@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/return`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400)
  })

  test('[PATCH] /orders/:orderId/return - should return 403 when courier is not the order owner', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '12345678903' })
    const otherCourier = await makeCourier(prisma, { cpf: '12345678904' })
    const recipient = await makeRecipient(prisma, {
      email: 'return-test3@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: otherCourier.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/return`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })

  test('[PATCH] /orders/:orderId/return - should return 404 for non-existent order', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '12345678905' })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/00000000-0000-0000-0000-000000000000/return`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(404)
  })
})
