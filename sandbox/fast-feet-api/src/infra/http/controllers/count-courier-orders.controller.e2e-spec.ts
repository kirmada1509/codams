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
} from '@/test/factories/index.js'

describe('Count Courier Orders (E2E)', () => {
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

  test('[GET] /orders/me/counts - should return counts for each status', async () => {
    const courier1 = await makeCourier(prisma, { cpf: '11111111111' })
    const courier2 = await makeCourier(prisma, { cpf: '22222222222' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })

    // Available orders (WAITING, no courier)
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      latitude: -23.5605,
      longitude: -46.6433,
    })
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Withdrawn orders for courier1
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier1.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Delivered orders for courier1
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'DELIVERED',
      courierId: courier1.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'DELIVERED',
      courierId: courier1.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Orders for courier2 (should not be counted in courier1's withdrawn/delivered)
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier2.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier1.id,
      role: courier1.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/me/counts')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      counts: {
        available: 2,
        withdrawn: 1,
        delivered: 2,
      },
    })
  })
})
