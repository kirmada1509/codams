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

describe('List Available Orders (E2E)', () => {
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

  test('[GET] /orders/available', async () => {
    const courier = await makeCourier(prisma, { cpf: '96710062058' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })

    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      city: 'São Paulo',
      neighborhood: 'Bela Vista',
    })

    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      city: 'Campinas',
      neighborhood: 'Cambuí',
    })

    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier.id,
      city: 'São Paulo',
      neighborhood: 'Centro',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const responseAll = await request(app.getHttpServer())
      .get('/orders/available')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(responseAll.statusCode).toBe(200)
    expect(responseAll.body.orders).toHaveLength(2)

    const responseSearch = await request(app.getHttpServer())
      .get('/orders/available')
      .query({ search: 'Campinas' })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(responseSearch.statusCode).toBe(200)
    expect(responseSearch.body.orders).toHaveLength(1)
    expect(responseSearch.body.orders[0].city).toBe('Campinas')
  })
})
