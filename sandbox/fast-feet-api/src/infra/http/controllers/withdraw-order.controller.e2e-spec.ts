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

describe('Withdraw Order (E2E)', () => {
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

  test('[PATCH] /orders/:orderId/withdraw - should withdraw an order', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '28937165474' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient5@example.com',
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
      .patch(`/orders/${order.id}/withdraw`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: { id: order.id },
    })

    expect(orderOnDatabase).toBeTruthy()
    expect(orderOnDatabase?.status).toBe('WITHDRAWN')
    expect(orderOnDatabase?.courierId).toBe(courierUser.id)
    expect(orderOnDatabase?.pickupDate).toBeTruthy()
  })

  test('[PATCH] /orders/:orderId/withdraw - should return 400 when order is not waiting', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '28937165475' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient6@example.com',
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
      .patch(`/orders/${order.id}/withdraw`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400)
  })
})
