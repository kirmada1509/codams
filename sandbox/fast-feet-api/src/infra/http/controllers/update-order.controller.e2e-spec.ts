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

describe('Update Order (E2E)', () => {
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

  test('[PATCH] /orders/:id', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      street: 'Av Paulista',
      number: '1000',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}`)
      .send({
        street: 'Rua Augusta',
        number: '2000',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    })

    expect(orderOnDatabase?.street).toBe('Rua Augusta')
    expect(orderOnDatabase?.number).toBe('2000')
  })
})
