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

describe('List Orders (E2E)', () => {
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

  test('[GET] /orders', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })

    await makeOrder(prisma, { recipientId: recipient.id })
    await makeOrder(prisma, { recipientId: recipient.id })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(2)
  })

  test('[GET] /orders?status=PENDING', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165471' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient2@example.com',
    })

    await makeOrder(prisma, { recipientId: recipient.id, status: 'PENDING' })
    await makeOrder(prisma, { recipientId: recipient.id, status: 'WAITING' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders')
      .query({ status: 'PENDING' })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(1)
    expect(response.body.orders[0].status).toBe('PENDING')
  })

  test('[GET] /orders?search=Copacabana', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165472' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient3@example.com',
    })

    await makeOrder(prisma, {
      recipientId: recipient.id,
      title: 'Package in Copacabana',
    })
    await makeOrder(prisma, {
      recipientId: recipient.id,
      title: 'Box in Ipanema',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders')
      .query({ search: 'copacabana' })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(1)
    expect(response.body.orders[0].title).toBe('Package in Copacabana')
  })
})
